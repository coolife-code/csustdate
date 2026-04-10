import { Op } from 'sequelize'
import { sequelize } from '../src/config/database.js'
import { Match, Pairing, QuestionnaireAnswer, QuestionnaireQuestion, User } from '../src/models/index.js'
import { getWeekInfo, runWeeklyMatching } from '../src/services/matchingService.js'

const ensureQuestionnaireAnswerIndexes = async () => {
  const [indexes] = await sequelize.query('PRAGMA index_list(questionnaire_answers);')
  let hasWrongUnique = false
  for (const index of indexes) {
    if (!index.unique) {
      continue
    }
    const [columns] = await sequelize.query(`PRAGMA index_info(${index.name});`)
    const columnNames = columns.map((item) => item.name)
    if (columnNames.length === 1 && columnNames[0] === 'question_id') {
      hasWrongUnique = true
      break
    }
  }
  if (!hasWrongUnique) {
    return false
  }
  await sequelize.query('PRAGMA foreign_keys = OFF;')
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS questionnaire_answers_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      answer_value TEXT NOT NULL,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL
    );
  `)
  await sequelize.query(`
    INSERT OR IGNORE INTO questionnaire_answers_new (id, user_id, question_id, answer_value, created_at, updated_at)
    SELECT id, user_id, question_id, answer_value, created_at, updated_at FROM questionnaire_answers;
  `)
  await sequelize.query('DROP TABLE questionnaire_answers;')
  await sequelize.query('ALTER TABLE questionnaire_answers_new RENAME TO questionnaire_answers;')
  await sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS questionnaire_answers_user_question_unique ON questionnaire_answers(user_id, question_id);')
  await sequelize.query('CREATE INDEX IF NOT EXISTS questionnaire_answers_user_id_idx ON questionnaire_answers(user_id);')
  await sequelize.query('CREATE INDEX IF NOT EXISTS questionnaire_answers_question_id_idx ON questionnaire_answers(question_id);')
  await sequelize.query('PRAGMA foreign_keys = ON;')
  return true
}

const buildAnswerValue = (question, userIndex, userId) => {
  const options = Array.isArray(question.options) ? question.options : []
  if (question.question_type === 'single') {
    if (options.length === 0) {
      return '默认选项'
    }
    return options[(userIndex + question.id) % options.length]
  }
  if (question.question_type === 'multiple') {
    if (options.length === 0) {
      return ['默认多选']
    }
    if (options.length === 1) {
      return [options[0]]
    }
    return [
      options[(userIndex + question.id) % options.length],
      options[(userIndex + question.id + 2) % options.length]
    ].filter((value, index, array) => array.indexOf(value) === index)
  }
  return `测试用户${userId}的文本回答`
}

const seedAnswersForTestUsers = async () => {
  const users = await User.findAll({
    where: {
      email: {
        [Op.like]: 'testuser%@csust.edu.cn'
      }
    },
    order: [['id', 'ASC']]
  })
  const questions = await QuestionnaireQuestion.findAll({
    order: [['id', 'ASC']]
  })
  let updatedCount = 0
  for (let userIndex = 0; userIndex < users.length; userIndex += 1) {
    const user = users[userIndex]
    for (const question of questions) {
      const answerValue = buildAnswerValue(question, userIndex, user.id)
      const existing = await QuestionnaireAnswer.findOne({
        where: {
          user_id: user.id,
          question_id: question.id
        }
      })
      if (existing) {
        existing.answer_value = answerValue
        await existing.save()
      } else {
        await QuestionnaireAnswer.create({
          user_id: user.id,
          question_id: question.id,
          answer_value: answerValue
        })
      }
      updatedCount += 1
    }
  }
  return {
    testUserCount: users.length,
    questionCount: questions.length,
    answerWriteCount: updatedCount
  }
}

const runMatchingNow = async () => {
  const week = getWeekInfo()
  let result = await runWeeklyMatching()
  let resetCurrentWeek = false
  if (result.skipped) {
    const weekMatches = await Match.findAll({
      where: { week_key: week.weekKey },
      attributes: ['id']
    })
    const matchIds = weekMatches.map((item) => item.id)
    if (matchIds.length > 0) {
      await Pairing.destroy({
        where: {
          match_id: {
            [Op.in]: matchIds
          }
        }
      })
      await Match.destroy({
        where: {
          id: {
            [Op.in]: matchIds
          }
        }
      })
      resetCurrentWeek = true
    }
    result = await runWeeklyMatching()
  }
  const latestMatches = await Match.findAll({
    where: { week_key: week.weekKey },
    order: [['match_score', 'DESC'], ['id', 'ASC']],
    limit: 10
  })
  return {
    weekKey: week.weekKey,
    resetCurrentWeek,
    result,
    sampleMatches: latestMatches.map((item) => ({
      id: item.id,
      user1_id: item.user1_id,
      user2_id: item.user2_id,
      match_score: item.match_score,
      status: item.status
    }))
  }
}

const main = async () => {
  await sequelize.authenticate()
  const fixedIndex = await ensureQuestionnaireAnswerIndexes()
  const answerResult = await seedAnswersForTestUsers()
  const matchingResult = await runMatchingNow()
  console.log(JSON.stringify({
    fixed_questionnaire_answer_unique_index: fixedIndex,
    ...answerResult,
    matching: matchingResult
  }, null, 2))
  await sequelize.close()
}

await main()
