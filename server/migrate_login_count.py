"""
One-time migration: adds login_count column to users table in app.db.
Safe to run multiple times — skips if column already exists.
"""
import sqlite3

conn = sqlite3.connect("app.db")
cursor = conn.cursor()

# Check if column already exists
cursor.execute("PRAGMA table_info(users)")
columns = [row[1] for row in cursor.fetchall()]

if "login_count" not in columns:
    cursor.execute("ALTER TABLE users ADD COLUMN login_count INTEGER NOT NULL DEFAULT 0")
    conn.commit()
    print("Migration successful: login_count column added.")
else:
    print("Column login_count already exists — skipping migration.")

conn.close()
