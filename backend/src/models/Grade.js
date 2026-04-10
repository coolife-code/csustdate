import { Model, DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

class Grade extends Model {}

Grade.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  sequelize,
  modelName: 'Grade',
  tableName: 'grades'
})

export default Grade
