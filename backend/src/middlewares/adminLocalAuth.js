const adminLocalAuth = async (ctx, next) => {
  const adminKey = ctx.headers['x-admin-key']
  const expectedKey = process.env.ADMIN_LOCAL_KEY || process.env.DEV_MASTER_CODE
  if (!expectedKey) {
    ctx.status = 500
    ctx.body = {
      success: false,
      error: {
        code: 'ADMIN_KEY_NOT_CONFIGURED',
        message: '管理员密钥未配置'
      }
    }
    return
  }
  if (!adminKey || adminKey !== expectedKey) {
    ctx.status = 401
    ctx.body = {
      success: false,
      error: {
        code: 'ADMIN_UNAUTHORIZED',
        message: '管理员密钥无效'
      }
    }
    return
  }
  await next()
}

export default adminLocalAuth
