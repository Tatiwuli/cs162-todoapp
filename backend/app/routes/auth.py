from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash

from app.extensions import get_db


auth_bp = Blueprint('auth_bp', __name__)


@auth_bp.route('/api/signup', methods=['POST'])
def signup():
    """
    Create a new user account.
    Expected JSON: { "name": str, "email": str, "password": str }
    """
    db = get_db()
    data = request.get_json() or {}

    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not name or not email or not password:
        return jsonify({'error': 'name, email, and password are required'}), 400

    # Enforce unique email
    existing = db.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
    if existing:
        return jsonify({'error': 'Email is already registered'}), 400

    password_hash = generate_password_hash(password)

    cur = db.execute(
        "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
        (name, email, password_hash),
    )
    db.commit()

    user_id = cur.lastrowid
    # Log the user in immediately after signup
    session['user_id'] = user_id

    return jsonify({
        'user_id': user_id,
        'name': name,
        'email': email,
    }), 201


@auth_bp.route('/api/login', methods=['POST'])
def login():
    """
    Log an existing user in.
    Expected JSON: { "email": str, "password": str }
    """
    db = get_db()
    data = request.get_json() or {}

    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({'error': 'email and password are required'}), 400

    user = db.execute(
        "SELECT id, name, email, password_hash FROM users WHERE email = ?",
        (email,),
    ).fetchone()

    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'Invalid email or password'}), 400

    # Store user id in the session
    session['user_id'] = user['id']

    return jsonify({
        'user_id': user['id'],
        'name': user['name'],
        'email': user['email'],
    })


@auth_bp.route('/api/logout', methods=['POST'])
def logout():
    """Clear the current session."""
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out'})


@auth_bp.route('/api/me', methods=['GET'])
def me():
    """
    Return the currently logged-in user, if any.
    """
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401

    db = get_db()
    user = db.execute(
        "SELECT id, name, email, created_at FROM users WHERE id = ?",
        (user_id,),
    ).fetchone()

    if not user:
        # Session is stale
        session.pop('user_id', None)
        return jsonify({'error': 'Not authenticated'}), 401

    return jsonify({
        'user_id': user['id'],
        'name': user['name'],
        'email': user['email'],
        'created_at': user['created_at'],
    })

