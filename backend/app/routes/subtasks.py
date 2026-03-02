from flask import Blueprint, request, jsonify
from app.extensions import get_db

subtasks_bp = Blueprint('subtasks', __name__)


@subtasks_bp.route('/api/subtasks/<int:task_id>', methods=['POST'])
def create_subtask(task_id):
    """Create a subtask under the given task and return it."""
    db = get_db()
    if not db.execute("SELECT id FROM tasks WHERE id = ?", (task_id,)).fetchone():
        return jsonify({'error': 'Parent task not found'}), 404

    data = request.get_json() or {}
    title = data.get('task_title', 'New sub-task')
    description = data.get('task_description', '')
    deadline = data.get('task_deadline', '')
    status = data.get('task_status', 'todo')

    cur = db.execute(
        "INSERT INTO subtasks (parent_task_id, title, description, deadline, status) VALUES (?, ?, ?, ?, ?)",
        (task_id, title, description or None, deadline or None, status)
    )
    db.commit()

    return jsonify({
        'task_id': cur.lastrowid,
        'parent_task_id': task_id,
        'task_title': title,
        'task_description': description or '',
        'task_deadline': deadline or '',
        'task_status': status,
        'subsubtasks': [],
    }), 201


@subtasks_bp.route('/api/subtasks/<int:sub_id>', methods=['PATCH'])
def update_subtask(sub_id):
    """Update any subset of a subtask's fields (title, description, deadline, status)."""
    db = get_db()
    if not db.execute("SELECT id FROM subtasks WHERE id = ?", (sub_id,)).fetchone():
        return jsonify({'error': 'Subtask not found'}), 404

    data = request.get_json() or {}
    fields = {}

    if 'task_title' in data:
        fields['title'] = data['task_title']
    if 'task_description' in data:
        fields['description'] = data['task_description'] or None
    if 'task_deadline' in data:
        fields['deadline'] = data['task_deadline'] or None
    if 'task_status' in data:
        fields['status'] = data['task_status']

    if fields:
        set_clause = ', '.join(f"{k} = ?" for k in fields) + ', updated_at = CURRENT_TIMESTAMP'
        db.execute(f"UPDATE subtasks SET {set_clause} WHERE id = ?", [*fields.values(), sub_id])
        db.commit()

    return jsonify({'message': 'Subtask updated'})


@subtasks_bp.route('/api/subtasks/<int:sub_id>', methods=['DELETE'])
def delete_subtask(sub_id):
    """Delete a subtask and cascade-remove all its sub-subtasks."""
    db = get_db()
    # Manually cascade: delete subsubtasks first
    db.execute("DELETE FROM subsubtasks WHERE parent_task_id = ?", (sub_id,))
    db.execute("DELETE FROM subtasks WHERE id = ?", (sub_id,))
    db.commit()
    return jsonify({'message': 'Subtask deleted'})
