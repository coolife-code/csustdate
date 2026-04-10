import Router from '@koa/router'
import adminLocalAuth from '../middlewares/adminLocalAuth.js'
import * as adminController from '../controllers/adminController.js'

const router = new Router()

router.get('/users', adminLocalAuth, adminController.getUsers)
router.get('/users/:userId', adminLocalAuth, adminController.getUserDetail)
router.get('/weeks', adminLocalAuth, adminController.getWeekSummaries)
router.get('/matches', adminLocalAuth, adminController.getWeekMatches)
router.post('/matches', adminLocalAuth, adminController.createMatch)
router.patch('/matches/:matchId', adminLocalAuth, adminController.forceUpdateMatch)

export default router
