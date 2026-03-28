from flask import Blueprint, request, jsonify
import requests
from config import GEMINI_API_KEY, GEMINI_ANALYZE_URL, GEMINI_PREDICT_URL
from utils.image_utils import clean_b64

analysis_bp = Blueprint('analysis', __name__)

@analysis_bp.route('/api/analyze_room', methods=['POST'])
def analyze_room():
    data = request.get_json()
    prompt = data.get('prompt')
    image_base64 = data.get('imageBase64')

    if not all([prompt, image_base64]):
        return jsonify({"error": "Missing required data"}), 400

    image_clean = clean_b64(image_base64)
    
    payload = {
        "contents": [{
            "parts": [
                {"text": prompt},
                {"inline_data": {
                    "mime_type": "image/jpeg",
                    "data": image_clean
                }}
            ]
        }]
    }

    headers = {'Content-Type': 'application/json'}

    try:
        response = requests.post(GEMINI_ANALYZE_URL, headers=headers, json=payload)
        
        # Fallback to predict endpoint if 404
        if response.status_code == 404:
            predict_payload = {
                "instances": [{"prompt": prompt, "image": {"bytesBase64Encoded": image_clean}}]
            }
            response = requests.post(GEMINI_PREDICT_URL, headers=headers, json=predict_payload)
            if response.status_code == 200:
                analysis_text = response.json()['predictions'][0]['content']
                return jsonify({"analysis": analysis_text}), 200

        response_data = response.json()
        if response.status_code == 200:
            analysis_text = response_data['candidates'][0]['content']['parts'][0]['text']
            return jsonify({"analysis": analysis_text}), 200
        else:
            return jsonify({"error": "Google API analysis failed"}), response.status_code

    except Exception as e:
        return jsonify({"error": str(e)}), 500
