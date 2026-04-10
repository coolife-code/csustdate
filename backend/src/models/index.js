import User from './User.js'
import UserPreference from './UserPreference.js'
import VerificationCode from './VerificationCode.js'
import College from './College.js'
import Grade from './Grade.js'
import Interest from './Interest.js'
import QuestionnaireQuestion from './QuestionnaireQuestion.js'
import QuestionnaireAnswer from './QuestionnaireAnswer.js'
import Match from './Match.js'
import Pairing from './Pairing.js'

User.hasOne(UserPreference, { foreignKey: 'user_id', as: 'preferences' })
UserPreference.belongsTo(User, { foreignKey: 'user_id' })
User.hasMany(QuestionnaireAnswer, { foreignKey: 'user_id', as: 'questionnaireAnswers' })
QuestionnaireAnswer.belongsTo(User, { foreignKey: 'user_id' })
QuestionnaireQuestion.hasMany(QuestionnaireAnswer, { foreignKey: 'question_id', as: 'answers' })
QuestionnaireAnswer.belongsTo(QuestionnaireQuestion, { foreignKey: 'question_id', as: 'question' })

User.hasMany(Match, { foreignKey: 'user1_id', as: 'matchesAsUser1' })
User.hasMany(Match, { foreignKey: 'user2_id', as: 'matchesAsUser2' })
Match.belongsTo(User, { foreignKey: 'user1_id', as: 'user1' })
Match.belongsTo(User, { foreignKey: 'user2_id', as: 'user2' })

Match.hasOne(Pairing, { foreignKey: 'match_id', as: 'pairing' })
Pairing.belongsTo(Match, { foreignKey: 'match_id', as: 'match' })
Pairing.belongsTo(User, { foreignKey: 'user1_id', as: 'user1' })
Pairing.belongsTo(User, { foreignKey: 'user2_id', as: 'user2' })

export {
  User,
  UserPreference,
  VerificationCode,
  College,
  Grade,
  Interest,
  QuestionnaireQuestion,
  QuestionnaireAnswer,
  Match,
  Pairing
}
