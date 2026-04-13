import { Op } from 'sequelize'
import { EmailNotificationJob, Match, User } from '../models/index.js'
import emailService from './emailService.js'
import logger from '../utils/logger.js'

const WORKER_ID = `email-worker-${process.pid}`
const DEFAULT_MAX_ATTEMPTS = Number(process.env.EMAIL_JOB_MAX_ATTEMPTS || 5)
const DEFAULT_BATCH_SIZE = Number(process.env.EMAIL_JOB_BATCH_SIZE || 20)
const DEFAULT_POLL_INTERVAL_MS = Number(process.env.EMAIL_JOB_POLL_INTERVAL_MS || 3000)
const DEFAULT_RETRY_BASE_SECONDS = Number(process.env.EMAIL_JOB_RETRY_BASE_SECONDS || 60)
const DEFAULT_RETRY_MAX_SECONDS = Number(process.env.EMAIL_JOB_RETRY_MAX_SECONDS || 1800)
const DEFAULT_MAX_CONCURRENCY = Number(process.env.EMAIL_JOB_MAX_CONCURRENCY || 3)
const DEFAULT_LOCK_TIMEOUT_SECONDS = Number(process.env.EMAIL_JOB_LOCK_TIMEOUT_SECONDS || 120)
const DEFAULT_PER_SECOND_LIMIT = Number(process.env.EMAIL_JOB_PER_SECOND_LIMIT || 2)

let workerTimer = null
let running = false
let bucketWindowSec = Math.floor(Date.now() / 1000)
let sentCountInWindow = 0

const sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const computeRetryDelaySeconds = (attempt) => {
  const exp = Math.max(0, attempt - 1)
  const delay = DEFAULT_RETRY_BASE_SECONDS * (2 ** exp)
  return Math.min(delay, DEFAULT_RETRY_MAX_SECONDS)
}

const maybeThrottle = async () => {
  if (DEFAULT_PER_SECOND_LIMIT <= 0) {
    return
  }
  const currentWindowSec = Math.floor(Date.now() / 1000)
  if (currentWindowSec !== bucketWindowSec) {
    bucketWindowSec = currentWindowSec
    sentCountInWindow = 0
  }
  if (sentCountInWindow >= DEFAULT_PER_SECOND_LIMIT) {
    await sleep(1000 - (Date.now() % 1000))
    bucketWindowSec = Math.floor(Date.now() / 1000)
    sentCountInWindow = 0
  }
  sentCountInWindow += 1
}

const buildDedupeKey = (type, toUserId, matchUserId, matchId) => `${type}:${toUserId}:${matchUserId}:${matchId || 0}`

const enqueueEmailNotification = async ({
  type,
  toUserId,
  matchUserId,
  matchId = null,
  payload = null,
  priority = 100,
  scheduleAt = null
}) => {
  const now = new Date()
  const dedupeKey = buildDedupeKey(type, toUserId, matchUserId, matchId)
  const existing = await EmailNotificationJob.findOne({
    where: {
      dedupe_key: dedupeKey,
      status: {
        [Op.in]: ['pending', 'processing']
      }
    }
  })
  if (existing) {
    return existing
  }
  return EmailNotificationJob.create({
    type,
    to_user_id: toUserId,
    match_user_id: matchUserId,
    match_id: matchId,
    payload,
    priority,
    attempts: 0,
    max_attempts: DEFAULT_MAX_ATTEMPTS,
    scheduled_at: scheduleAt || now,
    next_retry_at: null,
    dedupe_key: dedupeKey
  })
}

const claimPendingJobs = async () => {
  const now = new Date()
  const lockExpiredAt = new Date(Date.now() - DEFAULT_LOCK_TIMEOUT_SECONDS * 1000)
  await EmailNotificationJob.update({
    status: 'pending',
    worker_id: null,
    locked_at: null
  }, {
    where: {
      status: 'processing',
      locked_at: {
        [Op.lt]: lockExpiredAt
      }
    }
  })

  const candidates = await EmailNotificationJob.findAll({
    where: {
      status: 'pending',
      scheduled_at: { [Op.lte]: now },
      [Op.or]: [
        { next_retry_at: null },
        { next_retry_at: { [Op.lte]: now } }
      ]
    },
    order: [
      ['priority', 'ASC'],
      ['scheduled_at', 'ASC'],
      ['id', 'ASC']
    ],
    limit: DEFAULT_BATCH_SIZE
  })
  if (candidates.length === 0) {
    return []
  }

  const ids = candidates.map((item) => item.id)
  await EmailNotificationJob.update({
    status: 'processing',
    worker_id: WORKER_ID,
    locked_at: new Date()
  }, {
    where: {
      id: ids,
      status: 'pending'
    }
  })

  return EmailNotificationJob.findAll({
    where: {
      id: ids,
      status: 'processing',
      worker_id: WORKER_ID
    },
    order: [['priority', 'ASC'], ['id', 'ASC']]
  })
}

const processSingleJob = async (job) => {
  try {
    await maybeThrottle()
    const [toUser, matchUser] = await Promise.all([
      User.findByPk(job.to_user_id),
      User.findByPk(job.match_user_id)
    ])
    if (!toUser || !matchUser) {
      throw new Error('related user not found')
    }
    let sendResult = null
    if (job.type === 'match_notification') {
      sendResult = await emailService.sendMatchNotification(toUser, matchUser)
    } else if (job.type === 'pairing_unlocked') {
      sendResult = await emailService.sendPairingUnlocked(toUser, matchUser)
    } else {
      throw new Error(`unsupported job type: ${job.type}`)
    }
    await job.update({
      status: 'sent',
      sent_at: new Date(),
      provider_message_id: sendResult?.messageId || null,
      last_error: null,
      worker_id: WORKER_ID,
      locked_at: null
    })
  } catch (error) {
    const nextAttempts = job.attempts + 1
    const shouldFail = nextAttempts >= job.max_attempts
    const retryDelaySeconds = computeRetryDelaySeconds(nextAttempts)
    await job.update({
      attempts: nextAttempts,
      status: shouldFail ? 'failed' : 'pending',
      next_retry_at: shouldFail ? null : new Date(Date.now() + retryDelaySeconds * 1000),
      worker_id: null,
      locked_at: null,
      last_error: error.message || String(error)
    })
    logger.error('Email queue job failed', {
      job_id: job.id,
      type: job.type,
      attempts: nextAttempts,
      max_attempts: job.max_attempts,
      error: error.message || String(error)
    })
  }
}

const processClaimedJobs = async (jobs) => {
  const workers = []
  const queue = [...jobs]
  const concurrency = Math.max(1, DEFAULT_MAX_CONCURRENCY)
  for (let i = 0; i < concurrency; i += 1) {
    workers.push((async () => {
      while (queue.length > 0) {
        const job = queue.shift()
        if (!job) {
          break
        }
        await processSingleJob(job)
      }
    })())
  }
  await Promise.all(workers)
}

const processEmailQueueTick = async () => {
  if (running) {
    return
  }
  running = true
  try {
    const jobs = await claimPendingJobs()
    if (jobs.length > 0) {
      await processClaimedJobs(jobs)
    }
  } catch (error) {
    logger.error('Process email queue tick failed', error)
  } finally {
    running = false
  }
}

const startEmailQueueWorker = () => {
  if (workerTimer) {
    return
  }
  workerTimer = setInterval(() => {
    processEmailQueueTick()
  }, DEFAULT_POLL_INTERVAL_MS)
  processEmailQueueTick()
  logger.info('Email queue worker started', {
    worker_id: WORKER_ID,
    poll_interval_ms: DEFAULT_POLL_INTERVAL_MS,
    max_concurrency: DEFAULT_MAX_CONCURRENCY
  })
}

const stopEmailQueueWorker = () => {
  if (!workerTimer) {
    return
  }
  clearInterval(workerTimer)
  workerTimer = null
  logger.info('Email queue worker stopped', { worker_id: WORKER_ID })
}

const listEmailJobs = async ({
  status,
  type,
  page = 1,
  pageSize = 20
}) => {
  const safePage = Math.max(1, Number(page) || 1)
  const safePageSize = Math.min(100, Math.max(1, Number(pageSize) || 20))
  const where = {}
  if (status) {
    where.status = status
  }
  if (type) {
    where.type = type
  }
  const { rows, count } = await EmailNotificationJob.findAndCountAll({
    where,
    include: [
      { model: User, as: 'toUser', attributes: ['id', 'email', 'name', 'nickname'] },
      { model: User, as: 'matchUser', attributes: ['id', 'email', 'name', 'nickname'] },
      { model: Match, as: 'match', attributes: ['id', 'week_key', 'status'] }
    ],
    order: [['id', 'DESC']],
    offset: (safePage - 1) * safePageSize,
    limit: safePageSize
  })
  return {
    list: rows,
    pagination: {
      page: safePage,
      page_size: safePageSize,
      total: count
    }
  }
}

const retryEmailJob = async (jobId) => {
  const job = await EmailNotificationJob.findByPk(jobId)
  if (!job) {
    return null
  }
  await job.update({
    status: 'pending',
    next_retry_at: null,
    worker_id: null,
    locked_at: null,
    sent_at: null
  })
  return job
}

export {
  enqueueEmailNotification,
  startEmailQueueWorker,
  stopEmailQueueWorker,
  processEmailQueueTick,
  listEmailJobs,
  retryEmailJob
}
