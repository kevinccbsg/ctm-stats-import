## ctm-stats-import

This repository imports CTM CSV stats to a Database structure in supabase.

This is the database schema you need to import.

```sql
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    profile_picture_url TEXT,
    twitch_url TEXT
    -- Add more player-related columns as needed
);

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE
    -- Add more event-related columns as needed
);

CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    event_id INT REFERENCES events(event_id),
    winner_id INT REFERENCES players(player_id),
    CONSTRAINT unique_event_winner_combination UNIQUE (event_id, winner_id)
);

CREATE TABLE tetris_games (
    id SERIAL PRIMARY KEY,
    match_id INT REFERENCES matches(id),
    player_id INT REFERENCES players(id),
    game_number INT,
    playstyle VARCHAR(50),
    game_result BOOLEAN, -- True if the player won, False if not
    total_lines INT,
    final_score INT,
    start_19L INT,
    trans_19 INT,
    post_score_19 INT,
    start_29L INT,
    trans_29 INT,
    lines_29 INT,
    score_29 INT,
    no_m_lines INT,
    no_m_score INT,
    topout_type VARCHAR(255),
    cap VARCHAR(10),
    sps BOOLEAN,
    level_start INT,
    round VARCHAR(255),
    game_link TEXT,
    match_pairing VARCHAR(10)
);
```

All the stats will be in the stats folder.

## Execute script

You need to include this `.env` file in the source of the project.

```
API_URL=http://localhost:54321
GRAPHQL_URL=http://localhost:54321/graphql/v1
DB_URL=postgresql://postgres:postgres@localhost:54322/postgres
STUDIO_URL=http://localhost:54323
INBUCKET_URL=http://localhost:54324
JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long
ANON_KEY=<ANON_KEY>
SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY>
```

Once you include that `.env` file you can execute

```
npm install
npm run importData

// Linter script
npm run lint
```
