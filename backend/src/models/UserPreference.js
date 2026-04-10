import { Model, DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

class UserPreference extends Model {}

UserPreference.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  preferred_gender: {
    type: DataTypes.ENUM('male', 'female', 'both'),
    defaultValue: 'both'
  },
  min_age: {
    type: DataTypes.INTEGER,
    defaultValue: 18
  },
  max_age: {
    type: DataTypes.INTEGER,
    defaultValue: 25
  },
  preferred_colleges: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('preferred_colleges')
      return value ? JSON.parse(value) : []
    },
    set(value) {
      this.setDataValue('preferred_colleges', JSON.stringify(value))
    }
  },
  other_preferences: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('other_preferences')
      return value ? JSON.parse(value) : {}
    },
    set(value) {
      this.setDataValue('other_preferences', JSON.stringify(value))
    }
  }
}, {
  sequelize,
  modelName: 'UserPreference',
  tableName: 'user_preferences'
})

export default UserPreference
