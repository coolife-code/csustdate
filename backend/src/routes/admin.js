import Router from '@koa/router'
import adminLocalAuth from '../middlewares/adminLocalAuth.js'
import * as adminController from '../controllers/adminController.js'

const router = new Router()

router.get('/users', adminLocalAuth, adminController.getUsers)
router.post('/users', adminLocalAuth, adminController.createUser)
router.get('/users/:userId', adminLocalAuth, adminController.getUserDetail)
router.patch('/users/:userId', adminLocalAuth, adminController.updateUser)
router.delete('/users/:userId', adminLocalAuth, adminController.deleteUser)
router.get('/weeks', adminLocalAuth, adminController.getWeekSummaries)
router.get('/matches', adminLocalAuth, adminController.getWeekMatches)
router.post('/matches', adminLocalAuth, adminController.createMatch)
router.patch('/matches/:matchId', adminLocalAuth, adminController.forceUpdateMatch)
router.get('/email/jobs', adminLocalAuth, adminController.getEmailJobs)
router.post('/email/jobs/:jobId/retry', adminLocalAuth, adminController.retryEmailJobById)
router.get('/email/config', adminLocalAuth, adminController.getEmailConfig)
router.patch('/email/config', adminLocalAuth, adminController.updateEmailConfig)
router.post('/email/send-custom', adminLocalAuth, adminController.sendCustomEmailToUser)

export default router
