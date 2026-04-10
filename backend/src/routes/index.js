import Router from '@koa/router'
import authRoutes from './auth.js'
import userRoutes from './user.js'

const router = new Router()

router.get('/health', async (ctx) => {
  ctx.body = {
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  }
})

router.use('/auth', authRoutes.routes(), authRoutes.allowedMethods())
router.use('/users', userRoutes.routes(), userRoutes.allowedMethods())

export default router
