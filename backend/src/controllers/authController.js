import { User, UserPreference, VerificationCode } from '../models/index.js'
import { Op } from 'sequelize'
import { generateToken } from '../utils/jwt.js'
import emailService from '../services/emailService.js'
import logger from '../utils/logger.js'

const getVerificationCode = () => {
  if (process.env.NODE_ENV !== 'production') {
    return process.env.DEV_MASTER_CODE || '123456'
  }
  return Math.random().toString().slice(-6)
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
  const { email, type } = ctx.request.body
  
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
  
  const code = getVerificationCode()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
  
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
  const { email, password, code, nickname, gender, campus } = ctx.request.body
  
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
  const { email, password } = ctx.request.body
  
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
  const { email, code, new_password } = ctx.request.body
  
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
