import Router from '@koa/router'
import auth from '../middlewares/auth.js'
import * as matchController from '../controllers/matchController.js'

const router = new Router()

router.get('/current', auth, matchController.getCurrentMatch)
router.post('/:matchId/unlock', auth, matchController.unlockMatch)
router.post('/:matchId/skip', auth, matchController.skipMatch)
router.post('/:matchId/regret', auth, matchController.regretMatch)
router.get('/history', auth, matchController.getMatchHistory)
router.post('/run', auth, matchController.runManualMatch)
router.get('/:matchId/pairing', auth, matchController.getPairingByMatch)

export default router
