import Router from '@koa/router'
import * as userController from '../controllers/userController.js'
import auth from '../middlewares/auth.js'

const router = new Router()

router.get('/profile', auth, userController.getProfile)
router.put('/profile', auth, userController.updateProfile)
router.put('/preferences', auth, userController.updatePreferences)
router.get('/colleges', userController.getColleges)
router.get('/grades', userController.getGrades)

export default router
