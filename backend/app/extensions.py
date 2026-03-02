import sqlite3
from flask import g, current_app


def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(current_app.config['DATABASE'])
        g.db.row_factory = sqlite3.Row   # rows behave like dicts
        g.db.execute("PRAGMA foreign_keys = ON")  # enforce FK constraints
    return g.db


def close_db(error):
    db = g.pop('db', None)
    if db is not None:
        db.close()


def init_db(app):
    with app.app_context():
        db = get_db()

        db.executescript("""
            CREATE TABLE IF NOT EXISTS status_lists (
                id    INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT    NOT NULL UNIQUE
            );

            CREATE TABLE IF NOT EXISTS tasks (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                list_id     INTEGER NOT NULL REFERENCES status_lists(id),
                title       TEXT    NOT NULL,
                description TEXT,
                deadline    TEXT,
                updated_at  TEXT DEFAULT CURRENT_TIMESTAMP,
                created_at  TEXT DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS subtasks (
                id             INTEGER PRIMARY KEY AUTOINCREMENT,
                parent_task_id INTEGER NOT NULL REFERENCES tasks(id),
                title          TEXT    NOT NULL,
                description    TEXT,
                deadline       TEXT,
                status         TEXT    NOT NULL DEFAULT 'todo',
                updated_at     TEXT DEFAULT CURRENT_TIMESTAMP,
                created_at     TEXT DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS subsubtasks (
                id             INTEGER PRIMARY KEY AUTOINCREMENT,
                parent_task_id INTEGER NOT NULL REFERENCES subtasks(id),
                title          TEXT    NOT NULL,
                description    TEXT,
                deadline       TEXT,
                status         TEXT    NOT NULL DEFAULT 'todo',
                updated_at     TEXT DEFAULT CURRENT_TIMESTAMP,
                created_at     TEXT DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Add status column to existing tables if it's missing (migration for old DBs)
        for table in ('subtasks', 'subsubtasks'):
            try:
                db.execute(f"ALTER TABLE {table} ADD COLUMN status TEXT NOT NULL DEFAULT 'todo'")
                db.commit()
            except Exception:
                pass  # column already exists

        # Seed the three fixed status columns if they don't exist yet
        existing = {row['title'] for row in db.execute("SELECT title FROM status_lists").fetchall()}

        # Migrate 'pending' -> 'in-progress' if old seed was used
        if 'pending' in existing:
            db.execute("UPDATE status_lists SET title = 'in-progress' WHERE title = 'pending'")
            existing.discard('pending')
            existing.add('in-progress')

        for title in ('todo', 'in-progress', 'done'):
            if title not in existing:
                db.execute("INSERT INTO status_lists (title) VALUES (?)", (title,))
        db.commit()
