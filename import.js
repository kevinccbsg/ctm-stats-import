require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const csv = require('csv-parser');
const fs = require('fs');

// Supabase API credentials and endpoint
const supabaseUrl = process.env.API_URL;
const supabaseApiKey = process.env.ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseApiKey);

const delay = (timeInMilliseconds) => {
  return new Promise(resolve => {
    setTimeout(resolve, timeInMilliseconds);
  });
}

fs.createReadStream(`${__dirname}/stats/Public CTM Masters Match Statistics - All Games.csv`)
  .pipe(csv())
  .on('data', async row => {
    try {
      // Insert data into the players table
      await supabase
        .from('players')
        .upsert({
          name: row.Players,
          profile_picture_url: '', // Add the actual URL
          twitch_url: '', // Add the actual URL
          // Add more player-related data as needed
        }, { onConflict: 'name' });

      // Insert data into the events table
      await supabase
        .from('events')
        .upsert({
          name: row.Event.trim(),
          year: row.Year
        }, { onConflict: 'name' });


      let matchUpsert = {
        event_id: eventData.id, // Replace with the actual event ID
      };
      
      if (row['Match Winner']) {
        const { data: player, error: matchWinner } = await supabase
          .from('players')
          .select()
          .eq('name', row['Match Winner']);
          if (matchWinner) console.error('matchWinner error:', matchWinner);
          matchUpsert.winner_id = player.id;
      }
      // Insert data into the matches table
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .upsert(matchUpsert)
        .select();
/*  
      // Insert data into the tetris_games table
      const { error: gameError } = await supabase
        .from('tetris_games')
        .upsert({
          match_id: matchData.id, // Replace with the actual match ID
          player_id: playerData.id, // Replace with the actual player ID
          game_number: row.Game,
          playstyle: row.Playstyle,
          game_result: row['Won?'] === 'Yes', 
          total_lines: parseInt(row['Total Lines']),
          final_score: parseInt(row['Final Score']),
          start_19l: parseInt(row['19 L Start']),
          trans_19: parseInt(row['19 Trans']),
          post_score_19: parseInt(row['Post Score']),
          start_29L: parseInt(row['29 L Start']),
          trans_29: parseInt(row['29 Trans']),
          lines_29: parseInt(row['29 Lines']),
          score_29: parseInt(row['29 Score']),
          no_m_lines: parseInt(row['No M Lines']),
          no_m_score: parseInt(row['No M Score']),
          topout_type: row['Topout Type'],
          cap: row.Cap,
          sps: row.SPS === 'Yes',
          level_start: parseInt(row['Lvl Start']),
          round: row.Round,
          game_link: row['Game Link'],
          match_pairing: row['Game Link']
        })
        .select();
  
      // Handle errors if necessary
      if (playerError) console.error('Player error:', playerError);
      if (eventError) console.error('Event error:', eventError);
      if (matchError) console.error('Match error:', matchError);
      if (gameError) console.error('Game error:', gameError);
      // delay(500);*/
    } catch (error) {
      console.error('Error:', error);
    }
  });
