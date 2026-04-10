import { Op } from 'sequelize'
import { Pairing, User } from '../models/index.js'

const getMatchUserInfo = async (pairing, userId) => {
  const targetId = pairing.user1_id === userId ? pairing.user2_id : pairing.user1_id
  return User.findByPk(targetId)
}

const getActivePairing = async (ctx) => {
  const userId = ctx.state.user.id
  const pairing = await Pairing.findOne({
    where: {
      status: 'active',
      [Op.or]: [{ user1_id: userId }, { user2_id: userId }]
    },
    order: [['created_at', 'DESC']]
  })
  if (!pairing) {
    ctx.body = { success: true, data: null }
    return
  }
  const matchUser = await getMatchUserInfo(pairing, userId)
  ctx.body = {
    success: true,
    data: {
      pairing: {
        ...pairing.toJSON(),
        match_user: matchUser?.toJSON() || null
      }
    }
  }
}

const endPairing = async (ctx) => {
  const userId = ctx.state.user.id
  const pairing = await Pairing.findByPk(ctx.params.pairingId)
  if (!pairing || (pairing.user1_id !== userId && pairing.user2_id !== userId)) {
    ctx.status = 404
    ctx.body = {
      success: false,
      error: {
        code: 'PAIRING_NOT_FOUND',
        message: '配对记录不存在'
      }
    }
    return
  }
  if (pairing.status === 'ended') {
    ctx.status = 409
    ctx.body = {
      success: false,
      error: {
        code: 'PAIRING_ALREADY_ENDED',
        message: '配对已经结束'
      }
    }
    return
  }
  await pairing.update({
    status: 'ended',
    ended_at: new Date(),
    ended_by: userId
  })
  ctx.body = {
    success: true,
    data: {
      pairing_id: pairing.id,
      status: pairing.status
    }
  }
}

const getPairingHistory = async (ctx) => {
  const userId = ctx.state.user.id
  const page = Math.max(parseInt(ctx.query.page || '1', 10), 1)
  const limit = Math.min(Math.max(parseInt(ctx.query.limit || '10', 10), 1), 20)
  const offset = (page - 1) * limit
  const { rows, count } = await Pairing.findAndCountAll({
    where: {
      [Op.or]: [{ user1_id: userId }, { user2_id: userId }]
    },
    order: [['created_at', 'DESC']],
    offset,
    limit
  })
  const pairings = await Promise.all(rows.map(async (item) => {
    const matchUser = await getMatchUserInfo(item, userId)
    return {
      ...item.toJSON(),
      match_user: matchUser?.toJSON() || null
    }
  }))
  ctx.body = {
    success: true,
    data: {
      pairings,
      pagination: {
        page,
        limit,
        total: count,
        total_pages: Math.ceil(count / limit)
      }
    }
  }
}

export {
  getActivePairing,
  endPairing,
  getPairingHistory
}
