import logger from '../utils/logger.js'

const errorHandler = async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    logger.error('Error:', error)
    
    ctx.status = error.status || 500
    ctx.body = {
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || '服务器内部错误'
      }
    }
    
    if (process.env.NODE_ENV !== 'production') {
      ctx.body.error.stack = error.stack
    }
  }
}

export default errorHandler
