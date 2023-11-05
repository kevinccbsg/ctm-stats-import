const importData = require('.');
const logger = require('./logger');

const importFile = `${__dirname}/stats/Public CTM Masters Match Statistics - All Games.csv`;

importData(importFile)
  .then(() => logger.info('success...'))
  .catch((error) => logger.error('Error uploading results', error));
