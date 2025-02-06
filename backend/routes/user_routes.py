# ELIO_Backend/routes/user_routes.py

from flask import Blueprint, request, jsonify
from datetime import datetime
from middleware.auth_middleware import verify_firebase_token
from firebase_admin import firestore

user_bp = Blueprint('user', __name__)

@user_bp.route('/create_user', methods=['POST'])
@verify_firebase_token
def create_user():
    try:
        # Initialiser Firestore
        db = firestore.client()
        
        # Le token décodé est maintenant disponible dans request.user
        firebase_user = request.user
        
        # Créer le document utilisateur
        user_document = {
            "uid": firebase_user['uid'],
            "email": firebase_user['email'],
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
            "role": "user",
            "isProfileComplete": False,
            "onboardingStep": 0
        }
        
        # Sauvegarder dans Firestore
        db.collection('users').document(firebase_user['uid']).set(user_document)
        
        print("User created in Firestore:", user_document)
        return jsonify(user_document), 201
        
    except Exception as e:
        print("Error creating user:", str(e))
        return jsonify({'error': 'Failed to create user'}), 500

@user_bp.route('/update_user/<uid>', methods=['PUT'])
@verify_firebase_token
def update_user(uid):
    try:
        if request.user['uid'] != uid:
            return jsonify({'error': 'Unauthorized'}), 403
        
        db = firestore.client()
        data = request.json
        
        # Valider les champs autorisés
        allowed_fields = {
            'onboardingStep', 'isProfileComplete', 'professionId',
            'specialityIds', 'firstName', 'lastName', 'birthDate'
        }
        
        # Ne garder que les champs autorisés
        update_data = {
            key: value for key, value in data.items() 
            if key in allowed_fields
        }
        
        # Ajouter updatedAt
        update_data['updatedAt'] = datetime.utcnow()
        
        if not update_data:
            return jsonify({'error': 'No valid fields to update'}), 400
            
        db.collection('users').document(uid).update(update_data)
        
        print("User updated in Firestore:", update_data)
        return jsonify(update_data), 200
        
    except Exception as e:
        print("Error updating user:", str(e))
        return jsonify({'error': 'Failed to update user'}), 500