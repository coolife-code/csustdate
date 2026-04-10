import { Sequelize } from 'sequelize'
import logger from '../utils/logger.js'
import sqlite3Compat from '../utils/sqlite3Compat.js'

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_PATH || './datedrop.sqlite',
  dialectModule: sqlite3Compat,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true
  }
})

const initDatabase = async () => {
  try {
    await import('../models/index.js')
    await sequelize.authenticate()
    logger.info('SQLite 数据库连接成功')
    
    await sequelize.query('PRAGMA journal_mode=WAL;')
    await sequelize.query('PRAGMA synchronous=NORMAL;')
    await sequelize.query('PRAGMA cache_size=5000;')
    await sequelize.query('PRAGMA temp_store=MEMORY;')
    await sequelize.query('PRAGMA foreign_keys=ON;')
    
    logger.info('SQLite 优化配置完成')
    
    await sequelize.sync({ alter: true })
    logger.info('数据库表同步完成')
  } catch (error) {
    logger.error('数据库连接失败:', error)
    throw error
  }
}

export { sequelize, initDatabase }
