import Router from '@koa/router'
import * as authController from '../controllers/authController.js'
import auth from '../middlewares/auth.js'

const router = new Router()

router.post('/send-code', authController.sendCode)
router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/logout', auth, authController.logout)
router.post('/reset-password', authController.resetPassword)
router.get('/me', auth, authController.getCurrentUser)

export default router
