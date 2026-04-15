import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import cors from '@koa/cors'
import Router from '@koa/router'
import 'dotenv/config'
import apiRoutes from './routes/index.js'
import errorHandler from './middlewares/errorHandler.js'
import { initDatabase } from './config/database.js'
import { startAutoUnlockMatchJob } from './jobs/autoUnlockMatch.js'
import { startWeeklyMatchJob } from './jobs/weeklyMatch.js'
import seedBaseData from './database/seedBaseData.js'
import { startEmailQueueWorker } from './services/emailQueueService.js'

const app = new Koa()
const router = new Router()

const parseAllowedOrigins = () => {
  const fromEnv = (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  const defaults = []
  if (process.env.FRONTEND_URL) {
    defaults.push(process.env.FRONTEND_URL.trim())
  }
  if ((process.env.NODE_ENV || 'development') !== 'production') {
    defaults.push('http://localhost:5173')
    defaults.push('http://127.0.0.1:5173')
  }
  return new Set([...defaults, ...fromEnv])
}

const allowedOrigins = parseAllowedOrigins()

app.use(errorHandler)

app.use(cors({
  origin: (ctx) => {
    const requestOrigin = ctx.request.header.origin
    if (!requestOrigin) {
      return process.env.FRONTEND_URL || 'http://localhost:5173'
    }
    if (allowedOrigins.has(requestOrigin)) {
      return requestOrigin
    }
    return false
  },
  credentials: true
}))
app.use(bodyParser({
  jsonLimit: '1mb'
}))

router.get('/health', async (ctx) => {
  ctx.body = {
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString()
    }
  }
})

router.get('/api/health', async (ctx) => {
  ctx.body = {
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString()
    }
  }
})

app.use(router.routes())
app.use(router.allowedMethods())
app.use(apiRoutes.routes())
app.use(apiRoutes.allowedMethods())

const PORT = process.env.PORT || 3000
const bootstrap = async () => {
  await initDatabase()
  await seedBaseData()
  startWeeklyMatchJob()
  startAutoUnlockMatchJob()
  startEmailQueueWorker()
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  })
}

bootstrap()

export default app
