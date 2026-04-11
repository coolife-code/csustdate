import Router from '@koa/router'
import {
  getEmailRegisterGuide,
  getEmailRegisterGuideAsset
} from '../controllers/docsController.js'

const router = new Router()

router.get('/email-register', getEmailRegisterGuide)
router.get('/email-register/assets/:filename', getEmailRegisterGuideAsset)

export default router
