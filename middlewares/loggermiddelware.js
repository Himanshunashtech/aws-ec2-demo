import logger from '../utils/logger.js';

const requestLogger = (req, res, next) => {
    // Capture request start time
    const start = Date.now();
    
    
    logger.info(`Request Method: ${req.method}`);
    logger.info(`Request URL: ${req.originalUrl}`);
    logger.info(`Request Query: ${JSON.stringify(req.query)}`);
    logger.info(`Request Body: ${JSON.stringify(req.body)}`);
    
    // Capture the original send function
    const originalSend = res.send;

    // Intercept response to log response details
    res.send = function (body) {
        // Log response details
        logger.info(`Response Status: ${res.statusCode}`);
        logger.info(`Response Body: ${body}`);
        
        // Log the time taken for the request
        const duration = Date.now() - start;
        logger.info(`Request Duration: ${duration}ms`);

        // Call the original send function
        originalSend.call(this, body);
    };

    next();
};

export default requestLogger;

