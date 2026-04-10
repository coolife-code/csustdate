import { Model, DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

class College extends Model {}

College.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  sequelize,
  modelName: 'College',
  tableName: 'colleges'
})

export default College
