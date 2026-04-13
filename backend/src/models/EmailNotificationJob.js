import { Model, DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

class EmailNotificationJob extends Model {}

EmailNotificationJob.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('match_notification', 'pairing_unlocked'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'sent', 'failed'),
    allowNull: false,
    defaultValue: 'pending'
  },
  to_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  match_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  match_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  payload: {
    type: DataTypes.JSON,
    allowNull: true
  },
  priority: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100
  },
  attempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  max_attempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5
  },
  scheduled_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  next_retry_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  locked_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sent_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  worker_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  provider_message_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  last_error: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dedupe_key: {
    type: DataTypes.STRING(120),
    allowNull: true,
    unique: true
  }
}, {
  sequelize,
  modelName: 'EmailNotificationJob',
  tableName: 'email_notification_jobs',
  indexes: [
    { fields: ['status', 'priority', 'scheduled_at'] },
    { fields: ['status', 'next_retry_at'] },
    { fields: ['to_user_id'] },
    { fields: ['match_id'] }
  ]
})

export default EmailNotificationJob
