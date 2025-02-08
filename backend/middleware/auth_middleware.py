from functools import wraps
from flask import request, jsonify
from firebase_admin import auth

def verify_firebase_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not "Authorization" in request.headers:
            return jsonify({"error": "No authorization header"}), 401

        try:
            auth_header = request.headers["Authorization"]
            token = auth_header.split(" ")[1]
            decoded_token = auth.verify_id_token(token)
            request.user = decoded_token
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({"error": str(e)}), 401

    return decorated_function 