import AuditWorker from '../src/services/worker/index.js';
import logger from '../src/utils/logger.js';

export default async function handler(req, res) {
  logger.info('Worker endpoint triggered');
  
  const worker = new AuditWorker();
  
  try {
    // Process a batch of jobs
    await worker.processNextBatch();
    
    res.status(200).json({
      status: 'ok',
      message: 'Worker processed job batch',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error in worker endpoint:', error);
    
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}