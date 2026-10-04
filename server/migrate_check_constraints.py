import sqlite3
import shutil
import os

db_path = "app.db"
backup_path = "app.db.bak"

if os.path.exists(db_path):
    shutil.copyfile(db_path, backup_path)
    print(f"Backed up {db_path} to {backup_path}")

con = sqlite3.connect(db_path)
cur = con.cursor()

cur.execute("PRAGMA foreign_keys=OFF")
cur.execute("BEGIN TRANSACTION")

# 1. Migrate scenario_options table
print("Migrating scenario_options table for 7-point Likert scale (1-7)...")
cur.execute("""
CREATE TABLE scenario_options_new (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    scenario_id INTEGER NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    score INTEGER NOT NULL,
    CONSTRAINT option_score_check CHECK (score BETWEEN 1 AND 7)
)
""")
cur.execute("INSERT INTO scenario_options_new (id, scenario_id, option_text, score) SELECT id, scenario_id, option_text, score FROM scenario_options")
cur.execute("DROP TABLE scenario_options")
cur.execute("ALTER TABLE scenario_options_new RENAME TO scenario_options")
cur.execute("CREATE INDEX IF NOT EXISTS ix_scenario_options_id ON scenario_options (id)")

# 2. Migrate assessment_responses table
print("Migrating assessment_responses table for 7-point Likert scale (1-7)...")
cur.execute("""
CREATE TABLE assessment_responses_new (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    scenario_id INTEGER NOT NULL REFERENCES scenarios(id),
    selected_score INTEGER NOT NULL,
    CONSTRAINT response_score_check CHECK (selected_score BETWEEN 1 AND 7)
)
""")
cur.execute("INSERT INTO assessment_responses_new (id, assessment_id, scenario_id, selected_score) SELECT id, assessment_id, scenario_id, selected_score FROM assessment_responses")
cur.execute("DROP TABLE assessment_responses")
cur.execute("ALTER TABLE assessment_responses_new RENAME TO assessment_responses")
cur.execute("CREATE INDEX IF NOT EXISTS ix_assessment_responses_id ON assessment_responses (id)")

con.commit()
cur.execute("PRAGMA foreign_keys=ON")
print("All table constraints migrated successfully to 7-point Likert scale!")
con.close()
