from flask import Blueprint, request, jsonify
from app.extensions import get_db

tasks_bp = Blueprint('tasks', __name__)


@tasks_bp.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Return all tasks with their nested subtasks and sub-subtasks."""
    db = get_db()
    tasks = db.execute(
        "SELECT t.id, sl.title AS task_status, t.title, t.description, t.deadline "
        "FROM tasks t JOIN status_lists sl ON t.list_id = sl.id ORDER BY t.id"
    ).fetchall()

    result = []
    for task in tasks:
        #Get subtask fo each task
        subtask_rows = db.execute(
            "SELECT id, parent_task_id, title, description, deadline, status "
            "FROM subtasks WHERE parent_task_id = ? ORDER BY id",
            (task['id'],)
        ).fetchall()

        subs = []
        #Get sub-sub-task for each sub-task
        for sub in subtask_rows:
            subsubtask_rows = db.execute(
                "SELECT id, parent_task_id, title, description, deadline, status "
                "FROM subsubtasks WHERE parent_task_id = ? ORDER BY id",
                (sub['id'],)
            ).fetchall()

            subs.append({
                'task_id': sub['id'],
                'parent_task_id': sub['parent_task_id'],
                'task_title': sub['title'],
                'task_description': sub['description'] or '',
                'task_deadline': sub['deadline'] or '',
                'task_status': sub['status'],
                'subsubtasks': [{
                    'task_id': ss['id'],
                    'parent_task_id': ss['parent_task_id'],
                    'task_title': ss['title'],
                    'task_description': ss['description'] or '',
                    'task_deadline': ss['deadline'] or '',
                    'task_status': ss['status'],
                } for ss in subsubtask_rows],
            })

        result.append({
            'task_id': task['id'],
            'task_title': task['title'],
            'task_description': task['description'] or '',
            'task_deadline': task['deadline'] or '',
            'task_status': task['task_status'],
            'subtasks': subs,
        })

    return jsonify(result)



@tasks_bp.route('/api/tasks', methods=['POST'])
def create_task():
    """Create a new top-level task and return it."""
    db = get_db()
    data = request.get_json() or {}
    title = data.get('task_title', 'New task')
    description = data.get('task_description', '')
    deadline = data.get('task_deadline', '')
    status = data.get('task_status', 'todo')

    #Find the column, which title matches status
    list_row = db.execute("SELECT id FROM status_lists WHERE title = ?", (status,)).fetchone()
    if not list_row:
        return jsonify({'error': f'Unknown status: {status}'}), 400

    cur = db.execute(
        "INSERT INTO tasks (list_id, title, description, deadline) VALUES (?, ?, ?, ?)",
        (list_row['id'], title, description or None, deadline or None)
    )
    db.commit()

    return jsonify({
        'task_id': cur.lastrowid, #new task is the last row's id
        'task_title': title,
        'task_description': description or '',
        'task_deadline': deadline or '',
        'task_status': status,
        'subtasks': [],
    }), 201


@tasks_bp.route('/api/tasks/<int:task_id>', methods=['PATCH'])
def update_task(task_id):
    """Update any subset of a task's fields (title, description, deadline, status)."""
    db = get_db()
    if not db.execute("SELECT id FROM tasks WHERE id = ?", (task_id,)).fetchone():
        return jsonify({'error': 'Task not found'}), 404

    data = request.get_json() or {}
    fields = {}

    #Add to he field dict the data passed to the endpoint

    if 'task_title' in data:
        fields['title'] = data['task_title']
    if 'task_description' in data:
        fields['description'] = data['task_description'] or None
    if 'task_deadline' in data:
        fields['deadline'] = data['task_deadline'] or None
    if 'task_status' in data:
        list_row = db.execute(
            "SELECT id FROM status_lists WHERE title = ?", (data['task_status'],)
        ).fetchone()
        if not list_row:
            return jsonify({'error': f"Unknown status: {data['task_status']}"}), 400
        fields['list_id'] = list_row['id']

    #If there's data to update 
    if fields:
        #joining by `.` because fields looks like fields = {'title': 'title1', 'deadline':..} 
        # build the query SET string ( e.g. " deadline = ? , description = ? ,  updated_at = CURRENT_TIMESTAMP")
        set_clause = ', '.join(f"{k} = ?" for k in fields) + ', updated_at = CURRENT_TIMESTAMP'

        #The values in field dictionaire replace the `?` in set_clause; The task_id replace the `?` in `id = ?`
        db.execute(f"UPDATE tasks SET {set_clause} WHERE id = ?", [*fields.values(), task_id])
        db.commit()

    return jsonify({'message': 'Task updated'})


@tasks_bp.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task and cascade-remove all its subtasks and sub-subtasks."""
    db = get_db()
    # Manually cascade: delete subsubtasks → subtasks → task

    #[subtask_id,]
    subtask_ids = [
        row['id'] for row in
        db.execute("SELECT id FROM subtasks WHERE parent_task_id = ?", (task_id,)).fetchall()
    ]

    if subtask_ids:
        
        #Put `?` for the number of subtasks id 
        placeholders = ','.join('?' * len(subtask_ids))
        #Delete all rows which paent_task_id == subtask_id in placeholders.
        db.execute(f"DELETE FROM subsubtasks WHERE parent_task_id IN ({placeholders})", subtask_ids)
    db.execute("DELETE FROM subtasks WHERE parent_task_id = ?", (task_id,))
    db.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    db.commit()
    return jsonify({'message': 'Task deleted'})
