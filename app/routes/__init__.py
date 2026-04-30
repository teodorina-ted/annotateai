from flask import Blueprint, jsonify, send_from_directory

main = Blueprint('main', __name__)

@main.route('/health')
def health():
    return jsonify({"status": "ok"})

@main.route('/')
def landing():
    return send_from_directory('../app/static', 'landing.html')

@main.route('/auth')
def auth():
    return send_from_directory('../app/static', 'auth.html')

@main.route('/home')
def home():
    return send_from_directory('../app/static', 'home.html')

@main.route('/detect-page')
def detect_page():
    return send_from_directory('../app/static', 'detect.html')

@main.route('/history-page')
def history_page():
    return send_from_directory('../app/static', 'history.html')

@main.route('/bulk-page')
def bulk_page():
    return send_from_directory('../app/static', 'bulk.html')

@main.route('/import')
def import_page():
    return send_from_directory('../app/static', 'import.html')

@main.route('/profile')
def profile_page():
    return send_from_directory('../app/static', 'profile.html')
