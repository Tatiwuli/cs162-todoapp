from app import create_app
from app.extensions import get_db

app = create_app()

with app.app_context():
    db = get_db()

    # 10 tasks spread across the 3 status lists (1=todo, 2=in-progress, 3=done)
    db.executemany(
        "INSERT INTO tasks (list_id, title, description, deadline) VALUES (?, ?, ?, ?)",
        [
            (1, 'Buy groceries',        'Milk, eggs, bread',           '2025-12-01'),
            (1, 'Read book',            'Finish chapter 3',            '2025-12-05'),
            (1, 'Call dentist',         'Schedule appointment',        '2025-12-10'),
            (2, 'Build portfolio',      'Add 3 new projects',          '2025-12-15'),
            (2, 'Fix login bug',        'Auth token not refreshing',   '2025-12-03'),
            (2, 'Write tests',          'Cover auth routes',           '2025-12-08'),
            (3, 'Setup repo',           'Init git and push',           None),
            (3, 'Design mockups',       'Figma wireframes done',       None),
            (3, 'Install dependencies', 'npm install completed',       None),
            (3, 'Write README',         'Basic setup instructions',    None),
        ]
    )

    # 10 subtasks belonging to tasks 1-10
    db.executemany(
        "INSERT INTO subtasks (parent_task_id, title, description, deadline) VALUES (?, ?, ?, ?)",
        [
            (1,  'Check fridge',         'See what is missing',        '2025-12-01'),
            (1,  'Make shopping list',   'Write list on phone',        '2025-12-01'),
            (2,  'Find the book',        'Locate on shelf',            None),
            (3,  'Find phone number',    'Google dentist clinic',      None),
            (4,  'Write bio',            'Two paragraphs',             '2025-12-10'),
            (4,  'Add screenshots',      'Take project screenshots',   '2025-12-12'),
            (5,  'Reproduce bug',        'Trigger the issue locally',  '2025-12-02'),
            (5,  'Check token logic',    'Review expiry handling',     '2025-12-03'),
            (6,  'Install pytest',       None,                         None),
            (6,  'Write first test',     'Test POST /register',        '2025-12-07'),
        ]
    )

    # 10 subsubtasks belonging to subtasks 1-10
    db.executemany(
        "INSERT INTO subsubtasks (parent_task_id, title, description, deadline) VALUES (?, ?, ?, ?)",
        [
            (1,  'Check dairy section',   None,                        None),
            (1,  'Check produce section', None,                        None),
            (2,  'Open notes app',        None,                        None),
            (2,  'Categorize by aisle',   None,                        None),
            (5,  'Draft intro sentence',  None,                        '2025-12-09'),
            (5,  'Add project links',     None,                        '2025-12-09'),
            (6,  'Crop screenshots',      None,                        '2025-12-11'),
            (7,  'Open dev tools',        None,                        None),
            (9,  'pip install pytest',    None,                        None),
            (10, 'Import test client',    None,                        None),
        ]
    )

    db.commit()
    print("Mock data seeded.")
