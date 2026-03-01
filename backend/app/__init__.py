from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.extensions import close_db, init_db


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, origins=['http://localhost:5173'])

    app.teardown_appcontext(close_db)

    init_db(app)

    return app
