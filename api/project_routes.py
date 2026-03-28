import os
import uuid
import json
import base64
from flask import Blueprint, request, jsonify
from flask_login import current_user, login_required
from models import db, Project
from utils.image_utils import clean_b64, get_image_data

project_bp = Blueprint('projects', __name__)

PROJECT_UPLOAD_FOLDER = 'static/projects'

@project_bp.route('/api/projects/save', methods=['POST'])
@login_required
def save_project():
    data = request.json
    name = data.get('name', 'Untitled Room')
    image_b64 = data.get('imageBase64')
    furniture_data = data.get('furnitureData', [])

    if not image_b64:
        return jsonify({"error": "Missing image data"}), 400

    # Ensure upload folder exists
    if not os.path.exists(PROJECT_UPLOAD_FOLDER):
        os.makedirs(PROJECT_UPLOAD_FOLDER)

    # 1. Generate unique filename
    filename = f"design_{uuid.uuid4().hex}.png"
    filepath = os.path.join(PROJECT_UPLOAD_FOLDER, filename)

    # 2. Save image to disk
    try:
        # Use get_image_data to handle both direct base64 and local paths when overwriting
        image_data_str = get_image_data(image_b64)
        image_data = base64.b64decode(image_data_str)
        with open(filepath, 'wb') as f:
            f.write(image_data)
    except Exception as e:
        return jsonify({"error": f"Failed to save image: {str(e)}"}), 500

    # 3. Check for existing project with the same name to overwrite
    existing_project = Project.query.filter_by(name=name, user_id=current_user.id).first()

    if existing_project:
        # Delete old image file
        if existing_project.designed_image_path:
            old_path = existing_project.designed_image_path.lstrip('/')
            if os.path.exists(old_path):
                try:
                    os.remove(old_path)
                except:
                    pass
        
        # Update existing record
        existing_project.designed_image_path = f"/static/projects/{filename}"
        existing_project.furniture_data = json.dumps(furniture_data)
        db.session.commit()
        
        return jsonify({
            "message": "Project updated successfully",
            "id": existing_project.id
        }), 200
    else:
        # Create new Project record
        new_project = Project(
            name=name,
            designed_image_path=f"/static/projects/{filename}",
            furniture_data=json.dumps(furniture_data),
            user_id=current_user.id
        )
        db.session.add(new_project)
        db.session.commit()

        return jsonify({
            "message": "Project saved successfully",
            "id": new_project.id
        }), 201

@project_bp.route('/api/projects/list', methods=['GET'])
@login_required
def list_projects():
    projects = Project.query.filter_by(user_id=current_user.id).all()
    results = []
    for p in projects:
        results.append({
            "id": p.id,
            "name": p.name,
            "thumbnail": p.designed_image_path
        })
    return jsonify({"projects": results}), 200

@project_bp.route('/api/projects/load/<int:project_id>', methods=['GET'])
@login_required
def load_project(project_id):
    project = Project.query.filter_by(id=project_id, user_id=current_user.id).first()
    if not project:
        return jsonify({"error": "Project not found"}), 404

    return jsonify({
        "id": project.id,
        "name": project.name,
        "imageUrl": project.designed_image_path,
        "furnitureData": json.loads(project.furniture_data)
    }), 200

@project_bp.route('/api/projects/delete/<int:project_id>', methods=['DELETE'])
@login_required
def delete_project(project_id):
    project = Project.query.filter_by(id=project_id, user_id=current_user.id).first()
    if not project:
        return jsonify({"error": "Project not found"}), 404

    # Delete the image file
    if project.designed_image_path:
        local_path = project.designed_image_path.lstrip('/')
        if os.path.exists(local_path):
            os.remove(local_path)

    db.session.delete(project)
    db.session.commit()
    return jsonify({"message": "Project deleted successfully"}), 200
