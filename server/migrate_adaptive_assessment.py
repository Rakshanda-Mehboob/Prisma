import sqlite3
import os
import shutil

db_path = os.path.join(os.path.dirname(__file__), "app.db")
backup_path = os.path.join(os.path.dirname(__file__), "app.db.bak")

print(f"Connecting to database at {db_path}...")
if os.path.exists(db_path):
    shutil.copyfile(db_path, backup_path)
    print(f"Backup created at {backup_path}")

con = sqlite3.connect(db_path)
cur = con.cursor()

# 1. Create user_profiles table if it does not exist
cur.execute("""
CREATE TABLE IF NOT EXISTS user_profiles (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    age_group VARCHAR(50),
    gender VARCHAR(50),
    department VARCHAR(100),
    academic_level VARCHAR(50),
    academic_year VARCHAR(50),
    living_situation VARCHAR(100),
    social_media_platforms TEXT,
    social_media_frequency VARCHAR(50),
    online_communities TEXT,
    digital_usage_patterns TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")
print("Verified table 'user_profiles'")

# 2. Create scenario_templates table if it does not exist
cur.execute("""
CREATE TABLE IF NOT EXISTS scenario_templates (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    scenario_id VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    platform_context VARCHAR(100),
    living_context VARCHAR(100),
    department_context VARCHAR(100),
    difficulty_level INTEGER DEFAULT 1,
    tpb_dimension VARCHAR(30) NOT NULL,
    scenario_text TEXT NOT NULL,
    question_text TEXT,
    answer_options TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")
print("Verified table 'scenario_templates'")

# 3. Create user_scenario_history table if it does not exist
cur.execute("""
CREATE TABLE IF NOT EXISTS user_scenario_history (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scenario_id INTEGER REFERENCES scenarios(id) ON DELETE SET NULL,
    template_id INTEGER REFERENCES scenario_templates(id) ON DELETE SET NULL,
    scenario_hash VARCHAR(64),
    stage VARCHAR(10) DEFAULT 'pre',
    difficulty_level INTEGER DEFAULT 1,
    shown_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")
print("Verified table 'user_scenario_history'")

# 4. Add columns to scenarios table if missing
cur.execute("PRAGMA table_info(scenarios)")
cols = [r[1] for r in cur.fetchall()]
for col_name, col_type in [
    ("category", "VARCHAR(100)"),
    ("platform_context", "VARCHAR(100)"),
    ("living_context", "VARCHAR(100)"),
    ("department_context", "VARCHAR(100)"),
    ("difficulty_level", "INTEGER DEFAULT 1"),
]:
    if col_name not in cols:
        print(f"Adding '{col_name}' column to 'scenarios' table...")
        cur.execute(f"ALTER TABLE scenarios ADD COLUMN {col_name} {col_type}")

con.commit()
con.close()
print("Migration completed successfully!")
