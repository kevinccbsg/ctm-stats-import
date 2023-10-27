require('dotenv').config();
const winston = require('winston');
const { importDataFromCSV } = require('./import');
const { loadResult, upsertEvent, upsertMatch, upsertPlayer } = require('./store/supabase');

winston.configure({
  transports: [
    new (winston.transports.File)({ filename: 'import.log' }),
  ],
});

const DEFAULT_FILE_PATH = `${__dirname}/stats/Public CTM Masters Match Statistics - All Games.csv`;

const main = async (path = DEFAULT_FILE_PATH) => {
  winston.log(`Importing file ${path}...`);
  const { players, winners, results } = await importDataFromCSV(path);
  winston.log(`File ${path} imported: ${players.length} players; ${winners.length} winners; ${results.length} records...`);
  for (const player of players) {
    await upsertPlayer(player.Players);
  }
  winston.log('all players imported/updated...');
  for (const winner of winners) {
    await upsertEvent(winner.Event.trim(), winner.Year);
    await upsertMatch(winner.Event.trim(), winner.Year, winner['Match ID'], winner['Match Winner']);
  }
  winston.log('all events/matches imported/updated...');
  for (const result of results) {
    await loadResult(result);
  }
  winston.log('success importing all results...');
};