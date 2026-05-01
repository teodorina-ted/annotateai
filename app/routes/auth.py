from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from werkzeug.security import generate_password_hash, check_password_hash
from app.models.user import users_collection
import re

auth = Blueprint("auth", __name__)

EMAIL_RE = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")

def is_valid_email(s):
    return bool(s and EMAIL_RE.match(s))


@auth.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    role = data.get("role", "user")

    # Validation
    if not username or len(username) < 3:
        return jsonify({"error": "Username must be at least 3 characters"}), 400
    if not email or not is_valid_email(email):
        return jsonify({"error": "Please enter a valid email address"}), 400
    if not password or len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if role not in ["admin", "user", "guest"]:
        role = "user"

    # Check duplicates
    if users_collection.find_one({"$or": [{"username": username}, {"email": email}]}):
        return jsonify({"error": "Username or email already registered"}), 400

    # Hash password
    pwd_hash = generate_password_hash(password)

    users_collection.insert_one({
        "username": username,
        "email": email,
        "password": pwd_hash,
        "role": role,
        "status": "active",
    })

    token = create_access_token(identity=username, additional_claims={"role": role})
    return jsonify({
        "message": "Account created successfully",
        "token": token,
        "role": role,
        "username": username,
    }), 201


@auth.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    identifier = (data.get("username") or data.get("email") or "").strip()
    password = data.get("password") or ""

    if not identifier or not password:
        return jsonify({"error": "Invalid credentials"}), 401

    # Find user by username OR email
    user = users_collection.find_one({
        "$or": [{"username": identifier}, {"email": identifier.lower()}]
    })

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    stored_pwd = user.get("password", "")
    is_valid = False
    # Support hashed (new) and plain text (legacy)
    if stored_pwd.startswith(("pbkdf2:", "scrypt:", "argon2")):
        try:
            is_valid = check_password_hash(stored_pwd, password)
        except Exception:
            is_valid = False
    else:
        is_valid = (stored_pwd == password)
        # Migrate to hashed on successful login
        if is_valid:
            users_collection.update_one(
                {"_id": user["_id"]},
                {"$set": {"password": generate_password_hash(password)}}
            )

    if not is_valid:
        return jsonify({"error": "Invalid credentials"}), 401

    role = user.get("role", "user")
    token = create_access_token(identity=user["username"], additional_claims={"role": role})
    return jsonify({
        "token": token,
        "role": role,
        "username": user["username"],
    })


@auth.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    username = get_jwt_identity()
    claims = get_jwt()
    user = users_collection.find_one({"username": username})
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({
        "username": user["username"],
        "email": user.get("email", ""),
        "role": claims.get("role", "user"),
        "avatar": user.get("avatar", ""),
    })


@auth.route("/profile/avatar", methods=["POST"])
@jwt_required()
def update_avatar():
    username = get_jwt_identity()
    data = request.get_json() or {}
    avatar = data.get("avatar", "")
    users_collection.update_one({"username": username}, {"$set": {"avatar": avatar}})
    return jsonify({"message": "Avatar updated"})
