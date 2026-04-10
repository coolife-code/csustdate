import { Model, DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

class QuestionnaireAnswer extends Model {}

QuestionnaireAnswer.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  question_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  answer_value: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const raw = this.getDataValue('answer_value')
      try {
        return JSON.parse(raw)
      } catch {
        return raw
      }
    },
    set(value) {
      if (Array.isArray(value) || typeof value === 'object') {
        this.setDataValue('answer_value', JSON.stringify(value))
        return
      }
      this.setDataValue('answer_value', String(value))
    }
  }
}, {
  sequelize,
  modelName: 'QuestionnaireAnswer',
  tableName: 'questionnaire_answers',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'question_id']
    }
  ]
})

export default QuestionnaireAnswer
