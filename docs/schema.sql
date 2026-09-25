-- ============================================================
-- TPB-Based Cyberbullying Intervention System
-- Database Schema (SQLite)
-- Faculty of Computing, Riphah International University
-- ============================================================

-- Users table
CREATE TABLE users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name   TEXT NOT NULL,
    email       TEXT UNIQUE NOT NULL,
    cms_number  TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role        TEXT DEFAULT 'student' CHECK(role IN ('student','admin')),
    department  TEXT,
    living_situation TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scenario question bank (3 constructs × 2 stages × ~8-10 items)
CREATE TABLE scenarios (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    construct       TEXT NOT NULL CHECK(construct IN ('Attitude','SubjectiveNorm','PBC')),
    stage           TEXT NOT NULL CHECK(stage IN ('pre','post')),
    scenario_text   TEXT NOT NULL,   -- the scenario / vignette
    question_text   TEXT NOT NULL    -- the follow-up question
);

-- Options for each scenario (Likert 1-5)
CREATE TABLE scenario_options (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    scenario_id INTEGER NOT NULL REFERENCES scenarios(id),
    option_text TEXT NOT NULL,
    score       INTEGER NOT NULL CHECK(score BETWEEN 1 AND 5)
);

-- Completed assessment sessions (one row per student per stage)
CREATE TABLE assessments (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id                 INTEGER NOT NULL REFERENCES users(id),
    stage                   TEXT NOT NULL CHECK(stage IN ('pre','post')),
    attitude_score          REAL,       -- normalized 0-100
    subjective_norm_score   REAL,
    pbc_score               REAL,
    submitted_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Individual question responses within an assessment
CREATE TABLE assessment_responses (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    assessment_id   INTEGER NOT NULL REFERENCES assessments(id),
    scenario_id     INTEGER NOT NULL REFERENCES scenarios(id),
    selected_score  INTEGER NOT NULL CHECK(selected_score BETWEEN 1 AND 5)
);

-- Intervention content library
CREATE TABLE interventions (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    target_construct    TEXT NOT NULL CHECK(target_construct IN ('Attitude','SubjectiveNorm','PBC')),
    title               TEXT NOT NULL,
    content_type        TEXT NOT NULL CHECK(content_type IN ('video','reading','quiz','case-study')),
    content_body        TEXT,           -- inline text OR video URL
    estimated_minutes   INTEGER
);

-- Tracks which interventions are assigned/completed per user
CREATE TABLE user_intervention_progress (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id),
    intervention_id INTEGER NOT NULL REFERENCES interventions(id),
    status          TEXT DEFAULT 'assigned' CHECK(status IN ('assigned','in-progress','completed')),
    completed_at    TIMESTAMP
);

-- User feedback on completed interventions
CREATE TABLE feedback (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id),
    intervention_id INTEGER NOT NULL REFERENCES interventions(id),
    rating          INTEGER CHECK(rating BETWEEN 1 AND 5),
    comments        TEXT,
    submitted_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
