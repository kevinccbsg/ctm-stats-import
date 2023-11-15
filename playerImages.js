require('dotenv').config();
const importPlayers = require('./import/importPlayers');
const { uploadPlayerImage } = require('./store/supabase');
const logger = require('./logger');

const importFile = `${__dirname}/stats/players_rows.csv`;

const main = async () => {
  const players = await importPlayers(importFile);
  for (let index = 0; index < players.length; index += 1) {
    const player = players[index];
    await uploadPlayerImage(player.name.trim(), player.profile_picture_url);
  }
  logger.info('success importing all images...');
};

main();
