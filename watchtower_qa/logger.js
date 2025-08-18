const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Configure Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'watchtower-qa' },
    transports: [
        // Write all logs to console
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
                winston.format.printf(({ timestamp, level, message, ...meta }) => {
                    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
                })
            )
        }),
        
        // Write all logs with level 'info' and below to 'combined.log'
        new winston.transports.File({ 
            filename: path.join(logsDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        
        // Write all logs with level 'error' and below to 'error.log'
        new winston.transports.File({ 
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

// QA Logger with methods matching qa_runner.js expectations
const qaLogger = {
    // Standard logging methods
    info: (message, meta = {}) => logger.info(message, meta),
    warn: (message, meta = {}) => logger.warn(message, meta),
    error: (message, meta = {}) => logger.error(message, meta),
    debug: (message, meta = {}) => logger.debug(message, meta),
    
    // QA Runner expected methods - exact matches
    logTestStart: (testName, details) => {
        logger.info(`🎯 Starting QA test: ${testName}`, { 
            testName, 
            inputCount: details.inputCount,
            testApi: details.testApi,
            parallel: details.parallel,
            timestamp: details.timestamp,
            event: 'test_start' 
        });
    },
    
    logTestResults: (testName, results) => {
        const summary = results.summary || {};
        const overview = summary.overview || {};
        
        logger.info(`✅ QA test completed: ${testName}`, {
            testName,
            totalTests: overview.totalTests,
            passed: overview.passed,
            failed: overview.failed,
            successRate: overview.passRate,
            totalDuration: `${results.totalDuration}ms`,
            apiCalls: summary.api?.totalCalls || 0,
            apiFailures: summary.api?.failures || 0,
            event: 'test_complete'
        });
    },
    
    logError: (message, error) => {
        logger.error(`❌ ${message}`, {
            error: error?.message || error,
            stack: error?.stack,
            event: 'error'
        });
    },
    
    // Legacy methods for backward compatibility
    testStart: (testName, batchSize) => {
        logger.info(`🎯 Starting QA test: ${testName}`, { 
            testName, 
            batchSize,
            event: 'test_start' 
        });
    },
    
    testComplete: (testName, results) => {
        const { totalGenerated, validCount, invalidCount, timeTaken } = results;
        logger.info(`✅ QA test completed: ${testName}`, {
            testName,
            totalGenerated,
            validCount,
            invalidCount,
            successRate: `${((validCount / totalGenerated) * 100).toFixed(2)}%`,
            timeTaken: `${timeTaken}ms`,
            event: 'test_complete'
        });
    },
    
    generationStats: (stats) => {
        logger.info(`📊 Generation statistics`, {
            ...stats,
            event: 'generation_stats'
        });
    },
    
    validationError: (error, data) => {
        logger.warn(`❌ Validation failed`, {
            error: error.message,
            invalidData: data,
            event: 'validation_error'
        });
    },
    
    performanceMetric: (operation, duration, details = {}) => {
        logger.info(`⚡ Performance: ${operation}`, {
            operation,
            duration: `${duration}ms`,
            ...details,
            event: 'performance_metric'
        });
    },
    
    batchProgress: (current, total, operation) => {
        const percentage = ((current / total) * 100).toFixed(1);
        logger.info(`🔄 ${operation} progress: ${current}/${total} (${percentage}%)`, {
            current,
            total,
            percentage,
            operation,
            event: 'batch_progress'
        });
    },
    
    systemInfo: (info) => {
        logger.info(`🖥️ System info`, {
            ...info,
            event: 'system_info'
        });
    }
};

module.exports = qaLogger;