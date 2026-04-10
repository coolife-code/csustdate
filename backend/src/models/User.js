import { Model, DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'
import bcrypt from 'bcryptjs'

class User extends Model {
  async validatePassword(password) {
    return bcrypt.compare(password, this.password_hash)
  }
  
  toJSON() {
    const values = { ...this.get() }
    delete values.password_hash
    return values
  }
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      endsWithCsust(value) {
        if (!value.endsWith('@csust.edu.cn')) {
          throw new Error('必须使用长沙理工大学教育邮箱')
        }
      }
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true
  },
  birth_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  college: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  major: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  grade: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  avatar_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  wechat: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  qq: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'banned'),
    defaultValue: 'active'
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password_hash) {
        user.password_hash = await bcrypt.hash(user.password_hash, 10)
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password_hash')) {
        user.password_hash = await bcrypt.hash(user.password_hash, 10)
      }
    }
  }
})

export default User
