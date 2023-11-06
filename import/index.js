const csv = require('csv-parser');
const fs = require('fs');
const { uniqBy } = require('lodash');

const importDataFromCSV = (filePath) => new Promise((resolve, reject) => {
  const results = [];
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => results.push(row))
    .on('error', (error) => reject(error))
    .on('end', async () => {
      const players = uniqBy(results, 'Players');
      const matches = results.map((row, index) => {
        const match = {
          id: row['Match ID'],
          eventName: row.Event.trim(),
          eventYear: row.Year,
        };
        if (row['Match Winner']) {
          match.winner = row['Match Winner'];
          match.losser = row['Match Winner'] !== row.Player ? row['Match Winner'] : results[index - 1].Player;
        }
        return match;
      }).filter((match) => !!match.winner);
      return resolve({
        players,
        matches,
        results,
      });
    });
});

module.exports = { importDataFromCSV };
