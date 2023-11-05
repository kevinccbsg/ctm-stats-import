const { createClient } = require('@supabase/supabase-js');
const logger = require('../logger');

const supabaseUrl = process.env.API_URL;
const supabaseApiKey = process.env.ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseApiKey);

// TODO: throw error exceptions
const upsertPlayer = async (playerName) => {
  const { error } = await supabase
    .from('players')
    .upsert({
      name: playerName,
      profile_picture_url: '', // Add the actual URL
      twitch_url: '', // Add the actual URL
      // Add more player-related data as needed
    }, { onConflict: 'name' });
  if (error) logger.error(error);
};

const upsertEvent = async (eventName, eventYear) => {
  const { error } = await supabase
    .from('events')
    .upsert({
      name: eventName,
      year: eventYear,
    }, { onConflict: 'name' });
  if (error) logger.error(error);
};

const upsertMatch = async (eventName, eventYear, matchId, playerWinner) => {
  const { data: eventData, error } = await supabase
    .from('events')
    .select()
    .single()
    .eq('name', eventName)
    .eq('year', eventYear);
  if (error) logger.error(error);
  if (!eventData) throw new Error(`Could not get eventData ${eventName}`);
  const matchUpsert = {
    event_id: eventData.id, // Replace with the actual event ID
  };
  const { data: player } = await supabase
    .from('players')
    .select()
    .single()
    .eq('name', playerWinner);
  if (!player) throw new Error(`Could not get matchWinner player ${playerWinner}`);
  matchUpsert.winner_id = player.id;
  // Insert data into the matches table
  const { error: errorMatches } = await supabase
    .from('matches')
    .upsert({
      id: matchId,
      event_id: eventData.id,
      winner_id: player.id,
    }).select();
  if (error) logger.error(errorMatches);
};

const loadResult = async (result) => {
  const { data: player, error } = await supabase
    .from('players')
    .select()
    .single()
    .eq('name', result.Players);
  if (error) logger.error(error);
  const { error: tetrisGameError } = await supabase
    .from('tetris_games')
    .upsert({
      match_id: result['Match ID'],
      player_id: player.id,
      game_number: result.Game,
      playstyle: result.Playstyle,
      game_result: result['Won?'] === 'Yes',
      total_lines: parseInt(result['Total Lines'], 10),
      final_score: parseInt(result['Final Score'], 10),
      start_19l: parseInt(result['19 L Start'], 10),
      trans_19: parseInt(result['19 Trans'], 10),
      post_score_19: parseInt(result['Post Score'], 10),
      start_29l: parseInt(result['29 L Start'], 10),
      trans_29: parseInt(result['29 Trans'], 10),
      lines_29: parseInt(result['29 Lines'], 10),
      score_29: parseInt(result['29 Score'], 10),
      no_m_lines: parseInt(result['No M Lines'], 10),
      no_m_score: parseInt(result['No M Score'], 10),
      topout_type: result['Topout Type'],
      cap: result.Cap,
      sps: result.SPS === 'Yes',
      level_start: parseInt(result['Lvl Start'], 10),
      round: result.Round,
      game_link: result['Game Link'],
      match_pairing: result['Match Pairing'],
    })
    .select();
  if (tetrisGameError) logger.error(tetrisGameError);
};

module.exports = {
  upsertPlayer,
  upsertEvent,
  upsertMatch,
  loadResult,
};
