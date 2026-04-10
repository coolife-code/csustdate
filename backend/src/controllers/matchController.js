import { Op } from 'sequelize'
import { Match, Pairing, User } from '../models/index.js'
import emailService from '../services/emailService.js'
import { createPairingFromMatch, getUserCurrentMatch, getWeekInfo, runWeeklyMatching } from '../services/matchingService.js'

const resolveMatchUser = async (match, userId) => {
  const matchUserId = match.user1_id === userId ? match.user2_id : match.user1_id
  const matchUser = await User.findByPk(matchUserId)
  return { matchUserId, matchUser }
}

const buildPublicMatchUser = (user) => {
  if (!user) {
    return null
  }
  return {
    id: user.id,
    name: user.name,
    gender: user.gender,
    college: user.college,
    major: user.major,
    grade: user.grade,
    bio: user.bio
  }
}

const getCurrentMatch = async (ctx) => {
  let match = await getUserCurrentMatch(ctx.state.user.id)
  if (!match) {
    await runWeeklyMatching()
    match = await getUserCurrentMatch(ctx.state.user.id)
  }
  if (!match) {
    ctx.body = {
      success: true,
      data: null
    }
    return
  }
  const { matchUser } = await resolveMatchUser(match, ctx.state.user.id)
  ctx.body = {
    success: true,
    data: {
      match: {
        ...match.toJSON(),
        match_user: buildPublicMatchUser(matchUser)
      }
    }
  }
}

const updateMatchAction = async (ctx, action) => {
  const { matchId } = ctx.params
  const userId = ctx.state.user.id
  const match = await Match.findByPk(matchId)
  if (!match || (match.user1_id !== userId && match.user2_id !== userId)) {
    ctx.status = 404
    ctx.body = {
      success: false,
      error: {
        code: 'MATCH_NOT_FOUND',
        message: '匹配记录不存在'
      }
    }
    return
  }

  const isUser1 = match.user1_id === userId
  if (action === 'unlock') {
    if (match.status === 'both_unlocked') {
      ctx.body = {
        success: true,
        data: {
          match_id: match.id,
          status: match.status
        }
      }
      return
    }
    if (match.status === 'both_skipped' || (isUser1 && match.status === 'user1_skipped') || (!isUser1 && match.status === 'user2_skipped')) {
      ctx.status = 409
      ctx.body = {
        success: false,
        error: {
          code: 'ALREADY_SKIPPED',
          message: '已跳过，不能再解锁'
        }
      }
      return
    }

    if (isUser1) {
      match.status = match.status === 'user2_unlocked' ? 'both_unlocked' : 'user1_unlocked'
    } else {
      match.status = match.status === 'user1_unlocked' ? 'both_unlocked' : 'user2_unlocked'
    }
    await match.save()

    if (match.status === 'both_unlocked') {
      const pairing = await createPairingFromMatch(match, userId)
      const [user1, user2] = await Promise.all([
        User.findByPk(match.user1_id),
        User.findByPk(match.user2_id)
      ])
      await Promise.all([
        emailService.sendPairingUnlocked(user1, user2),
        emailService.sendPairingUnlocked(user2, user1)
      ])
      ctx.body = {
        success: true,
        data: {
          match_id: match.id,
          pairing_id: pairing.id,
          status: match.status
        }
      }
      return
    }
    ctx.body = {
      success: true,
      data: {
        match_id: match.id,
        status: match.status
      }
    }
    return
  }

  if (match.status === 'both_unlocked') {
    ctx.status = 409
    ctx.body = {
      success: false,
      error: {
        code: 'ALREADY_UNLOCKED',
        message: '已完成双向解锁，不能再跳过'
      }
    }
    return
  }
  if (isUser1) {
    match.status = match.status === 'user2_skipped' ? 'both_skipped' : 'user1_skipped'
  } else {
    match.status = match.status === 'user1_skipped' ? 'both_skipped' : 'user2_skipped'
  }
  await match.save()
  ctx.body = {
    success: true,
    data: {
      match_id: match.id,
      status: match.status
    }
  }
}

const unlockMatch = async (ctx) => updateMatchAction(ctx, 'unlock')
const skipMatch = async (ctx) => updateMatchAction(ctx, 'skip')

const getMatchHistory = async (ctx) => {
  const page = Math.max(parseInt(ctx.query.page || '1', 10), 1)
  const limit = Math.min(Math.max(parseInt(ctx.query.limit || '10', 10), 1), 20)
  const offset = (page - 1) * limit
  const userId = ctx.state.user.id

  const { rows, count } = await Match.findAndCountAll({
    where: {
      [Op.or]: [{ user1_id: userId }, { user2_id: userId }]
    },
    order: [['year', 'DESC'], ['week_number', 'DESC']],
    offset,
    limit
  })

  const items = await Promise.all(rows.map(async (match) => {
    const { matchUser } = await resolveMatchUser(match, userId)
    return {
      ...match.toJSON(),
      match_user: buildPublicMatchUser(matchUser)
    }
  }))

  ctx.body = {
    success: true,
    data: {
      matches: items,
      pagination: {
        page,
        limit,
        total: count,
        total_pages: Math.ceil(count / limit)
      }
    }
  }
}

const runManualMatch = async (ctx) => {
  const result = await runWeeklyMatching()
  const week = getWeekInfo()
  ctx.body = {
    success: true,
    data: {
      ...result,
      week_number: week.weekNumber,
      year: week.year
    }
  }
}

const getPairingByMatch = async (ctx) => {
  const { matchId } = ctx.params
  const pairing = await Pairing.findOne({
    where: { match_id: matchId }
  })
  ctx.body = {
    success: true,
    data: pairing || null
  }
}

export {
  getCurrentMatch,
  unlockMatch,
  skipMatch,
  getMatchHistory,
  runManualMatch,
  getPairingByMatch
}
