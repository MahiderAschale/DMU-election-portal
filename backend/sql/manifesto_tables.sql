CREATE TABLE IF NOT EXISTS manifesto_session (
  id SERIAL PRIMARY KEY,
  election_id INTEGER NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  meeting_link VARCHAR(500) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS manifesto_session_election_id_unique
  ON manifesto_session(election_id);

CREATE TABLE IF NOT EXISTS manifesto_attendance (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  election_id INTEGER NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP NULL,
  duration_minutes INTEGER NULL,
  is_valid BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS manifesto_attendance_user_election_idx
  ON manifesto_attendance(user_id, election_id);
