# 后端开发文档

## 技术栈选型（轻量化方案）

考虑到服务器配置为 **2核2G**，需要选择轻量、高效的技术方案：

### 核心技术栈

- **运行环境**：Node.js 18 LTS
- **Web框架**：Koa.js（比Express更轻量）
- **数据库**：SQLite 3（轻量级，零配置，零内存占用）
- **ORM**：Sequelize（支持连接池和查询优化）
- **邮件服务**：Nodemailer
- **定时任务**：node-cron
- **进程管理**：PM2
- **身份验证**：JWT

### 为什么选择这个技术栈？

1. **Koa.js**：比Express更轻量，中间件机制更优雅
2. **SQLite**：零内存占用，零配置，适合2G内存服务器，支持万级用户
3. **不使用Redis**：2G内存紧张，使用Map替代即可
4. **Sequelize**：提供连接池管理，支持SQLite到MySQL无缝迁移

## 项目结构

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── email.js
│   │   └── index.js
│   ├── models/
│   │   ├── index.js
│   │   ├── User.js
│   │   ├── UserPreference.js
│   │   ├── Interest.js
│   │   ├── UserInterest.js
│   │   ├── Match.js
│   │   ├── Unlock.js
│   │   ├── Pairing.js
│   │   ├── VerificationCode.js
│   │   ├── QuestionnaireQuestion.js
│   │   ├── QuestionnaireAnswer.js
│   │   ├── UserVector.js
│   │   ├── MatchHistory.js
│   │   ├── MatchRound.js
│   │   └── UserPreferenceRanking.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── matchController.js
│   │   ├── pairingController.js
│   │   └── questionnaireController.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── matchService.js
│   │   ├── emailService.js
│   │   ├── pairingService.js
│   │   ├── questionnaireService.js
│   │   ├── vectorService.js
│   │   └── stableRoommateService.js
│   ├── middlewares/
│   │   ├── auth.js
│   │   ├── validator.js
│   │   ├── rateLimit.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── auth.js
│   │   ├── user.js
│   │   ├── match.js
│   │   ├── pairing.js
│   │   └── questionnaire.js
│   ├── utils/
│   │   ├── jwt.js
│   │   ├── validator.js
│   │   ├── logger.js
│   │   └── helpers.js
│   ├── jobs/
│   │   └── weeklyMatch.js
│   └── app.js
├── tests/
├── .env.example
├── package.json
└── ecosystem.config.js
```

## 核心代码实现

### 1. 应用入口 (app.js)

```javascript
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const cors = require('@koa/cors')
const helmet = require('koa-helmet')
const compress = require('koa-compress')
const logger = require('./utils/logger')
const errorHandler = require('./middlewares/errorHandler')
const routes = require('./routes')

const app = new Koa()

app.use(helmet())
app.use(compress({
  threshold: 1024,
  gzip: { flush: require('zlib').Z_SYNC_FLUSH }
}))
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(bodyParser({
  jsonLimit: '1mb'
}))

app.use(errorHandler)

app.use(routes.routes())
app.use(routes.allowedMethods())

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})

module.exports = app
```

### 2. 数据库配置 (config/database.js)

```javascript
const { Sequelize } = require('sequelize')
const path = require('path')

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database/datedrop.sqlite'),
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
    await sequelize.authenticate()
    console.log('SQLite 数据库连接成功')
    
    await sequelize.query('PRAGMA journal_mode=WAL;')
    await sequelize.query('PRAGMA synchronous=NORMAL;')
    await sequelize.query('PRAGMA cache_size=5000;')
    await sequelize.query('PRAGMA temp_store=MEMORY;')
    await sequelize.query('PRAGMA foreign_keys=ON;')
    
    console.log('SQLite 优化配置完成')
  } catch (error) {
    console.error('数据库连接失败:', error)
    process.exit(1)
  }
}

module.exports = { sequelize, initDatabase }
```

### 3. 用户模型 (models/User.js)

```javascript
const { Model, DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const bcrypt = require('bcryptjs')

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

module.exports = User
```

### 4. 匹配模型 (models/Match.js)

```javascript
const { Model, DataTypes } = require('sequelize')
const sequelize = require('../config/database')

class Match extends Model {}

Match.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user1_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  user2_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  match_score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  week_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(
      'pending',
      'both_unlocked',
      'user1_unlocked',
      'user2_unlocked',
      'user1_skipped',
      'user2_skipped',
      'both_skipped'
    ),
    defaultValue: 'pending'
  }
}, {
  sequelize,
  modelName: 'Match',
  tableName: 'matches',
  indexes: [
    {
      unique: true,
      fields: ['user1_id', 'user2_id', 'week_number', 'year']
    },
    {
      fields: ['status']
    }
  ]
})

module.exports = Match
```

### 5. 认证中间件 (middlewares/auth.js)

```javascript
const jwt = require('jsonwebtoken')
const logger = require('../utils/logger')

const auth = async (ctx, next) => {
  try {
    const token = ctx.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      ctx.status = 401
      ctx.body = { error: '未提供认证令牌' }
      return
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    ctx.state.user = decoded
    await next()
  } catch (error) {
    logger.error('Auth error:', error)
    ctx.status = 401
    ctx.body = { error: '无效的认证令牌' }
  }
}

module.exports = auth
```

### 6. 限流中间件 (middlewares/rateLimit.js)

```javascript
const rateLimit = require('koa-ratelimit')
const Redis = require('ioredis')

const redis = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL)
  : new Map()

const limiter = rateLimit({
  db: redis,
  duration: 60000,
  max: 100,
  id: (ctx) => ctx.ip,
  errorMessage: '请求过于频繁，请稍后再试',
  disableHeader: false
})

const authLimiter = rateLimit({
  db: redis,
  duration: 60000,
  max: 5,
  id: (ctx) => ctx.ip,
  errorMessage: '登录尝试次数过多，请稍后再试'
})

const emailLimiter = rateLimit({
  db: redis,
  duration: 300000,
  max: 3,
  id: (ctx) => ctx.request.body.email || ctx.ip,
  errorMessage: '验证码发送过于频繁，请5分钟后再试'
})

module.exports = {
  limiter,
  authLimiter,
  emailLimiter
}
```

### 7. 匹配服务 (services/matchService.js)

```javascript
const { Op } = require('sequelize')
const User = require('../models/User')
const UserPreference = require('../models/UserPreference')
const UserInterest = require('../models/UserInterest')
const Match = require('../models/Match')
const Pairing = require('../models/Pairing')
const logger = require('../utils/logger')

class MatchService {
  async calculateMatchScore(user, candidate, userPrefs, candidatePrefs) {
    if (!this.checkGenderMatch(userPrefs, candidate)) {
      return 0
    }
    
    if (await this.hasMatchedBefore(user.id, candidate.id)) {
      return 0
    }
    
    let score = 0
    
    const ageScore = this.calculateAgeScore(userPrefs, candidate)
    score += ageScore * 0.20
    
    const collegeScore = this.calculateCollegeScore(userPrefs, candidate)
    score += collegeScore * 0.15
    
    const interestScore = await this.calculateInterestScore(user.id, candidate.id)
    score += interestScore * 0.35
    
    const activityScore = this.calculateActivityScore(candidate)
    score += activityScore * 0.15
    
    const historyScore = await this.calculateHistoryScore(user.id, candidate.id)
    score += historyScore * 0.15
    
    return score
  }
  
  checkGenderMatch(userPrefs, candidate) {
    if (!userPrefs || !userPrefs.preferred_gender) return true
    if (userPrefs.preferred_gender === 'both') return true
    return userPrefs.preferred_gender === candidate.gender
  }
  
  calculateAgeScore(userPrefs, candidate) {
    if (!userPrefs || !candidate.birth_date) return 0.5
    
    const candidateAge = this.calculateAge(candidate.birth_date)
    const { min_age, max_age } = userPrefs
    
    if (min_age && max_age) {
      if (candidateAge >= min_age && candidateAge <= max_age) {
        const midAge = (min_age + max_age) / 2
        const diff = Math.abs(candidateAge - midAge)
        return Math.max(0, 1 - diff / ((max_age - min_age) / 2))
      }
      return 0
    }
    
    return 0.5
  }
  
  calculateAge(birthDate) {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }
  
  calculateCollegeScore(userPrefs, candidate) {
    if (!userPrefs || !userPrefs.preferred_colleges || !candidate.college) {
      return 0.5
    }
    
    try {
      const preferredColleges = JSON.parse(userPrefs.preferred_colleges)
      if (preferredColleges.includes(candidate.college)) {
        return 1
      }
    } catch (e) {
      logger.error('Parse preferred colleges error:', e)
    }
    
    return 0.3
  }
  
  async calculateInterestScore(userId, candidateId) {
    try {
      const userInterests = await UserInterest.findAll({
        where: { user_id: userId },
        attributes: ['interest_id']
      })
      
      const candidateInterests = await UserInterest.findAll({
        where: { user_id: candidateId },
        attributes: ['interest_id']
      })
      
      const userInterestIds = userInterests.map(i => i.interest_id)
      const candidateInterestIds = candidateInterests.map(i => i.interest_id)
      
      if (userInterestIds.length === 0 || candidateInterestIds.length === 0) {
        return 0.5
      }
      
      const intersection = userInterestIds.filter(id => 
        candidateInterestIds.includes(id)
      )
      
      const union = [...new Set([...userInterestIds, ...candidateInterestIds])]
      
      return intersection.length / union.length
    } catch (e) {
      logger.error('Calculate interest score error:', e)
      return 0.5
    }
  }
  
  calculateActivityScore(candidate) {
    let score = 0.5
    
    if (candidate.name) score += 0.1
    if (candidate.bio) score += 0.1
    if (candidate.college) score += 0.1
    if (candidate.major) score += 0.1
    
    const daysSinceUpdate = (Date.now() - new Date(candidate.updated_at)) / (1000 * 60 * 60 * 24)
    if (daysSinceUpdate < 7) {
      score += 0.1
    }
    
    return Math.min(score, 1)
  }
  
  async calculateHistoryScore(userId, candidateId) {
    return 0.5
  }
  
  async hasMatchedBefore(userId, candidateId) {
    const match = await Match.findOne({
      where: {
        [Op.or]: [
          { user1_id: userId, user2_id: candidateId },
          { user1_id: candidateId, user2_id: userId }
        ]
      }
    })
    
    return !!match
  }
  
  async runWeeklyMatching() {
    logger.info('Starting weekly matching...')
    
    const activeUsers = await User.findAll({
      where: {
        status: 'active',
        email_verified: true
      },
      include: [
        { model: UserPreference, as: 'preferences' }
      ]
    })
    
    logger.info(`Found ${activeUsers.length} active users`)
    
    const now = new Date()
    const weekNumber = this.getWeekNumber(now)
    const year = now.getFullYear()
    
    const matchedPairs = new Set()
    
    for (const user of activeUsers) {
      const existingPairing = await Pairing.findOne({
        where: {
          [Op.or]: [
            { user1_id: user.id, status: 'active' },
            { user2_id: user.id, status: 'active' }
          ]
        }
      })
      
      if (existingPairing) {
        logger.info(`User ${user.id} already has active pairing, skipping`)
        continue
      }
      
      const candidates = activeUsers.filter(u => 
        u.id !== user.id && 
        !matchedPairs.has(`${Math.min(user.id, u.id)}-${Math.max(user.id, u.id)}`)
      )
      
      if (candidates.length === 0) {
        logger.info(`No candidates for user ${user.id}`)
        continue
      }
      
      let bestMatch = null
      let bestScore = 0
      
      for (const candidate of candidates) {
        const score = await this.calculateMatchScore(
          user,
          candidate,
          user.preferences,
          candidate.preferences
        )
        
        if (score > bestScore) {
          bestScore = score
          bestMatch = candidate
        }
      }
      
      if (bestMatch && bestScore > 0.3) {
        await Match.create({
          user1_id: Math.min(user.id, bestMatch.id),
          user2_id: Math.max(user.id, bestMatch.id),
          match_score: bestScore,
          week_number: weekNumber,
          year: year,
          status: 'pending'
        })
        
        matchedPairs.add(`${Math.min(user.id, bestMatch.id)}-${Math.max(user.id, bestMatch.id)}`)
        
        logger.info(`Matched user ${user.id} with ${bestMatch.id}, score: ${bestScore}`)
      }
    }
    
    logger.info('Weekly matching completed')
  }
  
  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  }
}

module.exports = new MatchService()
```

### 7.5 问卷服务 (services/questionnaireService.js)

管理问卷问题和答案。

```javascript
const { Op } = require('sequelize')
const QuestionnaireQuestion = require('../models/QuestionnaireQuestion')
const QuestionnaireAnswer = require('../models/QuestionnaireAnswer')
const UserVector = require('../models/UserVector')
const vectorService = require('./vectorService')
const logger = require('../utils/logger')

class QuestionnaireService {
  async getQuestions(section = null) {
    const where = { is_active: true }
    if (section) {
      where.section = section
    }
    
    const questions = await QuestionnaireQuestion.findAll({
      where,
      order: [['section', 'ASC'], ['sort_order', 'ASC']]
    })
    
    const sections = this.groupBySection(questions)
    
    return {
      sections,
      total_questions: questions.length
    }
  }
  
  groupBySection(questions) {
    const sectionMap = {}
    const sectionInfo = {
      appearance: { title: '外貌与生活方式', weight: 0.15 },
      personality: { title: '性格特征', weight: 0.20 },
      values: { title: '价值观与恋爱观', weight: 0.25 },
      interests: { title: '兴趣爱好', weight: 0.15 },
      career: { title: '学业与规划', weight: 0.10 },
      family: { title: '家庭与背景', weight: 0.10 },
      expectation: { title: '期望偏好', weight: 0.05 },
      additional: { title: '附加问题', weight: 0.00 }
    }
    
    for (const q of questions) {
      if (!sectionMap[q.section]) {
        sectionMap[q.section] = {
          name: q.section,
          title: sectionInfo[q.section]?.title || q.section,
          weight: sectionInfo[q.section]?.weight || 0,
          questions: []
        }
      }
      sectionMap[q.section].questions.push({
        id: q.id,
        question_code: q.question_code,
        question_text: q.question_text,
        question_type: q.question_type,
        options: JSON.parse(q.options),
        subsection: q.subsection
      })
    }
    
    return Object.values(sectionMap)
  }
  
  async saveAnswers(userId, answers) {
    const transaction = await QuestionnaireAnswer.sequelize.transaction()
    
    try {
      let savedCount = 0
      
      for (const answer of answers) {
        const question = await QuestionnaireQuestion.findByPk(answer.question_id)
        if (!question) continue
        
        const answerNumeric = this.calculateNumericValue(
          answer.answer_value,
          question
        )
        
        await QuestionnaireAnswer.upsert({
          user_id: userId,
          question_id: answer.question_id,
          answer_value: JSON.stringify(answer.answer_value),
          answer_numeric: answerNumeric
        }, { transaction })
        
        savedCount++
      }
      
      await transaction.commit()
      
      const completeness = await this.calculateCompleteness(userId)
      
      await vectorService.updateUserVector(userId)
      
      return {
        saved_count: savedCount,
        completeness
      }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }
  
  calculateNumericValue(answerValue, question) {
    if (question.question_type === 'single') {
      const optionKeys = Object.keys(JSON.parse(question.options))
      const index = optionKeys.indexOf(answerValue)
      return index >= 0 ? (index + 1) / optionKeys.length : 0.5
    } else if (question.question_type === 'multiple') {
      const values = Array.isArray(answerValue) ? answerValue : []
      const optionKeys = Object.keys(JSON.parse(question.options))
      return values.length / optionKeys.length
    }
    return 0.5
  }
  
  async calculateCompleteness(userId) {
    const totalQuestions = await QuestionnaireQuestion.count({
      where: { is_active: true }
    })
    
    const answeredQuestions = await QuestionnaireAnswer.count({
      where: { user_id: userId }
    })
    
    return (answeredQuestions / totalQuestions) * 100
  }
  
  async getUserAnswers(userId) {
    const answers = await QuestionnaireAnswer.findAll({
      where: { user_id: userId },
      include: [{
        model: QuestionnaireQuestion,
        attributes: ['question_code', 'section']
      }]
    })
    
    const result = {}
    const sectionsCompleted = new Set()
    
    for (const a of answers) {
      result[a.QuestionnaireQuestion.question_code] = JSON.parse(a.answer_value)
      sectionsCompleted.add(a.QuestionnaireQuestion.section)
    }
    
    const completeness = await this.calculateCompleteness(userId)
    
    return {
      answers: result,
      completeness,
      sections_completed: Array.from(sectionsCompleted)
    }
  }
  
  async getProgress(userId) {
    const questions = await QuestionnaireQuestion.findAll({
      where: { is_active: true },
      order: [['section', 'ASC'], ['sort_order', 'ASC']]
    })
    
    const answers = await QuestionnaireAnswer.findAll({
      where: { user_id: userId },
      attributes: ['question_id']
    })
    
    const answeredIds = new Set(answers.map(a => a.question_id))
    
    const sections = {}
    for (const q of questions) {
      if (!sections[q.section]) {
        sections[q.section] = {
          name: q.section,
          total: 0,
          answered: 0
        }
      }
      sections[q.section].total++
      if (answeredIds.has(q.id)) {
        sections[q.section].answered++
      }
    }
    
    const sectionList = Object.values(sections).map(s => ({
      ...s,
      completed: s.answered === s.total
    }))
    
    const totalQuestions = questions.length
    const answeredQuestions = answeredIds.size
    const completeness = (answeredQuestions / totalQuestions) * 100
    
    return {
      total_questions: totalQuestions,
      answered_questions: answeredQuestions,
      completeness,
      sections: sectionList,
      can_match: completeness >= 50,
      min_completeness_for_match: 50
    }
  }
}

module.exports = new QuestionnaireService()
```

### 7.6 向量服务 (services/vectorService.js)

处理用户特征向量的计算和匹配分数。

```javascript
const { Op } = require('sequelize')
const UserVector = require('../models/UserVector')
const QuestionnaireAnswer = require('../models/QuestionnaireAnswer')
const QuestionnaireQuestion = require('../models/QuestionnaireQuestion')
const logger = require('../utils/logger')

const SECTION_WEIGHTS = {
  appearance: 0.15,
  personality: 0.20,
  values: 0.25,
  interests: 0.15,
  career: 0.10,
  family: 0.10,
  expectation: 0.05,
  additional: 0.00
}

const DIMENSION_MAPPINGS = {
  appearance: {
    height: ['Q1.1'],
    body_type: ['Q1.4'],
    lifestyle: ['Q1.8', 'Q1.10', 'Q1.13', 'Q1.14']
  },
  personality: {
    extroversion: ['Q2.1', 'Q2.2'],
    communication: ['Q2.7', 'Q2.8', 'Q2.10'],
    independence: ['Q2.5', 'Q2.6']
  },
  values: {
    life_goal: ['Q3.1', 'Q3.2', 'Q3.3'],
    relationship_view: ['Q3.6', 'Q3.7', 'Q3.9'],
    money_attitude: ['Q3.4', 'Q3.5', 'Q3.11']
  }
}

class VectorService {
  async updateUserVector(userId) {
    const answers = await QuestionnaireAnswer.findAll({
      where: { user_id: userId },
      include: [{
        model: QuestionnaireQuestion,
        attributes: ['question_code', 'section', 'weight']
      }]
    })
    
    const answerMap = {}
    for (const a of answers) {
      const code = a.QuestionnaireQuestion.question_code
      answerMap[code] = {
        numeric: a.answer_numeric,
        value: JSON.parse(a.answer_value),
        section: a.QuestionnaireQuestion.section,
        weight: a.QuestionnaireQuestion.weight
      }
    }
    
    const vectors = {}
    const dimensionScores = {}
    
    for (const [section, dimensions] of Object.entries(DIMENSION_MAPPINGS)) {
      const sectionVector = {}
      
      for (const [dimName, questionCodes] of Object.entries(dimensions)) {
        const values = questionCodes
          .filter(code => answerMap[code])
          .map(code => answerMap[code].numeric)
        
        if (values.length > 0) {
          sectionVector[dimName] = values.reduce((a, b) => a + b, 0) / values.length
        }
      }
      
      vectors[section] = sectionVector
      
      const dimValues = Object.values(sectionVector)
      if (dimValues.length > 0) {
        dimensionScores[section] = dimValues.reduce((a, b) => a + b, 0) / dimValues.length
      }
    }
    
    const combinedVector = this.calculateCombinedVector(vectors)
    const completeness = await this.calculateCompleteness(userId)
    
    await UserVector.upsert({
      user_id: userId,
      vector_appearance: JSON.stringify(vectors.appearance || {}),
      vector_personality: JSON.stringify(vectors.personality || {}),
      vector_values: JSON.stringify(vectors.values || {}),
      vector_interests: JSON.stringify(vectors.interests || {}),
      vector_career: JSON.stringify(vectors.career || {}),
      vector_family: JSON.stringify(vectors.family || {}),
      vector_expectation: JSON.stringify(vectors.expectation || {}),
      vector_combined: JSON.stringify(combinedVector),
      completeness
    })
    
    return { vectors, dimensionScores, completeness }
  }
  
  calculateCombinedVector(vectors) {
    const combined = {}
    
    for (const [section, sectionVector] of Object.entries(vectors)) {
      const weight = SECTION_WEIGHTS[section] || 0
      for (const [dim, value] of Object.entries(sectionVector)) {
        combined[`${section}_${dim}`] = value * weight
      }
    }
    
    return combined
  }
  
  async calculateCompatibilityScore(userId1, userId2) {
    const vector1 = await UserVector.findOne({
      where: { user_id: userId1 }
    })
    
    const vector2 = await UserVector.findOne({
      where: { user_id: userId2 }
    })
    
    if (!vector1 || !vector2) {
      return { score: 0, details: {} }
    }
    
    const v1 = JSON.parse(vector1.vector_combined)
    const v2 = JSON.parse(vector2.vector_combined)
    
    const dimensionScores = {}
    const matchDetails = {
      shared_interests: [],
      compatible_habits: [],
      value_alignment: []
    }
    
    for (const section of Object.keys(SECTION_WEIGHTS)) {
      const sectionV1 = JSON.parse(vector1[`vector_${section}`] || '{}')
      const sectionV2 = JSON.parse(vector2[`vector_${section}`] || '{}')
      
      let sectionScore = 0
      let dimensionCount = 0
      
      for (const dim of Object.keys(sectionV1)) {
        if (sectionV2[dim] !== undefined) {
          const diff = Math.abs(sectionV1[dim] - sectionV2[dim])
          const similarity = 1 - diff
          sectionScore += similarity
          dimensionCount++
        }
      }
      
      if (dimensionCount > 0) {
        dimensionScores[section] = (sectionScore / dimensionCount) * 100
      }
    }
    
    let totalScore = 0
    for (const [section, score] of Object.entries(dimensionScores)) {
      totalScore += score * (SECTION_WEIGHTS[section] || 0)
    }
    
    return {
      score: totalScore,
      dimension_scores: dimensionScores,
      match_details: matchDetails
    }
  }
  
  async getUserVector(userId) {
    const vector = await UserVector.findOne({
      where: { user_id: userId }
    })
    
    if (!vector) {
      return null
    }
    
    return {
      user_id: userId,
      completeness: vector.completeness,
      vectors: {
        appearance: JSON.parse(vector.vector_appearance || '{}'),
        personality: JSON.parse(vector.vector_personality || '{}'),
        values: JSON.parse(vector.vector_values || '{}'),
        interests: JSON.parse(vector.vector_interests || '{}'),
        career: JSON.parse(vector.vector_career || '{}'),
        family: JSON.parse(vector.vector_family || '{}'),
        expectation: JSON.parse(vector.vector_expectation || '{}')
      },
      dimension_scores: this.calculateDimensionScores(vector),
      updated_at: vector.updated_at
    }
  }
  
  calculateDimensionScores(vector) {
    const scores = {}
    
    for (const section of Object.keys(SECTION_WEIGHTS)) {
      const sectionVector = JSON.parse(vector[`vector_${section}`] || '{}')
      const values = Object.values(sectionVector)
      if (values.length > 0) {
        scores[section] = values.reduce((a, b) => a + b, 0) / values.length
      }
    }
    
    return scores
  }
  
  async calculateCompleteness(userId) {
    const vector = await UserVector.findOne({
      where: { user_id: userId }
    })
    
    return vector?.completeness || 0
  }
}

module.exports = new VectorService()
```

### 7.7 稳定室友算法服务 (services/stableRoommateService.js)

实现稳定室友匹配算法。

```javascript
const User = require('../models/User')
const UserVector = require('../models/UserVector')
const MatchHistory = require('../models/MatchHistory')
const UserPreferenceRanking = require('../models/UserPreferenceRanking')
const MatchRound = require('../models/MatchRound')
const Match = require('../models/Match')
const vectorService = require('./vectorService')
const logger = require('../utils/logger')

class StableRoommateService {
  async runMatching(roundNumber) {
    logger.info(`Starting stable roommate matching for round ${roundNumber}`)
    
    const users = await this.getEligibleUsers()
    logger.info(`Found ${users.length} eligible users`)
    
    if (users.length < 2) {
      logger.info('Not enough users for matching')
      return { matched_pairs: 0 }
    }
    
    const preferenceLists = await this.buildPreferenceLists(users, roundNumber)
    
    const matches = this.stableRoommate(preferenceLists)
    
    await this.saveMatches(matches, roundNumber)
    
    logger.info(`Matching completed: ${matches.length} pairs`)
    
    return { matched_pairs: matches.length }
  }
  
  async getEligibleUsers() {
    return User.findAll({
      where: {
        status: 'active',
        email_verified: true
      },
      include: [{
        model: UserVector,
        where: {
          completeness: { [Op.gte]: 50 }
        },
        required: true
      }]
    })
  }
  
  async buildPreferenceLists(users, roundNumber) {
    const preferenceLists = {}
    
    for (const user of users) {
      const candidates = users.filter(u => u.id !== user.id)
      
      const scores = []
      for (const candidate of candidates) {
        const alreadyMatched = await MatchHistory.findOne({
          where: {
            user_id: user.id,
            matched_user_id: candidate.id
          }
        })
        
        if (alreadyMatched) continue
        
        const { score, dimension_scores } = await vectorService.calculateCompatibilityScore(
          user.id,
          candidate.id
        )
        
        if (score > 0) {
          scores.push({
            candidate_id: candidate.id,
            score,
            dimension_scores
          })
        }
      }
      
      scores.sort((a, b) => b.score - a.score)
      
      preferenceLists[user.id] = scores.map((s, index) => ({
        candidate_id: s.candidate_id,
        rank: index + 1,
        score: s.score
      }))
      
      await this.savePreferenceRanking(user.id, scores, roundNumber)
    }
    
    return preferenceLists
  }
  
  async savePreferenceRanking(userId, scores, roundNumber) {
    await UserPreferenceRanking.destroy({
      where: { user_id: userId, round_number: roundNumber }
    })
    
    const rankings = scores.map((s, index) => ({
      user_id: userId,
      candidate_id: s.candidate_id,
      round_number: roundNumber,
      preference_rank: index + 1,
      compatibility_score: s.score
    }))
    
    await UserPreferenceRanking.bulkCreate(rankings)
  }
  
  stableRoommate(preferenceLists) {
    const n = Object.keys(preferenceLists).length
    
    if (n % 2 !== 0) {
      logger.warn('Odd number of users, one will be left unmatched')
    }
    
    const proposals = {}
    const rejections = {}
    
    for (const userId of Object.keys(preferenceLists)) {
      proposals[userId] = null
      rejections[userId] = new Set()
    }
    
    let changed = true
    let iterations = 0
    const maxIterations = n * n
    
    while (changed && iterations < maxIterations) {
      changed = false
      iterations++
      
      for (const userId of Object.keys(preferenceLists)) {
        if (proposals[userId]) continue
        
        const prefs = preferenceLists[userId]
        
        for (const pref of prefs) {
          const candidateId = pref.candidate_id.toString()
          
          if (rejections[userId].has(candidateId)) continue
          
          if (!proposals[candidateId]) {
            proposals[candidateId] = userId
            proposals[userId] = candidateId
          } else {
            const currentProposal = proposals[candidateId]
            const currentRank = this.getRank(preferenceLists[candidateId], currentProposal)
            const newRank = this.getRank(preferenceLists[candidateId], userId)
            
            if (newRank < currentRank) {
              rejections[currentProposal].add(candidateId)
              proposals[currentProposal] = null
              proposals[candidateId] = userId
              proposals[userId] = candidateId
            } else {
              rejections[userId].add(candidateId)
            }
          }
          
          changed = true
          break
        }
      }
    }
    
    const matches = []
    const matched = new Set()
    
    for (const [userId, partnerId] of Object.entries(proposals)) {
      if (matched.has(userId) || matched.has(partnerId)) continue
      
      if (partnerId && proposals[partnerId] === userId) {
        matches.push({
          user1_id: Math.min(parseInt(userId), parseInt(partnerId)),
          user2_id: Math.max(parseInt(userId), parseInt(partnerId))
        })
        matched.add(userId)
        matched.add(partnerId)
      }
    }
    
    return matches
  }
  
  getRank(preferenceList, userId) {
    const pref = preferenceList.find(p => p.candidate_id.toString() === userId.toString())
    return pref ? pref.rank : Infinity
  }
  
  async saveMatches(matches, roundNumber) {
    const transaction = await Match.sequelize.transaction()
    
    try {
      for (const match of matches) {
        const { score } = await vectorService.calculateCompatibilityScore(
          match.user1_id,
          match.user2_id
        )
        
        await Match.create({
          user1_id: match.user1_id,
          user2_id: match.user2_id,
          match_score: score,
          round_number: roundNumber,
          week_number: this.getWeekNumber(new Date()),
          year: new Date().getFullYear(),
          status: 'pending'
        }, { transaction })
        
        await MatchHistory.create({
          user_id: match.user1_id,
          matched_user_id: match.user2_id,
          round_number: roundNumber,
          match_score: score
        }, { transaction })
        
        await MatchHistory.create({
          user_id: match.user2_id,
          matched_user_id: match.user1_id,
          round_number: roundNumber,
          match_score: score
        }, { transaction })
      }
      
      await transaction.commit()
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }
  
  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  }
}

module.exports = new StableRoommateService()
```

### 8. 邮件服务 (services/emailService.js)

```javascript
const nodemailer = require('nodemailer')
const logger = require('../utils/logger')

class EmailService {
  constructor() {
    this.transporter = null
    this.init()
  }
  
  init() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.qq.com',
      port: process.env.SMTP_PORT || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
  }
  
  async sendVerificationCode(email, code) {
    const mailOptions = {
      from: `"CSUST DateDrop" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '【CSUST DateDrop】验证码',
      html: `
        <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #1a1a1a; font-weight: 600; margin-bottom: 20px;">亲爱的同学：</h2>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">您好！您的验证码是：</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #000;">${code}</span>
          </div>
          <p style="color: #666; font-size: 14px;">验证码有效期为10分钟，请尽快完成验证。</p>
          <p style="color: #999; font-size: 14px; margin-top: 30px;">如果这不是您的操作，请忽略此邮件。</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 40px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">CSUST DateDrop 团队</p>
        </div>
      `
    }
    
    return this.sendMail(mailOptions)
  }
  
  async sendMatchNotification(user, matchUser) {
    const mailOptions = {
      from: `"CSUST DateDrop" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: '【CSUST DateDrop】本周为您匹配到了新对象！',
      html: `
        <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #1a1a1a; font-weight: 600; margin-bottom: 20px;">亲爱的 ${user.name || '同学'}：</h2>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">本周二，我们为您匹配到了一位新的对象！</p>
          
          <div style="background: #f5f5f5; padding: 30px; margin: 30px 0;">
            <h3 style="color: #000; margin-top: 0;">【匹配对象信息】</h3>
            <p style="color: #333; font-size: 15px; line-height: 1.8;">
              <strong>姓名：</strong>${matchUser.name || '未设置'}<br>
              <strong>性别：</strong>${this.getGenderText(matchUser.gender)}<br>
              <strong>学院：</strong>${matchUser.college || '未设置'}<br>
              <strong>专业：</strong>${matchUser.major || '未设置'}<br>
              <strong>年级：</strong>${matchUser.grade || '未设置'}
            </p>
            
            ${matchUser.bio ? `
              <h4 style="color: #000; margin-top: 20px;">【个人简介】</h4>
              <p style="color: #666; font-size: 14px; line-height: 1.6;">${matchUser.bio}</p>
            ` : ''}
          </div>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.FRONTEND_URL}/match" 
               style="display: inline-block; background: #000; color: #fff; padding: 15px 40px; 
                      text-decoration: none; font-size: 16px; font-weight: 600;">
              登录网站查看详情
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">祝您早日找到心仪的对象！</p>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 40px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">CSUST DateDrop 团队</p>
        </div>
      `
    }
    
    return this.sendMail(mailOptions)
  }
  
  async sendUnlockNotification(user, matchUser) {
    const mailOptions = {
      from: `"CSUST DateDrop" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: '【CSUST DateDrop】恭喜！对方也解锁了您！',
      html: `
        <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #1a1a1a; font-weight: 600; margin-bottom: 20px;">亲爱的 ${user.name || '同学'}：</h2>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            好消息！您解锁的对象 <strong>${matchUser.name}</strong> 也解锁了您！
          </p>
          
          <div style="background: #f5f5f5; padding: 30px; margin: 30px 0;">
            <h3 style="color: #000; margin-top: 0;">【对方联系方式】</h3>
            <p style="color: #333; font-size: 15px; line-height: 1.8;">
              <strong>邮箱：</strong>${matchUser.email}<br>
              ${matchUser.wechat ? `<strong>微信：</strong>${matchUser.wechat}<br>` : ''}
              ${matchUser.qq ? `<strong>QQ：</strong>${matchUser.qq}<br>` : ''}
              ${matchUser.phone ? `<strong>手机：</strong>${matchUser.phone}` : ''}
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px;">祝你们相处愉快！</p>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 40px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">CSUST DateDrop 团队</p>
        </div>
      `
    }
    
    return this.sendMail(mailOptions)
  }
  
  getGenderText(gender) {
    const map = {
      'male': '男',
      'female': '女',
      'other': '其他'
    }
    return map[gender] || '未设置'
  }
  
  async sendMail(mailOptions) {
    try {
      const info = await this.transporter.sendMail(mailOptions)
      logger.info('Email sent:', info.messageId)
      return info
    } catch (error) {
      logger.error('Send email error:', error)
      throw error
    }
  }
}

module.exports = new EmailService()
```

### 9. 定时任务 (jobs/weeklyMatch.js)

```javascript
const cron = require('node-cron')
const matchService = require('../services/matchService')
const emailService = require('../services/emailService')
const User = require('../models/User')
const Match = require('../models/Match')
const logger = require('../utils/logger')

const startWeeklyMatchJob = () => {
  cron.schedule('0 0 * * 2', async () => {
    logger.info('Weekly match job started')
    
    try {
      await matchService.runWeeklyMatching()
      
      const now = new Date()
      const weekNumber = matchService.getWeekNumber(now)
      const year = now.getFullYear()
      
      const matches = await Match.findAll({
        where: {
          week_number: weekNumber,
          year: year,
          status: 'pending'
        },
        include: [
          { model: User, as: 'user1' },
          { model: User, as: 'user2' }
        ]
      })
      
      for (const match of matches) {
        try {
          await emailService.sendMatchNotification(match.user1, match.user2)
          await emailService.sendMatchNotification(match.user2, match.user1)
          logger.info(`Sent match notification for match ${match.id}`)
        } catch (error) {
          logger.error(`Failed to send notification for match ${match.id}:`, error)
        }
      }
      
      logger.info('Weekly match job completed')
    } catch (error) {
      logger.error('Weekly match job error:', error)
    }
  })
  
  logger.info('Weekly match job scheduled')
}

module.exports = { startWeeklyMatchJob }
```

### 10. PM2 配置 (ecosystem.config.js)

```javascript
module.exports = {
  apps: [{
    name: 'datedrop-api',
    script: './src/app.js',
    instances: 2,
    exec_mode: 'cluster',
    max_memory_restart: '400M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    watch: false,
    ignore_watch: ['node_modules', 'logs']
  }]
}
```

## 性能优化策略（针对2核2G服务器）

### 1. 内存优化

```javascript
// 限制并发连接数
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})

server.maxConnections = 100
```

### 2. 数据库查询优化

```javascript
// 使用索引
// 在模型定义中添加索引
indexes: [
  {
    fields: ['email']
  },
  {
    fields: ['status', 'email_verified']
  }
]

// 分页查询
const getMatches = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit
  
  return Match.findAndCountAll({
    limit,
    offset,
    order: [['created_at', 'DESC']]
  })
}
```

### 3. 日志管理

```javascript
const winston = require('winston')
const DailyRotateFile = require('winston-daily-rotate-file')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d'
    })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}

module.exports = logger
```

### 4. 静态资源处理

```javascript
// 不在后端处理静态资源
// 所有静态资源由 Nginx 直接服务
```

### 5. 连接池优化

```javascript
// 数据库连接池
pool: {
  max: 5,
  min: 0,
  acquire: 30000,
  idle: 10000
}
```

## 安全措施

### 1. 环境变量管理

```bash
NODE_ENV=production
PORT=3000

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_USER=your_email@qq.com
SMTP_PASS=your_smtp_password

FRONTEND_URL=https://datedrop.csust.edu.cn
```

**注意**：SQLite 不需要配置数据库连接信息，数据库文件自动创建在 `database/datedrop.sqlite`

### 2. 输入验证

```javascript
const { body, validationResult } = require('express-validator')

const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .custom(value => {
      if (!value.endsWith('@csust.edu.cn')) {
        throw new Error('必须使用长沙理工大学教育邮箱')
      }
      return true
    }),
  body('password')
    .isLength({ min: 8 })
    .withMessage('密码至少8个字符')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/)
    .withMessage('密码必须包含字母和数字'),
  body('code')
    .isLength({ min: 6, max: 6 })
    .withMessage('验证码必须是6位')
]
```

### 3. SQL注入防护

```javascript
// 使用 Sequelize 的参数化查询
// 不要直接拼接 SQL
```

### 4. XSS防护

```javascript
const helmet = require('koa-helmet')

app.use(helmet())
```

## 监控与日志

### 1. 健康检查接口

```javascript
router.get('/health', async (ctx) => {
  ctx.body = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  }
})
```

### 2. 错误追踪

```javascript
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
})
```

## 部署流程

### 1. 安装依赖

```bash
npm install --production
```

### 2. 数据库初始化

```bash
# SQLite 数据库会在首次运行时自动创建
# 如果使用 Sequelize 迁移，运行：
npx sequelize-cli db:migrate

# 或者使用模型同步（开发环境）
# 在 app.js 中添加：
# await sequelize.sync({ alter: true })
```

### 3. 启动服务

```bash
pm2 start ecosystem.config.js --env production
```

### 4. 查看日志

```bash
pm2 logs datedrop-api
```

### 5. 监控状态

```bash
pm2 monit
```
