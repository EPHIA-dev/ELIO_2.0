from functools import wraps
from flask import request, jsonify
import firebase_admin
from firebase_admin import auth

def verify_firebase_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        print("All headers:", dict(request.headers))
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            print("No Authorization header found")
            return jsonify({'error': 'No token provided'}), 401
            
        try:
            # Le token doit être au format "Bearer <token>"
            token = auth_header.split('Bearer ')[1]
            decoded_token = auth.verify_id_token(token)
            request.user = decoded_token
            return f(*args, **kwargs)
        except Exception as e:
            print(f"Token verification failed: {str(e)}")
            return jsonify({'error': 'Invalid token'}), 401
            
    return decorated_function 