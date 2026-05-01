import os
from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    app.url_map.strict_slashes = False
    app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "change-this-in-production")
    JWTManager(app)
    CORS(app)
    from app.routes import main
    from app.routes.auth import auth
    from app.routes.detect import detect_bp
    from app.routes.images import images_bp
    app.register_blueprint(main)
    app.register_blueprint(auth)
    app.register_blueprint(detect_bp)
    app.register_blueprint(images_bp)
    return app
