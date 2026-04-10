import { Model, DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

class QuestionnaireQuestion extends Model {}

QuestionnaireQuestion.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  question_code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  section: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  section_title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  question_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  question_type: {
    type: DataTypes.ENUM('single', 'multiple', 'text'),
    allowNull: false,
    defaultValue: 'single'
  },
  options: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('options')
      return value ? JSON.parse(value) : null
    },
    set(value) {
      this.setDataValue('options', value ? JSON.stringify(value) : null)
    }
  },
  weight: {
    type: DataTypes.FLOAT,
    defaultValue: 1
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  sequelize,
  modelName: 'QuestionnaireQuestion',
  tableName: 'questionnaire_questions'
})

export default QuestionnaireQuestion
