import { verifyToken } from '../utils/jwt.js'

const auth = async (ctx, next) => {
  try {
    const token = ctx.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      ctx.status = 401
      ctx.body = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '未提供认证令牌'
        }
      }
      return
    }
    
    const decoded = verifyToken(token)
    
    if (!decoded) {
      ctx.status = 401
      ctx.body = {
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: '无效的认证令牌'
        }
      }
      return
    }
    
    ctx.state.user = decoded
    await next()
  } catch (error) {
    ctx.status = 401
    ctx.body = {
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: '认证失败'
      }
    }
  }
}

export default auth
