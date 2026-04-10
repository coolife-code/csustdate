import cron from 'node-cron'
import logger from '../utils/logger.js'
import { runWeeklyMatching } from '../services/matchingService.js'

const startWeeklyMatchJob = () => {
  cron.schedule('0 0 * * 2', async () => {
    logger.info('Weekly match job started')
    
    try {
      logger.info('Running weekly matching...')
      const result = await runWeeklyMatching()
      logger.info('Weekly matching result', result)
      logger.info('Weekly match job completed')
    } catch (error) {
      logger.error('Weekly match job error:', error)
    }
  })
  
  logger.info('Weekly match job scheduled (every Tuesday at 00:00)')
}

export { startWeeklyMatchJob }
