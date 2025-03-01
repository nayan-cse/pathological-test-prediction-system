import winston from "winston";
import path from "path";
import fs from "fs";

// Ensure logs directory exists
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
);

const logger = winston.createLogger({
    level: "info",
    format: logFormat,
    transports: [
        new winston.transports.File({
            filename: path.join(logDir, `system-${new Date().toISOString().split("T")[0]}.log`),
            level: "info",
        }),
        new winston.transports.Console({
            format: winston.format.simple(),
        }),
    ],
});

export default logger;
