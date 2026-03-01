from app import create_app
from app.extensions import get_db

app = create_app()

with app.app_context():
    db = get_db()

    print("--- status_lists ---")
    for row in db.execute("SELECT * FROM status_lists").fetchall():
        print(dict(row))

    print("\n--- tasks (first 3) ---")
    for row in db.execute("SELECT * FROM tasks LIMIT 3").fetchall():
        print(dict(row))

    print("\n--- subtasks (first 3) ---")
    for row in db.execute("SELECT * FROM subtasks LIMIT 3").fetchall():
        print(dict(row))

    print("\n--- subsubtasks (first 3) ---")
    for row in db.execute("SELECT * FROM subsubtasks LIMIT 3").fetchall():
        print(dict(row))
