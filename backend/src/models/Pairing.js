import { Model, DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

class Pairing extends Model {}

Pairing.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  match_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  user1_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user2_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'ended'),
    defaultValue: 'active'
  },
  ended_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ended_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Pairing',
  tableName: 'pairings',
  indexes: [
    { fields: ['status'] },
    { fields: ['user1_id'] },
    { fields: ['user2_id'] }
  ]
})

export default Pairing
