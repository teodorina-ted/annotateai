from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models.user import users_collection

auth = Blueprint('auth', __name__)

@auth.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'user')

    if role not in ['admin', 'user', 'guest']:
        return jsonify({"error": "Invalid role"}), 400

    if users_collection.find_one({"username": username}):
        return jsonify({"error": "User already exists"}), 400

    users_collection.insert_one({"username": username, "password": password, "role": role})
    return jsonify({"message": f"User created with role: {role}"}), 201

@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = users_collection.find_one({"username": username, "password": password})
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    role = user.get("role", "user")
    token = create_access_token(identity=username, additional_claims={"role": role})
    return jsonify({"token": token, "role": role})


@auth.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    username = get_jwt_identity()
    user = users_collection.find_one({"username": username}, {"password": 0, "_id": 0})
    if not user:
        return jsonify({"error": "Not found"}), 404
    return jsonify(user)


@auth.route('/profile/avatar', methods=['PUT'])
@jwt_required()
def update_avatar():
    username = get_jwt_identity()
    data = request.get_json()
    avatar = data.get('avatar', '')
    users_collection.update_one({"username": username}, {"$set": {"avatar": avatar}})
    return jsonify({"message": "Avatar updated"})
