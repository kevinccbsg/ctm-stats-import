const csv = require('csv-parser');
const fs = require('fs');

const importPlayers = (filePath) => new Promise((resolve, reject) => {
  const results = [];
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => results.push(row))
    .on('error', (error) => reject(error))
    .on('end', async () => resolve(results));
});

module.exports = importPlayers;
