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
          match.loser = row['Match Winner'] !== row.Players ? row.Players : results[index - 1].Players;
        }
        return match;
      }).filter((match) => !!match.winner);
      const resultsExtended = results.map((result, index) => {
        let opponent = null;
        const nextElementSameGame = results[index + 1] && results[index + 1].Game === result.Game;
        const nextElementSameMatch = results[index + 1] && results[index + 1]['Match ID'] === result['Match ID'];
        if (nextElementSameGame && nextElementSameMatch) {
          opponent = results[index + 1].Players;
        } else {
          opponent = results[index - 1].Players;
        }
        return {
          ...result,
          opponent,
        };
      });
      return resolve({
        players,
        matches,
        results: resultsExtended,
      });
    });
});

module.exports = { importDataFromCSV };
