require('dotenv').config();
const logger = require('./logger');
const { importDataFromCSV } = require('./import');
const {
  loadResult, upsertEvent, upsertMatch, upsertPlayer,
} = require('./store/supabase');

const main = async (path) => {
  logger.info(`Importing file ${path}...`);
  const { players, matches, results } = await importDataFromCSV(path);
  logger.info(`File ${path} imported: ${players.length} players; ${matches.length} matches; ${results.length} records...`);
  if (process.env.USER) {
    for (let index = 0; index < players.length; index += 1) {
      const player = players[index];
      await upsertPlayer(player.Players);
    }
    logger.info('all players imported/updated...');
  }
  if (process.env.MATCHES) {
    for (let index = 0; index < matches.length; index += 1) {
      const match = matches[index];
      await upsertEvent(match.eventName, match.eventYear);
      await upsertMatch(match.eventName, match.eventYear, match.id, match.winner, match.loser);
    }
    logger.info('all events/matches imported/updated...');
  }
  if (process.env.RESULTS) {
    for (let index = 0; index < results.length; index += 1) {
      const result = results[index];
      await loadResult(result);
    }
    logger.info('success importing all results...');
  }
};

module.exports = main;
