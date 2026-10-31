"""
migrate_scenario_assessment.py — Create tables for the 3-scenario assessment model.

Tables created:
  - assessment_instances
  - assessment_scenarios
  - assessment_questions
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "app.db")


def migrate():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # 1. assessment_instances
    cur.execute("""
        CREATE TABLE IF NOT EXISTS assessment_instances (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id),
            stage VARCHAR(5) NOT NULL CHECK(stage IN ('pre','post')),
            status VARCHAR(20) DEFAULT 'generated' CHECK(status IN ('generated','in_progress','submitted')),
            generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            submitted_at DATETIME,
            attitude_score REAL,
            subjective_norm_score REAL,
            pbc_score REAL,
            behavioral_intention_score REAL
        )
    """)
    cur.execute("CREATE INDEX IF NOT EXISTS ix_assessment_instances_user_id ON assessment_instances(user_id)")
    print("[OK] assessment_instances table created.")

    # 2. assessment_scenarios
    cur.execute("""
        CREATE TABLE IF NOT EXISTS assessment_scenarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            instance_id INTEGER NOT NULL REFERENCES assessment_instances(id),
            order_index INTEGER NOT NULL,
            scenario_text TEXT NOT NULL,
            category VARCHAR(100),
            platform_context VARCHAR(100),
            user_context_used TEXT
        )
    """)
    cur.execute("CREATE INDEX IF NOT EXISTS ix_assessment_scenarios_instance_id ON assessment_scenarios(instance_id)")
    print("[OK] assessment_scenarios table created.")

    # 3. assessment_questions
    cur.execute("""
        CREATE TABLE IF NOT EXISTS assessment_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scenario_id INTEGER NOT NULL REFERENCES assessment_scenarios(id),
            order_index INTEGER NOT NULL,
            question_text TEXT NOT NULL,
            options_json TEXT NOT NULL,
            tpb_construct VARCHAR(25) NOT NULL CHECK(tpb_construct IN ('Attitude','SubjectiveNorm','PBC','BehavioralIntention')),
            selected_score INTEGER
        )
    """)
    cur.execute("CREATE INDEX IF NOT EXISTS ix_assessment_questions_scenario_id ON assessment_questions(scenario_id)")
    print("[OK] assessment_questions table created.")

    conn.commit()
    conn.close()
    print("\n[SUCCESS] All scenario-based assessment tables created.")


if __name__ == "__main__":
    migrate()
