-- ============================================================
-- TPB-Based Cyberbullying Intervention System
-- Database Schema (SQLite)
-- Faculty of Computing, Riphah International University
-- ============================================================

-- Users table
CREATE TABLE users (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name           TEXT NOT NULL,
    email               TEXT UNIQUE NOT NULL,
    cms_number          TEXT UNIQUE NOT NULL,
    password_hash       TEXT NOT NULL,
    role                TEXT DEFAULT 'student' CHECK(role IN ('student', 'admin')),
    department          TEXT,
    living_situation    TEXT,
    university          TEXT,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    login_count         INTEGER DEFAULT 0 NOT NULL
);

-- User Profiles (Adaptive Assessment Intelligence Requirement 5)
CREATE TABLE user_profiles (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id                 INTEGER UNIQUE NOT NULL REFERENCES users(id),
    age_group               TEXT,
    gender                  TEXT,
    department              TEXT,
    academic_level          TEXT,
    academic_year           TEXT,
    living_situation        TEXT,
    social_media_platforms  TEXT,           -- JSON array
    social_media_frequency  TEXT,
    online_communities      TEXT,           -- JSON array
    digital_usage_patterns  TEXT,           -- JSON array
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Profiles (Rich behavioral profile from onboarding)
CREATE TABLE student_profiles (
    id                              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id                         INTEGER UNIQUE NOT NULL REFERENCES users(id),
    university                      TEXT,
    degree_program                  TEXT,
    academic_level                  TEXT,
    academic_year                   TEXT,
    faculty_department              TEXT,
    living_situation                TEXT,
    learning_environment            TEXT,
    class_size                      TEXT,
    platforms_used                  TEXT,   -- JSON array
    online_activity_level           TEXT,
    main_online_activities          TEXT,   -- JSON array
    main_interaction_with           TEXT,
    university_groups_participation TEXT,
    university_activity_level       TEXT,
    participation_types             TEXT,   -- JSON array
    social_role                     TEXT,
    encounter_frequency             TEXT,
    experience_types                TEXT,   -- JSON array
    experience_role                 TEXT,
    created_at                      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at                      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scenario Template Library
CREATE TABLE scenario_templates (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    scenario_id             TEXT NOT NULL,
    category                TEXT NOT NULL,
    platform_context        TEXT,
    living_context          TEXT,
    department_context      TEXT,
    difficulty_level        INTEGER DEFAULT 1 NOT NULL,
    tpb_dimension           TEXT NOT NULL,
    scenario_text           TEXT NOT NULL,
    question_text           TEXT,
    answer_options          TEXT NOT NULL,  -- JSON array of {text, score}
    context_tags            TEXT,           -- JSON array
    personalization_tags    TEXT,           -- JSON object
    narrative_variations    TEXT,           -- JSON array
    questions_data          TEXT,           -- JSON array
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Scenario History (Anti-repetition tracking)
CREATE TABLE user_scenario_history (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id             INTEGER NOT NULL REFERENCES users(id),
    scenario_id         INTEGER REFERENCES scenarios(id),
    template_id         INTEGER REFERENCES scenario_templates(id),
    template_key        TEXT,
    scenario_hash       TEXT,
    scenario_summary    TEXT,
    stage               TEXT DEFAULT 'pre' NOT NULL,
    difficulty_level    INTEGER DEFAULT 1 NOT NULL,
    shown_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scenario question bank (Legacy TPB items)
CREATE TABLE scenarios (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    construct           TEXT NOT NULL CHECK(construct IN ('Attitude','SubjectiveNorm','PBC','BehavioralIntention')),
    stage               TEXT NOT NULL CHECK(stage IN ('pre','post')),
    scenario_text       TEXT NOT NULL,   -- the scenario / vignette
    question_text       TEXT NOT NULL,   -- the follow-up question
    category            TEXT,
    platform_context    TEXT,
    living_context      TEXT,
    department_context  TEXT,
    difficulty_level    INTEGER DEFAULT 1 NOT NULL
);

-- Options for each legacy scenario (Likert 1-7)
CREATE TABLE scenario_options (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    scenario_id INTEGER NOT NULL REFERENCES scenarios(id),
    option_text TEXT NOT NULL,
    score       INTEGER NOT NULL CHECK(score BETWEEN 1 AND 7)
);

-- Completed assessment sessions (one row per student per stage - Legacy model)
CREATE TABLE assessments (
    id                          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id                     INTEGER NOT NULL REFERENCES users(id),
    stage                       TEXT NOT NULL CHECK(stage IN ('pre','post')),
    attitude_score              REAL,       -- normalized 0-100
    subjective_norm_score       REAL,
    pbc_score                   REAL,
    behavioral_intention_score  REAL,
    submitted_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Individual question responses within a legacy assessment
CREATE TABLE assessment_responses (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    assessment_id   INTEGER NOT NULL REFERENCES assessments(id),
    scenario_id     INTEGER NOT NULL REFERENCES scenarios(id),
    selected_score  INTEGER NOT NULL CHECK(selected_score BETWEEN 1 AND 7)
);

-- Intervention content library
CREATE TABLE interventions (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    target_construct    TEXT NOT NULL CHECK(target_construct IN ('Attitude','SubjectiveNorm','PBC','BehavioralIntention')),
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

-- Scenario-Based Assessment Instances (v2.0 container)
CREATE TABLE assessment_instances (
    id                          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id                     INTEGER NOT NULL REFERENCES users(id),
    stage                       TEXT NOT NULL CHECK(stage IN ('pre','post')),
    status                      TEXT DEFAULT 'generated' NOT NULL CHECK(status IN ('generated','in_progress','submitted')),
    generated_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at                TIMESTAMP,
    attitude_score              REAL,
    subjective_norm_score       REAL,
    pbc_score                   REAL,
    behavioral_intention_score  REAL,
    UNIQUE(user_id, stage)
);

-- Assessment Scenarios (v2.0 3 narrative situations per instance)
CREATE TABLE assessment_scenarios (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    instance_id         INTEGER NOT NULL REFERENCES assessment_instances(id),
    order_index         INTEGER NOT NULL,
    scenario_text       TEXT NOT NULL,
    category            TEXT,
    platform_context    TEXT,
    user_context_used   TEXT            -- JSON summary of profile factors
);

-- Assessment Questions (v2.0 grouped questions under scenarios)
CREATE TABLE assessment_questions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    scenario_id     INTEGER NOT NULL REFERENCES assessment_scenarios(id),
    order_index     INTEGER NOT NULL,
    question_text   TEXT NOT NULL,
    options_json    TEXT NOT NULL,      -- JSON: [{text, score}, ...]
    tpb_construct   TEXT NOT NULL CHECK(tpb_construct IN ('Attitude','SubjectiveNorm','PBC','BehavioralIntention')),
    selected_score  INTEGER
);

-- Password reset tokens for email-based password recovery
CREATE TABLE password_reset_tokens (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    token       TEXT UNIQUE NOT NULL,
    expires_at  TIMESTAMP NOT NULL,
    used        BOOLEAN NOT NULL DEFAULT 0,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for query optimization
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_scenario_templates_scenario_id ON scenario_templates(scenario_id);
CREATE INDEX IF NOT EXISTS idx_user_scenario_history_user_id ON user_scenario_history(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_instances_user_stage ON assessment_instances(user_id, stage);
CREATE INDEX IF NOT EXISTS idx_assessment_scenarios_instance_id ON assessment_scenarios(instance_id);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_scenario_id ON assessment_questions(scenario_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
