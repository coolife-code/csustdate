import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import cors from '@koa/cors'
import Router from '@koa/router'
import dotenv from 'dotenv'
import apiRoutes from './routes/index.js'
import errorHandler from './middlewares/errorHandler.js'
import { initDatabase } from './config/database.js'
import { startWeeklyMatchJob } from './jobs/weeklyMatch.js'
import seedBaseData from './database/seedBaseData.js'

dotenv.config()

const app = new Koa()
const router = new Router()

app.use(errorHandler)

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  })
}

bootstrap()

export default app
