import { Model, DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

class EmailTemplateConfig extends Model {}

EmailTemplateConfig.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ai_enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  temperature: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.7
  },
  max_tokens: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 180
  },
  match_system_prompt: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  match_user_rules: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  pairing_system_prompt: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  pairing_user_rules: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'EmailTemplateConfig',
  tableName: 'email_template_configs'
})

export default EmailTemplateConfig
