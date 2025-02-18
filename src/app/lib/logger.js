import winston from 'winston';

const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
);

const logger = winston.createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        new winston.transports.File({
            filename: 'logs/system.log',
            level: 'info',
        }),
        new winston.transports.Console({
            format: winston.format.simple(),
        }),
    ],
});

export default logger;
