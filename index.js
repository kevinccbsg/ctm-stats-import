require('dotenv').config();
const logger = require('./logger');
const { importDataFromCSV } = require('./import');
const { loadResult, upsertEvent, upsertMatch, upsertPlayer } = require('./store/supabase');

const DEFAULT_FILE_PATH = `${__dirname}/stats/Public CTM Masters Match Statistics - All Games.csv`;

const main = async (path = DEFAULT_FILE_PATH) => {
  logger.log(`Importing file ${path}...`);
  const { players, winners, results } = await importDataFromCSV(path);
  logger.log(`File ${path} imported: ${players.length} players; ${winners.length} winners; ${results.length} records...`);
  for (const player of players) {
    await upsertPlayer(player.Players);
  }
  logger.log('all players imported/updated...');
  for (const winner of winners) {
    await upsertEvent(winner.Event.trim(), winner.Year);
    await upsertMatch(winner.Event.trim(), winner.Year, winner['Match ID'], winner['Match Winner']);
  }
  logger.log('all events/matches imported/updated...');
  for (const result of results) {
    await loadResult(result);
  }
  winston.log('success importing all results...');
};

module.exports = main;
