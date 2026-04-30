from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import images_collection

images_bp = Blueprint('images', __name__)

@images_bp.route('/images', methods=['GET'])
@jwt_required()
def get_images():
    username = get_jwt_identity()
    images = list(images_collection.find({"username": username}))
    for img in images:
        img["_id"] = str(img["_id"])
    return jsonify({"images": images})



from bson import ObjectId

@images_bp.route('/images/<image_id>', methods=['GET'])
@jwt_required()
def get_one_image(image_id):
    username = get_jwt_identity()
    img = images_collection.find_one({"_id": ObjectId(image_id), "username": username})
    if not img:
        return {"error": "Not found"}, 404
    img["_id"] = str(img["_id"])
    return img
