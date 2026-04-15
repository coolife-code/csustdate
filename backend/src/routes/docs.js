import Router from '@koa/router'
import {
  getEmailRegisterGuide,
  getEmailRegisterGuideAsset,
  getRegisteredCount
} from '../controllers/docsController.js'

const router = new Router()

router.get('/email-register', getEmailRegisterGuide)
router.get('/email-register/assets/:filename', getEmailRegisterGuideAsset)
router.get('/registered-count', getRegisteredCount)

export default router
