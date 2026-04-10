import Router from '@koa/router'
import auth from '../middlewares/auth.js'
import * as pairingController from '../controllers/pairingController.js'

const router = new Router()

router.get('/active', auth, pairingController.getActivePairing)
router.post('/:pairingId/end', auth, pairingController.endPairing)
router.get('/history', auth, pairingController.getPairingHistory)

export default router
