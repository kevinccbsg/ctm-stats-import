## ctm-stats-import

This repository imports CTM CSV stats to a Database structure in your [local supabase](https://supabase.com/docs/guides/cli/local-development).

This is the database schema you need to import. You can do it in the [SQL Editor](https://supabase.com/docs/guides/database/overview).

```sql
create table
  public.players (
    id serial,
    name character varying(255) not null,
    profile_picture_url text null,
    twitch_url text null,
    constraint players_pkey primary key (id),
    constraint players_name_key unique (name)
  ) tablespace pg_default;

create table
  public.events (
    id serial,
    name character varying(255) not null,
    year smallint not null,
    constraint events_pkey primary key (id),
    constraint unique_event_name unique (name)
  ) tablespace pg_default;

create table
  public.matches (
    id serial,
    event_id integer not null,
    winner_id integer not null,
    loser_id integer not null,
    constraint matches_pkey primary key (id),
    constraint matches_loser_id_fkey foreign key (loser_id) references players (id),
    constraint matches_winner_id_fkey foreign key (winner_id) references players (id),
    constraint matches_event_id_fkey foreign key (event_id) references events (id)
  ) tablespace pg_default;

create table
  public.tetris_games (
    id serial,
    match_id integer not null,
    player_id integer not null,
    game_number integer not null,
    playstyle character varying(50) not null,
    game_result boolean not null,
    total_lines integer null,
    final_score integer null,
    start_19l integer null,
    trans_19 integer null,
    post_score_19 integer null,
    start_29l integer null,
    trans_29 integer null,
    lines_29 integer null,
    score_29 integer null,
    no_m_lines integer null,
    no_m_score integer null,
    topout_type character varying(255) not null,
    cap character varying(10) not null,
    sps boolean not null,
    level_start integer not null,
    round character varying(255) not null,
    game_link text null,
    match_pairing character varying(10) not null,
    opponent_id integer null,
    constraint tetris_games_pkey primary key (id),
    constraint tetris_games_match_id_fkey foreign key (match_id) references matches (id),
    constraint tetris_games_player_id_fkey foreign key (player_id) references players (id),
    constraint tetris_games_opponent_id_fkey foreign key (opponent_id) references players (id)
  ) tablespace pg_default;
```

You also need to create these Functions.

```sql
-- lifetime_stats
CREATE OR REPLACE FUNCTION lifetime_stats()
RETURNS TABLE (
  id INT,
  name VARCHAR(255),
  profile_picture_url TEXT,
  twitch_url TEXT,
  games_won INT,
  total_games INT,
  maxout_games INT,
  winning_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
      p.id,
      p.name,
      p.profile_picture_url,
      p.twitch_url,
      COUNT(tg.game_result = true or NULL)::integer AS games_won,
      SUM(CASE WHEN tg.final_score >= 1000000 THEN 1 ELSE 0 END)::integer AS maxout_games,
      COUNT(*)::integer AS total_games,
      CASE
        WHEN COUNT(*) > 0 THEN COUNT(tg.game_result = true or NULL) * 100.0 / NULLIF(COUNT(*), 0)
        ELSE 0
      END AS winning_percentage
    FROM
      players p
      LEFT JOIN tetris_games tg ON p.id = tg.player_id
    GROUP BY
      p.id, p.name, p.profile_picture_url, p.twitch_url;
  RETURN;
END;
$$ LANGUAGE plpgsql;
```

```sql
--- year stats, sames as previous one but with a year filter
CREATE OR REPLACE FUNCTION year_stats(
  IN event_year_param INT
)
RETURNS TABLE (
  id INT,
  name VARCHAR(255),
  profile_picture_url TEXT,
  twitch_url TEXT,
  games_won INT,
  total_games INT,
  maxout_games INT,
  winning_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
      p.id,
      p.name,
      p.profile_picture_url,
      p.twitch_url,
      COUNT(tg.game_result = true or NULL)::integer AS games_won,
      SUM(CASE WHEN tg.final_score >= 1000000 THEN 1 ELSE 0 END)::integer AS maxout_games,
      COUNT(*)::integer AS total_games,
      CASE
        WHEN COUNT(*) > 0 THEN COUNT(tg.game_result = true or NULL) * 100.0 / NULLIF(COUNT(*), 0)
        ELSE 0
      END AS winning_percentage
    FROM
      players p
      LEFT JOIN tetris_games tg ON p.id = tg.player_id
      LEFT JOIN matches m ON m.id = tg.match_id
      LEFT JOIN events e ON e.id = m.event_id
    WHERE
      e.year = event_year_param
    GROUP BY
      p.id, p.name, p.profile_picture_url, p.twitch_url;
  RETURN;
END;
$$ LANGUAGE plpgsql;
```

```sql
-- player vs player function
CREATE OR REPLACE FUNCTION get_player_v_player_results(
    player1_id INT,
    player2_id INT
)
RETURNS TABLE (
    match_id INT,
    game_number INT,
    round_max TEXT,
    event_name TEXT,
    player1_style TEXT,
    player1_topout TEXT,
    player1_score INT,
    player1_result TEXT,
    player2_result TEXT,
    player2_score INT,
    player2_topout TEXT,
    player2_style TEXT
)
AS $$
BEGIN
    RETURN QUERY
    SELECT
        tg.match_id,
        tg.game_number,
        MAX(tg.round) AS round_max,
        MAX(e.name) AS event_name,
        MAX(CASE WHEN player_id = 88 THEN playstyle END) AS player1_style,
        MAX(CASE WHEN tg.player_id = player1_id THEN tg.topout_type END) AS player1_topout,
        MAX(CASE WHEN tg.player_id = player1_id THEN tg.final_score END)::integer AS player1_score,
        MAX(CASE WHEN tg.player_id = player1_id THEN CASE WHEN tg.game_result = true THEN 'Win' ELSE 'Loss' END END) AS player1_result,
        MAX(CASE WHEN tg.player_id = player2_id THEN CASE WHEN tg.game_result = true THEN 'Win' ELSE 'Loss' END END) AS player2_result,
        MAX(CASE WHEN tg.player_id = player2_id THEN tg.final_score END)::integer AS player2_score,
        MAX(CASE WHEN tg.player_id = player2_id THEN tg.topout_type END) AS player2_topout,
        MAX(CASE WHEN tg.player_id = player2_id THEN tg.playstyle END) AS player2_style
    FROM
        tetris_games tg
        LEFT JOIN matches m ON m.id = tg.match_id
        LEFT JOIN events e ON e.id = m.event_id
    WHERE
        (tg.player_id = player1_id OR tg.opponent_id = player1_id)
        AND (tg.player_id = player2_id OR tg.opponent_id = player2_id)
    GROUP BY
        tg.match_id, tg.game_number
    ORDER BY
        tg.match_id DESC, tg.game_number DESC;

    RETURN;
END;
$$ LANGUAGE plpgsql;
```

After your create that structure you have to download the [All games CSV](https://docs.google.com/spreadsheets/d/11EVjpP3bq1Q5zZJqZI23dmiYIsfcKcJBO376BTR6bBI/edit#gid=273282169) and place it in the stats folder with the name `Public CTM Masters Match Statistics - All Games.csv`.

## Execute script

You need to include this `.env` file in the source of the project.

```bash
# these values appear after you run the npx supabase start command
API_URL=http://localhost:54321
GRAPHQL_URL=http://localhost:54321/graphql/v1
DB_URL=postgresql://postgres:postgres@localhost:54322/postgres
STUDIO_URL=http://localhost:54323
INBUCKET_URL=http://localhost:54324
JWT_SECRET=<JWT_SECRET>
SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY>
```

Once you include that `.env` file you can execute:

```bash
# install dependencies
npm install
# import all data
npm run importData
```
