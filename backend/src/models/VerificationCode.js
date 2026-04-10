import { Model, DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

class VerificationCode extends Model {}

VerificationCode.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(6),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('register', 'reset_password'),
    allowNull: false
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'VerificationCode',
  tableName: 'verification_codes'
})

export default VerificationCode
