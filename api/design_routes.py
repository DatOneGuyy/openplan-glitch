from flask import Blueprint, request, jsonify
import base64
import numpy as np
import cv2
import requests
from config import GEMINI_API_KEY, GEMINI_GENERATE_URL
from utils.image_utils import clean_b64, get_image_data

design_bp = Blueprint('design', __name__)

@design_bp.route('/api/generate_masks', methods=['POST'])
def generate_masks():
    data = request.json
    width = data.get('width')
    height = data.get('height')
    polygons = data.get('polygons', [])
    ids = data.get('ids', [])
    
    if not width or not height:
        return jsonify({"error": "Missing dimensions"}), 400
        
    mask_results = []
    PADDING = 1
    kernel = np.ones((PADDING, PADDING), np.uint8)

    for i, poly in enumerate(polygons):
        mask = np.zeros((height, width), dtype=np.uint8)
        pts = np.array([[p['x'], p['y']] for p in poly], np.int32)
        pts = pts.reshape((-1, 1, 2))
        cv2.fillPoly(mask, [pts], 255)
        mask = cv2.dilate(mask, kernel, iterations=1)
        area = cv2.countNonZero(mask)
        _, buffer = cv2.imencode('.png', mask)
        mask_base64 = base64.b64encode(buffer).decode('utf-8')
        
        mask_results.append({
            "index": i,
            "id": ids[i] if i < len(ids) else None,
            "area": area,
            "base64": mask_base64
        })
        
    return jsonify({"masks": mask_results}), 200

@design_bp.route('/api/generate', methods=['POST'])
def generate_image():
    if not GEMINI_API_KEY:
        return jsonify({"error": "No API key configured"}), 500
        
    data = request.json
    item_name = data.get('itemName', 'Furniture')
    item_category = data.get('itemCategory', 'Object')
    mask_base64 = data.get('maskBase64')
    image_base64 = data.get('imageBase64')
    furniture_image = data.get('furnitureImage')
    
    if not all([image_base64, mask_base64, furniture_image]):
        return jsonify({"error": "Missing image, mask, or furniture reference"}), 400

    base_image_clean = get_image_data(image_base64)
    mask_clean = get_image_data(mask_base64)
    ref_image_clean = get_image_data(furniture_image)

    # Determine actual MIME type from file extension if it's a URL
    if image_base64.lower().endswith('.png'):
        base_image_mime = 'image/png'
    elif 'data:image/png' in image_base64:
        base_image_mime = 'image/png'
    else:
        base_image_mime = 'image/jpeg'

    refined_prompt = (
        f"Inpaint a {item_name} into the area masked by the second image. "
        f"Use the third image as a style and material reference for the {item_category}. "
        f"Ensure it perfectly matches the lighting, shadows, and perspective of the first room image."
    )

    payload = {
        "contents": [{
            "parts": [
                { "text": refined_prompt },
                { "inlineData": { "mimeType": base_image_mime, "data": base_image_clean } },
                { "inlineData": { "mimeType": "image/png", "data": mask_clean } },
                { "inlineData": { "mimeType": "image/jpeg", "data": ref_image_clean } }
            ]
        }],
        "generationConfig": { 
            "responseModalities": ["IMAGE"] 
        },
        "safetySettings": [
            { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" }
        ]
    }

    try:
        response = requests.post(GEMINI_GENERATE_URL, headers={"Content-Type": "application/json"}, json=payload)
        response_data = response.json()

        if response.status_code != 200:
            print(f"GEMINI ERROR ({response.status_code}): {response.text}")
            return jsonify({"error": response_data}), response.status_code

        candidates = response_data.get('candidates', [])
        if not candidates:
            return jsonify({"error": "No candidates returned"}), 500

        generated_image_b64 = None
        for part in candidates[0].get('content', {}).get('parts', []):
            if 'inlineData' in part and 'data' in part['inlineData']:
                generated_image_b64 = f"data:image/png;base64,{part['inlineData']['data']}"
                break
        
        if not generated_image_b64:
            return jsonify({"error": "No image data found in response"}), 500

        return jsonify({"generated_image": generated_image_b64}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
