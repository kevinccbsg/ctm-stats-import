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