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

        #create table sql queries
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
                updated_at     TEXT DEFAULT CURRENT_TIMESTAMP,
                created_at     TEXT DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS subsubtasks (
                id             INTEGER PRIMARY KEY AUTOINCREMENT,
                parent_task_id INTEGER NOT NULL REFERENCES subtasks(id),
                title          TEXT    NOT NULL,
                description    TEXT,
                deadline       TEXT,
                updated_at     TEXT DEFAULT CURRENT_TIMESTAMP,
                created_at     TEXT DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Seed the three fixed status columns if they don't exist yet
        existing = {row['title'] for row in db.execute("SELECT title FROM status_lists").fetchall()}
        #any task must have a list_id. So, must pre-fill a row to status_list table if any status has 0 row
        for title in ('todo', 'in-progress', 'done'):
            if title not in existing:
                db.execute("INSERT INTO status_lists (title) VALUES (?)", (title,))
        db.commit()
