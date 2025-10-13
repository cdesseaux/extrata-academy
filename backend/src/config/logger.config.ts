import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

export const loggerConfig: WinstonModuleOptions = {
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.prettyPrint(),
  ),
  defaultMeta: {
    service: 'extrata-academy-api',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
          const contextStr = context ? `[${context}] ` : '';
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} ${level}: ${contextStr}${message}${metaStr}`;
        }),
      ),
    }),
    
    // File transport para desenvolvimento
    ...(process.env.NODE_ENV === 'development' ? [
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    ] : []),
    
    // File transport para produção
    ...(process.env.NODE_ENV === 'production' ? [
      new winston.transports.File({
        filename: '/var/log/extrata-academy/error.log',
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
      new winston.transports.File({
        filename: '/var/log/extrata-academy/combined.log',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    ] : []),
  ],
  
  // Configurações de exceção
  exceptionHandlers: [
    new winston.transports.File({
      filename: process.env.NODE_ENV === 'production' 
        ? '/var/log/extrata-academy/exceptions.log'
        : 'logs/exceptions.log',
    }),
  ],
  
  // Configurações de rejeição
  rejectionHandlers: [
    new winston.transports.File({
      filename: process.env.NODE_ENV === 'production'
        ? '/var/log/extrata-academy/rejections.log'
        : 'logs/rejections.log',
    }),
  ],
};


