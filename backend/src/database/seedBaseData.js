import { College, Grade, Interest, QuestionnaireQuestion } from '../models/index.js'
import { colleges, grades, interests, questionnaireQuestions } from './baseData.js'
import logger from '../utils/logger.js'

const seedBaseData = async () => {
  const collegeCount = await College.count()
  if (collegeCount === 0) {
    await College.bulkCreate(colleges)
    logger.info(`Inserted ${colleges.length} colleges`)
  } else {
    await College.destroy({ where: {}, truncate: true })
    await College.bulkCreate(colleges)
    logger.info(`Synced ${colleges.length} colleges`)
  }

  const gradeCount = await Grade.count()
  if (gradeCount === 0) {
    await Grade.bulkCreate(grades)
    logger.info(`Inserted ${grades.length} grades`)
  }

  const interestCount = await Interest.count()
  if (interestCount === 0) {
    await Interest.bulkCreate(interests)
    logger.info(`Inserted ${interests.length} interests`)
  }

  const questionCount = await QuestionnaireQuestion.count()
  if (questionCount === 0) {
    await QuestionnaireQuestion.bulkCreate(questionnaireQuestions)
    logger.info(`Inserted ${questionnaireQuestions.length} questionnaire questions`)
  } else {
    for (const question of questionnaireQuestions) {
      await QuestionnaireQuestion.upsert(question)
    }
    logger.info(`Synced ${questionnaireQuestions.length} questionnaire questions`)
  }
}

export default seedBaseData
