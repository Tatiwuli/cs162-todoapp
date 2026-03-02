from flask import Blueprint, request, jsonify
from app.extensions import get_db

subsubtasks_bp = Blueprint('subsubtasks', __name__)


@subsubtasks_bp.route('/api/subsubtasks/<int:sub_id>', methods=['POST'])
def create_subsubtask(sub_id):
    db = get_db()
    if not db.execute("SELECT id FROM subtasks WHERE id = ?", (sub_id,)).fetchone():
        return jsonify({'error': 'Parent subtask not found'}), 404

    data = request.get_json() or {}
    title = data.get('task_title', 'New sub-sub-task')
    description = data.get('task_description', '')
    deadline = data.get('task_deadline', '')
    status = data.get('task_status', 'todo')

    cur = db.execute(
        "INSERT INTO subsubtasks (parent_task_id, title, description, deadline, status) VALUES (?, ?, ?, ?, ?)",
        (sub_id, title, description or None, deadline or None, status)
    )
    db.commit()

    return jsonify({
        'task_id': cur.lastrowid,
        'parent_task_id': sub_id,
        'task_title': title,
        'task_description': description or '',
        'task_deadline': deadline or '',
        'task_status': status,
    }), 201


@subsubtasks_bp.route('/api/subsubtasks/<int:subsub_id>', methods=['PATCH'])
def update_subsubtask(subsub_id):
    db = get_db()
    if not db.execute("SELECT id FROM subsubtasks WHERE id = ?", (subsub_id,)).fetchone():
        return jsonify({'error': 'Sub-subtask not found'}), 404

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
        db.execute(f"UPDATE subsubtasks SET {set_clause} WHERE id = ?", [*fields.values(), subsub_id])
        db.commit()

    return jsonify({'message': 'Sub-subtask updated'})


@subsubtasks_bp.route('/api/subsubtasks/<int:subsub_id>', methods=['DELETE'])
def delete_subsubtask(subsub_id):
    db = get_db()
    db.execute("DELETE FROM subsubtasks WHERE id = ?", (subsub_id,))
    db.commit()
    return jsonify({'message': 'Sub-subtask deleted'})
