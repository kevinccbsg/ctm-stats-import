const winston = require('winston');

winston.configure({
  transports: [
    new (winston.transports.File)({ filename: 'import.log' }),
  ],
});

module.exports = winston;
