import { initDatabase } from '../config/database.js'
import seedBaseData from './seedBaseData.js'
import logger from '../utils/logger.js'

const seedDatabase = async () => {
  try {
    logger.info('Starting database seeding...')
    await initDatabase()
    await seedBaseData()
    logger.info('Database seeding completed successfully')
    process.exit(0)
  } catch (error) {
    logger.error('Database seeding failed:', error)
    process.exit(1)
  }
}

seedDatabase()
