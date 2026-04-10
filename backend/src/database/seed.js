import { sequelize } from './config/database.js'
import { College, Grade, Interest } from './models/index.js'
import logger from './utils/logger.js'

const colleges = [
  { name: '土木工程学院', sort_order: 1 },
  { name: '交通运输工程学院', sort_order: 2 },
  { name: '水利工程学院', sort_order: 3 },
  { name: '电气与信息工程学院', sort_order: 4 },
  { name: '能源与动力工程学院', sort_order: 5 },
  { name: '机械工程学院', sort_order: 6 },
  { name: '材料科学与工程学院', sort_order: 7 },
  { name: '化学与食品工程学院', sort_order: 8 },
  { name: '经济与管理学院', sort_order: 9 },
  { name: '文学与新闻传播学院', sort_order: 10 },
  { name: '外国语学院', sort_order: 11 },
  { name: '数学与统计学院', sort_order: 12 },
  { name: '物理与电子科学学院', sort_order: 13 },
  { name: '计算机学院', sort_order: 14 },
  { name: '建筑学院', sort_order: 15 },
  { name: '设计艺术学院', sort_order: 16 },
  { name: '法学院', sort_order: 17 },
  { name: '马克思主义学院', sort_order: 18 },
  { name: '体育学院', sort_order: 19 },
  { name: '国际教育学院', sort_order: 20 }
]

const grades = [
  { name: '大一', sort_order: 1 },
  { name: '大二', sort_order: 2 },
  { name: '大三', sort_order: 3 },
  { name: '大四', sort_order: 4 },
  { name: '研一', sort_order: 5 },
  { name: '研二', sort_order: 6 },
  { name: '研三', sort_order: 7 },
  { name: '博士', sort_order: 8 }
]

const interests = [
  { name: '编程', category: '科技', sort_order: 1 },
  { name: '音乐', category: '艺术', sort_order: 2 },
  { name: '运动', category: '生活', sort_order: 3 },
  { name: '阅读', category: '文化', sort_order: 4 },
  { name: '旅行', category: '生活', sort_order: 5 },
  { name: '摄影', category: '艺术', sort_order: 6 },
  { name: '游戏', category: '娱乐', sort_order: 7 },
  { name: '电影', category: '娱乐', sort_order: 8 },
  { name: '美食', category: '生活', sort_order: 9 },
  { name: '绘画', category: '艺术', sort_order: 10 },
  { name: '舞蹈', category: '艺术', sort_order: 11 },
  { name: '健身', category: '生活', sort_order: 12 },
  { name: '篮球', category: '运动', sort_order: 13 },
  { name: '足球', category: '运动', sort_order: 14 },
  { name: '羽毛球', category: '运动', sort_order: 15 },
  { name: '乒乓球', category: '运动', sort_order: 16 },
  { name: '游泳', category: '运动', sort_order: 17 },
  { name: '跑步', category: '运动', sort_order: 18 },
  { name: '瑜伽', category: '运动', sort_order: 19 },
  { name: '书法', category: '文化', sort_order: 20 }
]

const seedDatabase = async () => {
  try {
    logger.info('Starting database seeding...')
    
    const collegeCount = await College.count()
    if (collegeCount === 0) {
      await College.bulkCreate(colleges)
      logger.info(`Inserted ${colleges.length} colleges`)
    } else {
      logger.info('Colleges already exist, skipping...')
    }
    
    const gradeCount = await Grade.count()
    if (gradeCount === 0) {
      await Grade.bulkCreate(grades)
      logger.info(`Inserted ${grades.length} grades`)
    } else {
      logger.info('Grades already exist, skipping...')
    }
    
    const interestCount = await Interest.count()
    if (interestCount === 0) {
      await Interest.bulkCreate(interests)
      logger.info(`Inserted ${interests.length} interests`)
    } else {
      logger.info('Interests already exist, skipping...')
    }
    
    logger.info('Database seeding completed successfully')
    
    process.exit(0)
  } catch (error) {
    logger.error('Database seeding failed:', error)
    process.exit(1)
  }
}

seedDatabase()
