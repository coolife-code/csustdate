import Router from '@koa/router'
import authRoutes from './auth.js'
import userRoutes from './user.js'
import questionnaireRoutes from './questionnaire.js'
import matchRoutes from './match.js'
import pairingRoutes from './pairing.js'
import adminRoutes from './admin.js'

const router = new Router({ prefix: '/api' })

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
router.use('/questionnaire', questionnaireRoutes.routes(), questionnaireRoutes.allowedMethods())
router.use('/matches', matchRoutes.routes(), matchRoutes.allowedMethods())
router.use('/pairings', pairingRoutes.routes(), pairingRoutes.allowedMethods())
router.use('/admin', adminRoutes.routes(), adminRoutes.allowedMethods())

export default router
