import { sequelize } from '../config/database.js'
import { QuestionnaireAnswer, QuestionnaireQuestion } from '../models/index.js'

const getQuestions = async (ctx) => {
  const { section } = ctx.query
  const where = section ? { section } : {}
  const questions = await QuestionnaireQuestion.findAll({
    where,
    order: [['sort_order', 'ASC'], ['id', 'ASC']]
  })

  const grouped = {}
  for (const question of questions) {
    const key = question.section
    if (!grouped[key]) {
      grouped[key] = {
        name: key,
        title: question.section_title,
        questions: []
      }
    }
    grouped[key].questions.push(question)
  }

  const totalQuestions = await QuestionnaireQuestion.count()
  const answeredQuestions = await QuestionnaireAnswer.count({
    where: { user_id: ctx.state.user.id }
  })

  ctx.body = {
    success: true,
    data: {
      sections: Object.values(grouped),
      total_questions: totalQuestions,
      completed_questions: answeredQuestions
    }
  }
}

const saveAnswers = async (ctx) => {
  const { answers } = ctx.request.body
  if (!Array.isArray(answers) || answers.length === 0) {
    ctx.status = 400
    ctx.body = {
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'answers 不能为空'
      }
    }
    return
  }

  const uniqueAnswerMap = new Map()
  for (const answer of answers) {
    if (!answer || !Number.isInteger(answer.question_id)) {
      ctx.status = 400
      ctx.body = {
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'question_id 必须是整数'
        }
      }
      return
    }
    uniqueAnswerMap.set(answer.question_id, answer.answer_value)
  }

  const questionIds = [...uniqueAnswerMap.keys()]
  const validQuestions = await QuestionnaireQuestion.findAll({
    where: { id: questionIds }
  })
  const validQuestionIdSet = new Set(validQuestions.map(item => item.id))
  if (validQuestionIdSet.size !== questionIds.length) {
    ctx.status = 400
    ctx.body = {
      success: false,
      error: {
        code: 'INVALID_QUESTION_ID',
        message: '存在无效的问题 ID'
      }
    }
    return
  }

  const payload = questionIds.map(questionId => ({
    user_id: ctx.state.user.id,
    question_id: questionId,
    answer_value: uniqueAnswerMap.get(questionId)
  }))

  await sequelize.transaction(async (transaction) => {
    await QuestionnaireAnswer.bulkCreate(payload, {
      updateOnDuplicate: ['answer_value', 'updated_at'],
      transaction
    })
  })

  const savedCount = payload.length

  const totalAnswered = await QuestionnaireAnswer.count({
    where: { user_id: ctx.state.user.id }
  })
  const totalQuestions = await QuestionnaireQuestion.count()
  const completeness = totalQuestions ? Number(((totalAnswered / totalQuestions) * 100).toFixed(2)) : 0

  ctx.body = {
    success: true,
    data: {
      saved_count: savedCount,
      total_answered: totalAnswered,
      total_questions: totalQuestions,
      completeness
    },
    message: '答案保存成功'
  }
}

const getAnswers = async (ctx) => {
  const answers = await QuestionnaireAnswer.findAll({
    where: { user_id: ctx.state.user.id },
    include: [
      {
        model: QuestionnaireQuestion,
        as: 'question'
      }
    ]
  })
  const result = {}
  for (const answer of answers) {
    result[answer.question.question_code] = answer.answer_value
  }
  ctx.body = {
    success: true,
    data: { answers: result }
  }
}

const getProgress = async (ctx) => {
  const [questions, answers] = await Promise.all([
    QuestionnaireQuestion.findAll({
      order: [['sort_order', 'ASC']]
    }),
    QuestionnaireAnswer.findAll({
      where: { user_id: ctx.state.user.id }
    })
  ])

  const answerSet = new Set(answers.map(item => item.question_id))
  const sectionMap = new Map()
  for (const question of questions) {
    if (!sectionMap.has(question.section)) {
      sectionMap.set(question.section, {
        name: question.section,
        title: question.section_title,
        total: 0,
        answered: 0,
        completed: false
      })
    }
    const section = sectionMap.get(question.section)
    section.total += 1
    if (answerSet.has(question.id)) {
      section.answered += 1
    }
    section.completed = section.total > 0 && section.total === section.answered
  }

  const totalQuestions = questions.length
  const answeredQuestions = answers.length
  const completeness = totalQuestions ? Number(((answeredQuestions / totalQuestions) * 100).toFixed(2)) : 0
  ctx.body = {
    success: true,
    data: {
      total_questions: totalQuestions,
      answered_questions: answeredQuestions,
      completeness,
      sections: [...sectionMap.values()],
      can_match: completeness >= 50,
      min_completeness_for_match: 50
    }
  }
}

export {
  getQuestions,
  saveAnswers,
  getAnswers,
  getProgress
}
