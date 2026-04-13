import { User, UserPreference, VerificationCode } from '../models/index.js'
import { Op } from 'sequelize'
import { generateToken } from '../utils/jwt.js'
import emailService from '../services/emailService.js'
import logger from '../utils/logger.js'

const VERIFICATION_CODE_TTL_MINUTES = Number(process.env.VERIFICATION_CODE_TTL_MINUTES || 10)
const VERIFICATION_CODE_RESEND_SECONDS = Number(process.env.VERIFICATION_CODE_RESEND_SECONDS || 60)

const normalizeEmail = (email = '') => email.trim().toLowerCase()
const ALLOWED_CODE_TYPES = new Set(['register', 'reset_password'])

const getVerificationCode = () => {
  if (process.env.NODE_ENV !== 'production' && process.env.DEV_MASTER_CODE) {
    return process.env.DEV_MASTER_CODE
  }
  return String(Math.floor(100000 + Math.random() * 900000))
}

const getDefaultPreferredGender = (gender) => {
  if (gender === 'male') {
    return 'female'
  }
  if (gender === 'female') {
    return 'male'
  }
  return 'both'
}

const sendCode = async (ctx) => {
  const { email: rawEmail, type } = ctx.request.body
  const email = normalizeEmail(rawEmail)
  
  if (!email || !email.endsWith('@csust.edu.cn')) {
    ctx.status = 400
    ctx.body = {
      success: false,
      error: {
        code: 'INVALID_EMAIL',
        message: '请使用长沙理工大学教育邮箱'
      }
    }
    return
  }

  if (!ALLOWED_CODE_TYPES.has(type)) {
    ctx.status = 400
    ctx.body = {
      success: false,
      error: {
        code: 'INVALID_TYPE',
        message: '验证码类型不合法'
      }
    }
    return
  }
  
  if (type === 'register') {
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      ctx.status = 409
      ctx.body = {
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: '该邮箱已被注册'
        }
      }
      return
    }
  }
  
  if (type === 'reset_password') {
    const user = await User.findOne({ where: { email } })
    if (!user) {
      ctx.status = 404
      ctx.body = {
        success: false,
        error: {
          code: 'EMAIL_NOT_FOUND',
          message: '该邮箱未注册'
        }
      }
      return
    }
  }
  
  const recentCode = await VerificationCode.findOne({
    where: {
      email,
      type,
      createdAt: {
        [Op.gt]: new Date(Date.now() - VERIFICATION_CODE_RESEND_SECONDS * 1000)
      }
    },
    order: [['createdAt', 'DESC']]
  })

  if (recentCode) {
    ctx.status = 429
    ctx.body = {
      success: false,
      error: {
        code: 'TOO_FREQUENT',
        message: `请求过于频繁，请在 ${VERIFICATION_CODE_RESEND_SECONDS} 秒后重试`
      }
    }
    return
  }

  const code = getVerificationCode()
  const expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MINUTES * 60 * 1000)

  await VerificationCode.update(
    { used: true },
    {
      where: {
        email,
        type,
        used: false
      }
    }
  )
  
  await VerificationCode.create({
    email,
    code,
    type,
    expires_at: expiresAt
  })
  
  try {
    await emailService.sendVerificationCode(email, code)
    
    ctx.body = {
      success: true,
      data: process.env.NODE_ENV !== 'production' ? { dev_code: code } : undefined,
      message: '验证码已发送到您的邮箱'
    }
  } catch (error) {
    logger.error('Send email error:', error)
    ctx.status = 500
    ctx.body = {
      success: false,
      error: {
        code: 'EMAIL_SEND_FAILED',
        message: '验证码发送失败，请稍后重试'
      }
    }
  }
}

const register = async (ctx) => {
  const { email: rawEmail, password, code, nickname, gender, campus } = ctx.request.body
  const email = normalizeEmail(rawEmail)
  
  if (!email || !password || !code || !nickname) {
    ctx.status = 400
    ctx.body = {
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: '请填写邮箱、昵称、密码和验证码'
      }
    }
    return
  }
  
  const verificationCode = await VerificationCode.findOne({
    where: {
      email,
      code,
      type: 'register',
      used: false,
      expires_at: {
        [Op.gt]: new Date()
      }
    }
  })
  
  if (!verificationCode) {
    ctx.status = 400
    ctx.body = {
      success: false,
      error: {
        code: 'INVALID_CODE',
        message: '验证码错误或已过期'
      }
    }
    return
  }
  
  const existingUser = await User.findOne({ where: { email } })
  if (existingUser) {
    ctx.status = 409
    ctx.body = {
      success: false,
      error: {
        code: 'EMAIL_EXISTS',
        message: '该邮箱已被注册'
      }
    }
    return
  }
  
  const user = await User.create({
    email,
    nickname,
    gender: gender || null,
    campus: campus || null,
    password_hash: password,
    email_verified: true
  })

  await UserPreference.create({
    user_id: user.id,
    preferred_gender: getDefaultPreferredGender(user.gender),
    preferred_colleges: [],
    other_preferences: {}
  })
  
  await verificationCode.update({ used: true })
  
  const token = generateToken({ id: user.id, email: user.email })
  
  ctx.status = 201
  ctx.body = {
    success: true,
    data: {
      user: user.toJSON(),
      token
    },
    message: '注册成功'
  }
}

const login = async (ctx) => {
  const { email: rawEmail, password } = ctx.request.body
  const email = normalizeEmail(rawEmail)
  
  if (!email || !password) {
    ctx.status = 400
    ctx.body = {
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: '请输入邮箱和密码'
      }
    }
    return
  }
  
  const user = await User.findOne({ where: { email } })
  
  if (!user) {
    ctx.status = 401
    ctx.body = {
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: '邮箱或密码错误'
      }
    }
    return
  }
  
  const isValid = await user.validatePassword(password)
  
  if (!isValid) {
    ctx.status = 401
    ctx.body = {
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: '邮箱或密码错误'
      }
    }
    return
  }
  
  if (user.status === 'banned') {
    ctx.status = 403
    ctx.body = {
      success: false,
      error: {
        code: 'ACCOUNT_BANNED',
        message: '账号已被封禁'
      }
    }
    return
  }
  
  const token = generateToken({ id: user.id, email: user.email })
  
  ctx.body = {
    success: true,
    data: {
      user: user.toJSON(),
      token
    },
    message: '登录成功'
  }
}

const logout = async (ctx) => {
  ctx.body = {
    success: true,
    message: '登出成功'
  }
}

const resetPassword = async (ctx) => {
  const { email: rawEmail, code, new_password } = ctx.request.body
  const email = normalizeEmail(rawEmail)
  
  const verificationCode = await VerificationCode.findOne({
    where: {
      email,
      code,
      type: 'reset_password',
      used: false,
      expires_at: {
        [Op.gt]: new Date()
      }
    }
  })
  
  if (!verificationCode) {
    ctx.status = 400
    ctx.body = {
      success: false,
      error: {
        code: 'INVALID_CODE',
        message: '验证码错误或已过期'
      }
    }
    return
  }
  
  const user = await User.findOne({ where: { email } })
  
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
  
  await user.update({ password_hash: new_password })
  await verificationCode.update({ used: true })
  
  ctx.body = {
    success: true,
    message: '密码重置成功'
  }
}

const getCurrentUser = async (ctx) => {
  const user = await User.findByPk(ctx.state.user.id)
  
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
  
  ctx.body = {
    success: true,
    data: user.toJSON()
  }
}

export {
  sendCode,
  register,
  login,
  logout,
  resetPassword,
  getCurrentUser
}
