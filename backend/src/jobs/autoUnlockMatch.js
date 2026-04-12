import cron from 'node-cron'
import logger from '../utils/logger.js'
import { autoUnlockExpiredPendingMatches } from '../services/matchingService.js'

const startAutoUnlockMatchJob = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const result = await autoUnlockExpiredPendingMatches()
      if (result.autoUnlocked > 0) {
        logger.info('Auto unlock expired pending matches completed', result)
      }
    } catch (error) {
      logger.error('Auto unlock expired pending matches error:', error)
    }
  })

  logger.info('Auto unlock match job scheduled (every 5 minutes)')
}

export { startAutoUnlockMatchJob }
