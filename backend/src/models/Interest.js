import { Model, DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

class Interest extends Model {}

Interest.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  sequelize,
  modelName: 'Interest',
  tableName: 'interests'
})

export default Interest
