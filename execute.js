const importData = require('./');
const logger = require('./logger');

importData()
  .then(() => logger.info('success...'))
  .catch(error => logger.error('Error uploading results', error));
