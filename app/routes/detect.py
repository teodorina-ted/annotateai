from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from ultralytics import YOLO
from app.models.user import images_collection
import datetime
import base64
import tempfile
import os
import json
import hashlib
from bson import ObjectId
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)



def extract_image_from_page(url):
    """If URL is a webpage, try to extract the main image (og:image)."""
    try:
        import urllib.request
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,image/*",
            "Accept-Language": "en-US,en;q=0.9"
        })
        with urllib.request.urlopen(req, timeout=8) as resp:
            content_type = resp.headers.get("Content-Type", "")
            if content_type.startswith("image/"):
                return url
            html = resp.read(200000).decode("utf-8", errors="ignore")
            import re
            # Try og:image meta tag
            m = re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']', html)
            if m: return m.group(1)
            m = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']', html)
            if m: return m.group(1)
            # Try twitter:image
            m = re.search(r'<meta[^>]+name=["\']twitter:image["\'][^>]+content=["\']([^"\']+)["\']', html)
            if m: return m.group(1)
    except Exception as e:
        print("extract_image_from_page error:", e)
    return url


detect_bp = Blueprint('detect', __name__)
model = YOLO("yolov8n.pt")


# Category mapping for YOLO labels
CATEGORY_MAP = {
    "person": "person",
    "bicycle": "transport", "car": "transport", "motorcycle": "transport",
    "airplane": "transport", "bus": "transport", "train": "transport",
    "truck": "transport", "boat": "transport",
    "cat": "animal", "dog": "animal", "horse": "animal", "sheep": "animal",
    "cow": "animal", "elephant": "animal", "bear": "animal", "zebra": "animal",
    "giraffe": "animal", "bird": "animal",
    "potted plant": "nature",
    "tv": "media", "laptop": "media", "cell phone": "media", "book": "media",
    "remote": "media", "keyboard": "media", "mouse": "media",
    "chair": "indoor", "couch": "indoor", "bed": "indoor", "dining table": "indoor",
    "toilet": "indoor", "microwave": "indoor", "oven": "indoor", "toaster": "indoor",
    "sink": "indoor", "refrigerator": "indoor", "clock": "indoor", "vase": "indoor",
}


def get_gemini_metadata(image_path, yolo_labels):
    """Use Gemini Vision to extract rich metadata for detected objects."""
    if not GEMINI_API_KEY:
        return {}
    try:
        gen_model = genai.GenerativeModel("gemini-2.5-flash")
        with open(image_path, 'rb') as f:
            img_bytes = f.read()

        prompt = f"""You are an image analyzer. YOLO detected these objects in the image: {', '.join(set(yolo_labels))}.

For each unique detected object, return a JSON object with details. Use these fields based on object type:

- person: gender, age_group (baby/kid/teen/young_adult/adult/elderly), hair, notable_features
- car/truck/bus/motorcycle: brand, model (if visible), color, type
- animal (cat/dog/bird/etc): species, breed (if recognizable), color, size
- plant/flower: type, species (if known), color
- other: brief description

Return ONLY valid JSON in this format:
{{"objects": [{{"label": "...", "category": "...", "subcategory": "...", "details": {{}}}}]}}

Be concise. If unsure, omit the field. No markdown, just raw JSON."""

        response = gen_model.generate_content([
            prompt,
            {"mime_type": "image/jpeg", "data": img_bytes}
        ])
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text.strip())
    except Exception as e:
        print("Gemini error:", e)
        return {}


@detect_bp.route('/detect', methods=['POST'])
def detect():
    data = request.get_json()
    image_url = data.get('image_url', '')

    tmp_path = None
    try:
        if image_url.startswith('data:image'):
            header, encoded = image_url.split(',', 1)
            img_data = base64.b64decode(encoded)
            suffix = '.jpg'
            if 'png' in header:
                suffix = '.png'
            tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
            tmp.write(img_data)
            tmp.close()
            tmp_path = tmp.name
            source = tmp_path
        else:
            extracted = extract_image_from_page(image_url)
            if extracted == image_url and not any(image_url.split('?')[0].lower().endswith(e) for e in ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif']):
                return jsonify({"error": "Could not extract image from this webpage. Please use a direct image URL (right-click image → Copy image address). Example: https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg"}), 400
            image_url = extracted
            # Download URL to temp file so YOLO doesn't treat it as video stream
            import requests as req
            try:
                resp = req.get(extracted, headers={"User-Agent": "Mozilla/5.0"}, timeout=15)
                tmp = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
                tmp.write(resp.content)
                tmp.close()
                tmp_path = tmp.name
                source = tmp_path
            except Exception as dl_err:
                return jsonify({"error": f"Could not download image: {dl_err}"}), 400

        results = model(source, verbose=False)
        detections = []
        if len(results) == 0 or results[0].boxes is None or len(results[0].boxes) == 0:
            return jsonify({"labels": [], "detections": [], "metadata": {}, "saved": False, "id": None, "image_url": image_url})
        for box in results[0].boxes:
            label = model.names[int(box.cls[0])]
            conf = float(box.conf[0])
            detections.append({"label": label, "confidence": round(conf * 100, 1)})
        labels = [d["label"] for d in detections]

        # Get rich metadata from Gemini
        gemini_meta = {}
        if labels and (tmp_path or image_url.startswith('http')):
            try:
                if not tmp_path:
                    import urllib.request
                    tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
                    urllib.request.urlretrieve(image_url, tmp.name)
                    tmp.close()
                    gemini_meta = get_gemini_metadata(tmp.name, labels)
                    os.remove(tmp.name)
                else:
                    gemini_meta = get_gemini_metadata(tmp_path, labels)
            except Exception as e:
                print("Metadata extraction failed:", e)

        # Add category to each detection
        for d in detections:
            d["category"] = CATEGORY_MAP.get(d["label"], "other")

        saved = False
        doc_id = None

        return jsonify({
            "labels": labels,
            "detections": detections,
            "metadata": gemini_meta,
            "saved": saved,
            "id": doc_id,
            "image_url": image_url
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)


@detect_bp.route('/images/<image_id>', methods=['PUT'])
@jwt_required()
def update_image(image_id):
    try:
        username = get_jwt_identity()
        data = request.get_json()
        status = data.get('status')
        labels = data.get('labels')

        update = {"reviewed_at": datetime.datetime.utcnow()}
        if status is not None:
            update["status"] = status
        if labels is not None:
            update["labels"] = labels
            update["detections"] = [{"label": l, "confidence": 100.0, "category": CATEGORY_MAP.get(l, "other")} for l in labels]

        result = images_collection.update_one(
            {"_id": ObjectId(image_id), "username": username},
            {"$set": update}
        )
        if result.matched_count == 0:
            return jsonify({"error": "Not found"}), 404
        return jsonify({"message": "Updated", "status": status})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@detect_bp.route('/images/<image_id>', methods=['DELETE'])
@jwt_required()
def delete_image(image_id):
    try:
        username = get_jwt_identity()
        result = images_collection.delete_one({"_id": ObjectId(image_id), "username": username})
        if result.deleted_count == 0:
            return jsonify({"error": "Not found"}), 404
        return jsonify({"message": "Deleted"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@detect_bp.route('/images/bulk-delete', methods=['POST'])
@jwt_required()
def bulk_delete():
    try:
        username = get_jwt_identity()
        data = request.get_json()
        ids = [ObjectId(i) for i in data.get('ids', [])]
        result = images_collection.delete_many({"_id": {"$in": ids}, "username": username})
        return jsonify({"deleted": result.deleted_count})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
