"""
migrate_scenario_template_library.py — Populate the Scenario Template Library.

Adds missing columns to `scenario_templates` and `user_scenario_history`.
Populates `scenario_templates` with 18 distinct scenario templates covering:
  - Social Media Interaction
  - Private Group Communication
  - University Community & Academic Collaboration
"""

import sqlite3
import os
import json

DB_PATH = os.path.join(os.path.dirname(__file__), "app.db")

def migrate_and_seed():
    print(f"Connecting to database at {DB_PATH}...")
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # 1. Update scenario_templates columns if missing
    cur.execute("PRAGMA table_info(scenario_templates)")
    existing_st_cols = [r[1] for r in cur.fetchall()]
    new_st_cols = [
        ("context_tags", "TEXT"),
        ("personalization_tags", "TEXT"),
        ("narrative_variations", "TEXT"),
        ("questions_data", "TEXT"),
    ]
    for col_name, col_type in new_st_cols:
        if col_name not in existing_st_cols:
            print(f"Adding '{col_name}' column to 'scenario_templates' table...")
            cur.execute(f"ALTER TABLE scenario_templates ADD COLUMN {col_name} {col_type}")

    # 2. Update user_scenario_history columns if missing
    cur.execute("PRAGMA table_info(user_scenario_history)")
    existing_ush_cols = [r[1] for r in cur.fetchall()]
    new_ush_cols = [
        ("template_key", "VARCHAR(50)"),
        ("scenario_summary", "VARCHAR(255)"),
    ]
    for col_name, col_type in new_ush_cols:
        if col_name not in existing_ush_cols:
            print(f"Adding '{col_name}' column to 'user_scenario_history' table...")
            cur.execute(f"ALTER TABLE user_scenario_history ADD COLUMN {col_name} {col_type}")

    # Create index on template_key if missing
    try:
        cur.execute("CREATE INDEX IF NOT EXISTS ix_user_scenario_history_template_key ON user_scenario_history(template_key)")
    except Exception as e:
        print(f"Index creation note: {e}")

    # 3. Seed/Sync Scenario Templates from template_library
    from assessment.template_library import SCENARIO_TEMPLATES

    print(f"Seeding {len(SCENARIO_TEMPLATES)} templates into scenario_templates table...")
    seeded_count = 0
    updated_count = 0

    for t in SCENARIO_TEMPLATES:
        t_key = t["template_key"]
        category = t["category"]
        diff = t.get("difficulty_level", 1)
        tpb_dim = t.get("tpb_dimension", "Balanced TPB")
        platform_ctx = ", ".join(t.get("platforms", []))
        living_ctx = ", ".join(t.get("livings", []))
        dept_ctx = ", ".join(t.get("departments", []))
        variations = t.get("narrative_variations", [])
        base_scenario_text = variations[0] if variations else "Scenario text"
        q_data = t.get("questions", [])
        first_q = q_data[0] if q_data else {}
        first_q_text = first_q.get("question_text", "Question")
        first_q_options = first_q.get("options", [])
        ans_options_json = json.dumps(first_q_options)

        context_tags_json = json.dumps(t.get("context_tags", []))
        personalization_tags_json = json.dumps(t.get("personalization_tags", {}))
        narrative_variations_json = json.dumps(variations)
        questions_data_json = json.dumps(q_data)

        # Check if already exists
        cur.execute("SELECT id FROM scenario_templates WHERE scenario_id = ?", (t_key,))
        row = cur.fetchone()

        if row:
            cur.execute("""
                UPDATE scenario_templates
                SET category = ?, platform_context = ?, living_context = ?, department_context = ?,
                    difficulty_level = ?, tpb_dimension = ?, scenario_text = ?, question_text = ?,
                    answer_options = ?, context_tags = ?, personalization_tags = ?,
                    narrative_variations = ?, questions_data = ?
                WHERE scenario_id = ?
            """, (
                category, platform_ctx, living_ctx, dept_ctx,
                diff, tpb_dim, base_scenario_text, first_q_text,
                ans_options_json, context_tags_json, personalization_tags_json,
                narrative_variations_json, questions_data_json, t_key
            ))
            updated_count += 1
        else:
            cur.execute("""
                INSERT INTO scenario_templates (
                    scenario_id, category, platform_context, living_context, department_context,
                    difficulty_level, tpb_dimension, scenario_text, question_text, answer_options,
                    context_tags, personalization_tags, narrative_variations, questions_data, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            """, (
                t_key, category, platform_ctx, living_ctx, dept_ctx,
                diff, tpb_dim, base_scenario_text, first_q_text, ans_options_json,
                context_tags_json, personalization_tags_json, narrative_variations_json,
                questions_data_json
            ))
            seeded_count += 1

    conn.commit()
    conn.close()
    print(f"[OK] Seeded {seeded_count} new templates, updated {updated_count} existing templates.")

if __name__ == "__main__":
    migrate_and_seed()
