import { Model, DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

class Match extends Model {}

Match.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user1_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user2_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  week_key: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  week_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  match_score: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('pending', 'user1_unlocked', 'user2_unlocked', 'both_unlocked', 'user1_skipped', 'user2_skipped', 'both_skipped'),
    allowNull: false,
    defaultValue: 'pending'
  }
}, {
  sequelize,
  modelName: 'Match',
  tableName: 'matches',
  indexes: [
    { fields: ['week_key'] },
    { fields: ['user1_id'] },
    { fields: ['user2_id'] }
  ]
})

export default Match
