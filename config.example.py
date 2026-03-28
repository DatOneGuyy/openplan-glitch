import os

# Copy this file to config.py and fill in your actual keys.
# DO NOT commit config.py to version control.

# API Keys (Get these from Google AI Studio and SerpApi)
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', 'your-gemini-key-here')
SERPAPI_API_KEY = os.environ.get('SERPAPI_API_KEY', 'your-serpapi-key-here')

# Security
SECRET_KEY = os.environ.get('SECRET_KEY', 'default-dev-secret-key-change-this')

# Database
SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///app.db')
SQLALCHEMY_TRACK_MODIFICATIONS = False

# API URLs
GEMINI_GENERATE_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={GEMINI_API_KEY}"
GEMINI_ANALYZE_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={GEMINI_API_KEY}"
SERPAPI_SEARCH_URL = 'https://serpapi.com/search.json'
