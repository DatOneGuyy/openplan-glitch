from flask import Blueprint, request, jsonify
import requests
import time
from config import SERPAPI_API_KEY, SERPAPI_SEARCH_URL

furniture_bp = Blueprint('furniture', __name__)

@furniture_bp.route('/api/search_furniture', methods=['GET'])
def search_furniture():
    query = request.args.get('q', 'furniture')

    # Enhance the raw query to prioritize aesthetic interior design items
    enhanced_query = query
    if query.lower() == 'chairs':
        enhanced_query = 'living room chairs'
    elif query.lower() == 'lighting':
        enhanced_query = 'interior lamps'
    elif query.lower() == 'sofas':
        enhanced_query = 'living room sofas'
    else:
        enhanced_query = f"{query} modern home"

    if not SERPAPI_API_KEY:
        print("SERPAPI_API_KEY not found. Returning mock data.")
        mock_data = [
            {"title": "Nordic Dining Chair", "price": "$249", "thumbnail": "https://m.media-amazon.com/images/I/71R2o5v9ECL._AC_UL320_.jpg", "category": "Chairs", "seller": "West Elm", "rating": 4.5, "link": "https://www.westelm.com/search/results.html?words=nordic+dining+chair"},
            {"title": "Accent Armchair", "price": "$599", "thumbnail": "https://m.media-amazon.com/images/I/81hP8u3dZGL._AC_UL320_.jpg", "category": "Chairs", "seller": "Wayfair", "rating": 4.8, "link": "https://www.wayfair.com/keyword.php?keyword=accent+armchair"},
            {"title": "Cloud Sofa", "price": "$1899", "thumbnail": "https://m.media-amazon.com/images/I/61N+E2qOMEL._AC_UL320_.jpg", "category": "Sofas", "seller": "CB2", "rating": 4.9, "link": "https://www.cb2.com/search?query=cloud+sofa"},
            {"title": "Minimal Coffee Table", "price": "$449", "thumbnail": "https://m.media-amazon.com/images/I/61y88y10EwL._AC_UL320_.jpg", "category": "Coffee Tables", "seller": "Article", "rating": 4.6, "link": "https://www.article.com/search?q=minimal+coffee+table"},
            {"title": "Modern Side Table", "price": "$179", "thumbnail": "https://m.media-amazon.com/images/I/71x58p+4XWL._AC_UL320_.jpg", "category": "Side Tables", "seller": "IKEA", "rating": 4.2, "link": "https://www.ikea.com/us/en/search/s/?q=modern+side+table"},
            {"title": "Arc Floor Lamp", "price": "$329", "thumbnail": "https://m.media-amazon.com/images/I/51rY+JqQKkS._AC_UL320_.jpg", "category": "Lighting", "seller": "Target", "rating": 4.4, "link": "https://www.target.com/s?searchTerm=arc+floor+lamp"},
            {"title": "Modular Bookshelf", "price": "$679", "thumbnail": "https://m.media-amazon.com/images/I/71q5nWhkGmL._AC_UL320_.jpg", "category": "Shelving", "seller": "West Elm", "rating": 4.7, "link": "https://www.westelm.com/search/results.html?words=modular+bookshelf"},
            {"title": "Live Edge Dining Table", "price": "$1499", "thumbnail": "https://m.media-amazon.com/images/I/81JzB+y1rBL._AC_UL320_.jpg", "category": "Dining Tables", "seller": "Williams Sonoma", "rating": 4.9, "link": "https://www.williams-sonoma.com/search/results.html?words=live+edge+dining+table"},
            {"title": "Platform Bed Frame", "price": "$899", "thumbnail": "https://m.media-amazon.com/images/I/71g0-bK4y-L._AC_UL320_.jpg", "category": "Beds", "seller": "Crate & Barrel", "rating": 4.8, "link": "https://www.crateandbarrel.com/search?query=platform+bed+frame"},
            {"title": "6-Drawer Dresser", "price": "$799", "thumbnail": "https://m.media-amazon.com/images/I/81I+r9W6u8L._AC_UL320_.jpg", "category": "Dressers", "seller": "Wayfair", "rating": 4.3, "link": "https://www.wayfair.com/keyword.php?keyword=6-drawer+dresser"}
        ]
        time.sleep(0.5)
        return jsonify({"results": mock_data}), 200

    params = {
        "engine": "google_shopping",
        "hl": "en",
        "gl": "us",
        "q": enhanced_query,
        "api_key": SERPAPI_API_KEY
    }

    try:
        response = requests.get(SERPAPI_SEARCH_URL, params=params)
        response_data = response.json()
        print(f"DEBUG: SerpApi call for '{query}' returned {response.status_code}")

        if response.status_code == 200:
            results = []
            shopping_results = response_data.get('shopping_results', [])
            for item in shopping_results:
                results.append({
                    "title": item.get('title', 'Unknown Item'),
                    "price": item.get('price', 'N/A'),
                    "thumbnail": item.get('thumbnail', ''),
                    "category": query.capitalize(),
                    "seller": item.get('source', 'Unknown Seller'),
                    "rating": item.get('rating'),
                    "link": item.get('link', '#')
                })
            return jsonify({"results": results}), 200
        else:
            return jsonify({"error": "Failed to fetch from SerpApi"}), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500
