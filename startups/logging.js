const winston = require('winston');

winston.add(new winston.transports.File({ filename: './logs/info.log' }));
winston.exceptions.handle(new winston.transports.File({ filename: './logs/exception.log' }));

process.on('unhandledRejection', (ex) => { throw ex });
