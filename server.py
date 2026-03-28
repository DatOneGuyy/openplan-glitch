from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import os
from api.design_routes import design_bp
from api.analysis_routes import analysis_bp
from api.furniture_routes import furniture_bp
from api.auth_routes import auth_bp
from api.project_routes import project_bp
from models import db, User
from flask_login import LoginManager

app = Flask(__name__, static_folder='.', static_url_path='')
app.config.from_pyfile('config.py')
CORS(app)

# Initialize Database
db.init_app(app)

# Initialize Login Manager
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Register Blueprints
app.register_blueprint(design_bp)
app.register_blueprint(analysis_bp)
app.register_blueprint(furniture_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(project_bp)

@app.route('/')
def serve_index():
    return app.send_static_file('index.html')

@app.route('/login')
def serve_login():
    return app.send_static_file('login.html')

@app.route('/signup')
def serve_signup():
    return app.send_static_file('signup.html')

@app.route('/welcome')
def serve_welcome():
    return app.send_static_file('welcome.html')

@app.route('/static/projects/<path:filename>')
def serve_project_image(filename):
    return send_from_directory(os.path.join(os.path.dirname(__file__), 'static', 'projects'), filename)

if __name__ == '__main__':
    # When running locally, use port 5000
    app.run(debug=True, port=5000)