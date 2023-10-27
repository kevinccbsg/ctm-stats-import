require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const csv = require('csv-parser');
const fs = require('fs');
const { uniqBy, groupBy } = require('lodash');

// Supabase API credentials and endpoint
const supabaseUrl = process.env.API_URL;
const supabaseApiKey = process.env.ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseApiKey);

const upsertPlayer = async (playerName) => {
  await supabase
    .from('players')
    .upsert({
      name: playerName,
      profile_picture_url: '', // Add the actual URL
      twitch_url: '', // Add the actual URL
      // Add more player-related data as needed
    }, { onConflict: 'name' });
};

const upsertEvent = async (eventName, eventYear) => {
  await supabase
    .from('events')
    .upsert({
      name: eventName,
      year: eventYear,
    }, { onConflict: 'name' });
};

const upsertMatch = async (eventName, eventYear, matchId, playerWinner) => {
  const { data: eventData } = await supabase
    .from('events')
    .select()
    .single()
    .eq('name', eventName)
    .eq('year', eventYear);
  if (!eventData) throw new Error(`Could not get eventData ${eventName}`);
  let matchUpsert = {
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
  await supabase
    .from('matches')
    .upsert({
      id: matchId,
      event_id: eventData.id,
      winner_id: player.id,
    }).select();
};

const loadResult = async (result) => {
  const { data: player } = await supabase
    .from('players')
    .select()
    .single()
    .eq('name', result.Players);
  const { error } = await supabase
    .from('tetris_games')
    .upsert({
      match_id: result['Match ID'],
      player_id: player.id,
      game_number: result.Game,
      playstyle: result.Playstyle,
      game_result: result['Won?'] === 'Yes', 
      total_lines: parseInt(result['Total Lines']),
      final_score: parseInt(result['Final Score']),
      start_19l: parseInt(result['19 L Start']),
      trans_19: parseInt(result['19 Trans']),
      post_score_19: parseInt(result['Post Score']),
      start_29l: parseInt(result['29 L Start']),
      trans_29: parseInt(result['29 Trans']),
      lines_29: parseInt(result['29 Lines']),
      score_29: parseInt(result['29 Score']),
      no_m_lines: parseInt(result['No M Lines']),
      no_m_score: parseInt(result['No M Score']),
      topout_type: result['Topout Type'],
      cap: result.Cap,
      sps: result.SPS === 'Yes',
      level_start: parseInt(result['Lvl Start']),
      round: result.Round,
      game_link: result['Game Link'],
      match_pairing: result['Match Pairing']
    })
    .select();
};

const results = [];
fs.createReadStream(`${__dirname}/stats/Public CTM Masters Match Statistics - All Games.csv`)
  .pipe(csv())
  .on('data', row => results.push(row))
  .on('end', async () => {
    try {
      const players = uniqBy(results, 'Players');
      for (const player of players) {
        await upsertPlayer(player.Players);
      }
      const winners = results.filter(player => !!player['Match Winner']);
      for (const winner of winners) {
        await upsertEvent(winner.Event.trim(), winner.Year);
        await upsertMatch(winner.Event.trim(), winner.Year, winner['Match ID'], winner['Match Winner']);
      }
      for (const result of results) {
        await loadResult(result);
      }
    } catch (error) {
      console.log(error);
    }
  });
