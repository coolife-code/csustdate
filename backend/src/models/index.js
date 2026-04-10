import User from './User.js'
import UserPreference from './UserPreference.js'
import VerificationCode from './VerificationCode.js'
import College from './College.js'
import Grade from './Grade.js'
import Interest from './Interest.js'

User.hasOne(UserPreference, { foreignKey: 'user_id', as: 'preferences' })
UserPreference.belongsTo(User, { foreignKey: 'user_id' })

export {
  User,
  UserPreference,
  VerificationCode,
  College,
  Grade,
  Interest
}
