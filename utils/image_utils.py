import base64
import requests
import os

def clean_b64(b64):
    """Strips the data URI prefix from a base64 string if present and ensures correct padding."""
    if not b64:
        return ""
    if isinstance(b64, str) and ',' in b64:
        b64 = b64.split(',')[1]
    
    # Fix padding issues: base64 requires length multiple of 4
    missing_padding = len(b64) % 4
    if missing_padding:
        b64 += '=' * (4 - missing_padding)
    return b64

def get_image_data(src):
    """
    Ensures we have raw base64 data. 
    Handles:
    - Data URIs (strips prefix)
    - Local absolute/relative paths (reads from disk)
    - Remote URLs (fetches via requests)
    """
    if not src:
        return ""
    
    # Handle Data URI
    if isinstance(src, str) and src.startswith('data:'):
        return clean_b64(src)
    
    # Handle Remote URL
    if isinstance(src, str) and src.startswith('http'):
        try:
            resp = requests.get(src, timeout=10)
            if resp.status_code == 200:
                return base64.b64encode(resp.content).decode('utf-8')
        except Exception as e:
            print(f"Failed to fetch remote image: {e}")
            return ""

    # Handle Local Path (e.g., /static/projects/...)
    if isinstance(src, str) and (src.startswith('/') or 'static' in src):
        # Strip leading slash for os.path.join if needed
        local_path = src.lstrip('/')
        if os.path.exists(local_path):
            try:
                with open(local_path, 'rb') as f:
                    return base64.b64encode(f.read()).decode('utf-8')
            except Exception as e:
                print(f"Failed to read local image {local_path}: {e}")
        else:
            print(f"Local path does not exist: {local_path}")

    return src # Assume it's already clean base64 if none of the above
