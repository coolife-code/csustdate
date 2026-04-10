import { Op } from 'sequelize'
import { Match, Pairing, QuestionnaireAnswer, QuestionnaireQuestion, User, UserPreference, VerificationCode } from '../models/index.js'
import { sequelize } from '../config/database.js'

const unlockedStatuses = new Set(['user1_unlocked', 'user2_unlocked', 'both_unlocked'])
const skippedStatuses = new Set(['user1_skipped', 'user2_skipped', 'both_skipped'])

const serializeUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  gender: user.gender,
  college: user.college,
  major: user.major,
  grade: user.grade,
  status: user.status,
  created_at: user.created_at
})

const getUsers = async (ctx) => {
  const users = await User.findAll({
    order: [['created_at', 'DESC']]
  })
  ctx.body = {
    success: true,
    data: {
      users: users.map(serializeUser)
    }
  }
}

const getUserDetail = async (ctx) => {
  const userId = Number(ctx.params.userId)
  if (!userId) {
    ctx.status = 400
    ctx.body = {
      success: false,
      error: {
        code: 'INVALID_USER_ID',
        message: '用户ID无效'
      }
    }
    return
  }
  const user = await User.findByPk(userId)
  if (!user) {
    ctx.status = 404
    ctx.body = {
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: '用户不存在'
      }
    }
    return
  }
  const [preference, questionnaireAnswers, matchesAsUser1, matchesAsUser2, pairings, verificationCodes] = await Promise.all([
    UserPreference.findOne({ where: { user_id: userId } }),
    QuestionnaireAnswer.findAll({
      where: { user_id: userId },
      include: [
        {
          model: QuestionnaireQuestion,
          as: 'question'
        }
      ],
      order: [['id', 'ASC']]
    }),
    Match.findAll({
      where: { user1_id: userId },
      include: [
        { model: User, as: 'user2', attributes: ['id', 'email', 'name'] },
        { model: Pairing, as: 'pairing' }
      ],
      order: [['year', 'DESC'], ['week_number', 'DESC']]
    }),
    Match.findAll({
      where: { user2_id: userId },
      include: [
        { model: User, as: 'user1', attributes: ['id', 'email', 'name'] },
        { model: Pairing, as: 'pairing' }
      ],
      order: [['year', 'DESC'], ['week_number', 'DESC']]
    }),
    Pairing.findAll({
      where: {
        [Op.or]: [{ user1_id: userId }, { user2_id: userId }]
      },
      include: [
        { model: Match, as: 'match' },
        { model: User, as: 'user1', attributes: ['id', 'email', 'name'] },
        { model: User, as: 'user2', attributes: ['id', 'email', 'name'] }
      ],
      order: [['created_at', 'DESC']]
    }),
    VerificationCode.findAll({
      where: { email: user.email },
      order: [['created_at', 'DESC']]
    })
  ])
  ctx.body = {
    success: true,
    data: {
      user: user.toJSON(),
      preference: preference?.toJSON() || null,
      questionnaire_answers: questionnaireAnswers.map((item) => item.toJSON()),
      matches_as_user1: matchesAsUser1.map((item) => item.toJSON()),
      matches_as_user2: matchesAsUser2.map((item) => item.toJSON()),
      pairings: pairings.map((item) => item.toJSON()),
      verification_codes: verificationCodes.map((item) => item.toJSON())
    }
  }
}

const getWeekSummaries = async (ctx) => {
  const matches = await Match.findAll({
    include: [{ model: Pairing, as: 'pairing' }],
    order: [['year', 'DESC'], ['week_number', 'DESC'], ['id', 'DESC']]
  })
  const grouped = new Map()
  for (const match of matches) {
    const key = match.week_key
    if (!grouped.has(key)) {
      grouped.set(key, {
        week_key: match.week_key,
        week_number: match.week_number,
        year: match.year,
        total_matches: 0,
        pending_count: 0,
        unlocked_count: 0,
        skipped_count: 0,
        active_pairings: 0,
        ended_pairings: 0
      })
    }
    const item = grouped.get(key)
    item.total_matches += 1
    if (match.status === 'pending') {
      item.pending_count += 1
    } else if (unlockedStatuses.has(match.status)) {
      item.unlocked_count += 1
    } else if (skippedStatuses.has(match.status)) {
      item.skipped_count += 1
    }
    if (match.pairing?.status === 'active') {
      item.active_pairings += 1
    } else if (match.pairing?.status === 'ended') {
      item.ended_pairings += 1
    }
  }
  ctx.body = {
    success: true,
    data: {
      weeks: Array.from(grouped.values())
    }
  }
}

const getWeekMatches = async (ctx) => {
  const { week_key: weekKey } = ctx.query
  if (!weekKey) {
    ctx.status = 400
    ctx.body = {
      success: false,
      error: {
        code: 'WEEK_KEY_REQUIRED',
        message: 'week_key 不能为空'
      }
    }
    return
  }
  const matches = await Match.findAll({
    where: { week_key: weekKey },
    include: [
      { model: User, as: 'user1', attributes: ['id', 'name', 'email', 'college', 'major', 'grade'] },
      { model: User, as: 'user2', attributes: ['id', 'name', 'email', 'college', 'major', 'grade'] },
      { model: Pairing, as: 'pairing' }
    ],
    order: [['id', 'ASC']]
  })
  ctx.body = {
    success: true,
    data: {
      matches: matches.map((item) => ({
        ...item.toJSON(),
        user1: item.user1,
        user2: item.user2,
        pairing: item.pairing || null
      }))
    }
  }
}

const validateMatchUsers = async (user1Id, user2Id, transaction) => {
  if (user1Id === user2Id) {
    return { ok: false, message: '两侧用户不能是同一个人', code: 'INVALID_MATCH_USERS' }
  }
  const users = await User.findAll({
    where: { id: [user1Id, user2Id] },
    transaction
  })
  if (users.length !== 2) {
    return { ok: false, message: '用户不存在', code: 'USER_NOT_FOUND' }
  }
  return { ok: true }
}

const syncPairingByMatchStatus = async (match, transaction) => {
  const pairing = await Pairing.findOne({
    where: { match_id: match.id },
    transaction
  })
  if (match.status === 'both_unlocked') {
    if (!pairing) {
      await Pairing.create({
        match_id: match.id,
        user1_id: match.user1_id,
        user2_id: match.user2_id,
        status: 'active'
      }, { transaction })
      return
    }
    await pairing.update({
      user1_id: match.user1_id,
      user2_id: match.user2_id,
      status: 'active',
      ended_at: null,
      ended_by: null
    }, { transaction })
    return
  }
  if (pairing && pairing.status === 'active') {
    await pairing.update({
      status: 'ended',
      ended_at: new Date(),
      ended_by: null
    }, { transaction })
  }
}

const forceUpdateMatch = async (ctx) => {
  const { matchId } = ctx.params
  const payload = ctx.request.body || {}
  const transaction = await sequelize.transaction()
  try {
    const match = await Match.findByPk(matchId, { transaction })
    if (!match) {
      await transaction.rollback()
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
    if (payload.user1_id !== undefined || payload.user2_id !== undefined) {
      const nextUser1 = payload.user1_id ?? match.user1_id
      const nextUser2 = payload.user2_id ?? match.user2_id
      const validResult = await validateMatchUsers(nextUser1, nextUser2, transaction)
      if (!validResult.ok) {
        await transaction.rollback()
        ctx.status = 400
        ctx.body = {
          success: false,
          error: {
            code: validResult.code,
            message: validResult.message
          }
        }
        return
      }
      match.user1_id = nextUser1
      match.user2_id = nextUser2
    }
    if (payload.status !== undefined) {
      match.status = payload.status
    }
    if (payload.match_score !== undefined) {
      match.match_score = payload.match_score
    }
    await match.save({ transaction })
    await syncPairingByMatchStatus(match, transaction)
    await transaction.commit()
    const latest = await Match.findByPk(match.id, {
      include: [
        { model: User, as: 'user1', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'user2', attributes: ['id', 'name', 'email'] },
        { model: Pairing, as: 'pairing' }
      ]
    })
    ctx.body = {
      success: true,
      data: latest
    }
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

const createMatch = async (ctx) => {
  const payload = ctx.request.body || {}
  const transaction = await sequelize.transaction()
  try {
    const weekKey = payload.week_key
    const weekNumber = Number(payload.week_number)
    const year = Number(payload.year)
    const user1Id = Number(payload.user1_id)
    const user2Id = Number(payload.user2_id)
    if (!weekKey || !weekNumber || !year || !user1Id || !user2Id) {
      await transaction.rollback()
      ctx.status = 400
      ctx.body = {
        success: false,
        error: {
          code: 'INVALID_PAYLOAD',
          message: 'week_key、week_number、year、user1_id、user2_id 为必填项'
        }
      }
      return
    }
    const validResult = await validateMatchUsers(user1Id, user2Id, transaction)
    if (!validResult.ok) {
      await transaction.rollback()
      ctx.status = 400
      ctx.body = {
        success: false,
        error: {
          code: validResult.code,
          message: validResult.message
        }
      }
      return
    }
    const match = await Match.create({
      week_key: weekKey,
      week_number: weekNumber,
      year,
      user1_id: user1Id,
      user2_id: user2Id,
      status: payload.status || 'pending',
      match_score: Number(payload.match_score || 0)
    }, { transaction })
    await syncPairingByMatchStatus(match, transaction)
    await transaction.commit()
    const latest = await Match.findByPk(match.id, {
      include: [
        { model: User, as: 'user1', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'user2', attributes: ['id', 'name', 'email'] },
        { model: Pairing, as: 'pairing' }
      ]
    })
    ctx.body = {
      success: true,
      data: latest
    }
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

export {
  getUsers,
  getUserDetail,
  getWeekSummaries,
  getWeekMatches,
  forceUpdateMatch,
  createMatch
}
