const csv = require('csv-parser');
const fs = require('fs');
const { uniqBy } = require('lodash');

const importDataFromCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', row => results.push(row))
      .on('error', error => reject(error))
      .on('end', async () => {
        const players = uniqBy(results, 'Players');
        const winners = results.filter(player => !!player['Match Winner']);
        return resolve({
          players,
          winners,
          results,
        });
      });
  });
};

module.exports = { importDataFromCSV };

