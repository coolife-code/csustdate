import Router from '@koa/router'
import auth from '../middlewares/auth.js'
import * as questionnaireController from '../controllers/questionnaireController.js'

const router = new Router()

router.get('/questions', auth, questionnaireController.getQuestions)
router.post('/answers', auth, questionnaireController.saveAnswers)
router.get('/answers', auth, questionnaireController.getAnswers)
router.get('/progress', auth, questionnaireController.getProgress)

export default router
