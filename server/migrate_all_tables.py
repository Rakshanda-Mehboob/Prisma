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

# Get all tables
tables = [row[0] for row in cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
for t in tables:
    cols = [c[1] for c in cur.execute(f"PRAGMA table_info({t})").fetchall()]
    print(f"Table '{t}': {cols}")

# 1. Migrate assessments table to ensure behavioral_intention_score column exists
assessment_cols = [c[1] for c in cur.execute("PRAGMA table_info(assessments)").fetchall()]
if "behavioral_intention_score" not in assessment_cols:
    print("Adding 'behavioral_intention_score' column to 'assessments' table...")
    cur.execute("ALTER TABLE assessments ADD COLUMN behavioral_intention_score FLOAT")

# 2. Check users table
user_cols = [c[1] for c in cur.execute("PRAGMA table_info(users)").fetchall()]
if "login_count" not in user_cols:
    print("Adding 'login_count' column to 'users' table...")
    cur.execute("ALTER TABLE users ADD COLUMN login_count INTEGER DEFAULT 1")
if "department" not in user_cols:
    print("Adding 'department' column to 'users' table...")
    cur.execute("ALTER TABLE users ADD COLUMN department VARCHAR(100)")
if "living_situation" not in user_cols:
    print("Adding 'living_situation' column to 'users' table...")
    cur.execute("ALTER TABLE users ADD COLUMN living_situation VARCHAR(100)")

# 3. Check student_profiles table exists
has_student_profiles = cur.execute("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='student_profiles'").fetchone()[0]
if not has_student_profiles:
    print("Creating 'student_profiles' table...")
    cur.execute("""
    CREATE TABLE student_profiles (
        id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        degree_program VARCHAR(100),
        academic_year VARCHAR(50),
        faculty_department VARCHAR(100),
        learning_environment VARCHAR(50),
        class_size VARCHAR(50),
        platforms_used TEXT,
        online_activity_level VARCHAR(50),
        main_online_activities TEXT,
        university_activity_level VARCHAR(50),
        participation_types TEXT,
        social_role VARCHAR(100),
        encounter_frequency VARCHAR(50),
        experience_types TEXT,
        experience_role VARCHAR(100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

con.commit()
print("\n--- Verification after migration ---")
for t in [row[0] for row in cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]:
    cols = [c[1] for c in cur.execute(f"PRAGMA table_info({t})").fetchall()]
    print(f"Table '{t}': {cols}")

con.close()
