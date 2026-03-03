from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.extensions import close_db, init_db


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Allow frontend dev server to talk to this API.
   
    CORS(app, origins=['http://localhost:5173'])

    app.teardown_appcontext(close_db)

    init_db(app)

    from app.routes.tasks import tasks_bp
    from app.routes.subtasks import subtasks_bp
    from app.routes.subsubtasks import subsubtasks_bp
    from app.routes.auth import auth_bp

    app.register_blueprint(tasks_bp)
    app.register_blueprint(subtasks_bp)
    app.register_blueprint(subsubtasks_bp)
    app.register_blueprint(auth_bp)

    return app
