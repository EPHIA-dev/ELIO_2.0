from flask import Blueprint, request, jsonify
from datetime import datetime
from middleware.auth_middleware import verify_firebase_token
from firebase_admin import firestore

message_bp = Blueprint('message', __name__)

@message_bp.route('/send_message', methods=['POST'])
@verify_firebase_token
def send_message():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'Missing message data'}), 400

        # Validation des champs requis
        required_fields = ['conversationId', 'type', 'content']
        if not all(field in data for field in required_fields):
            return jsonify({'error': f'Missing required fields. Required: {required_fields}'}), 400

        # Initialiser Firestore
        db = firestore.client()
        
        # Créer le document message
        message_data = {
            'senderId': request.user['uid'],  # ID de l'utilisateur depuis le token
            'createdAt': datetime.utcnow(),
            'readBy': [request.user['uid']],  # Le sender a déjà lu le message
            'type': data['type'],
            'content': data['content'],
            'conversationId': data['conversationId']
        }

        # Ajouter les pièces jointes si présentes
        if 'attachments' in data:
            message_data['attachments'] = data['attachments']

        # Vérifier que la conversation existe
        conversation_ref = db.collection('conversations').document(data['conversationId'])
        conversation = conversation_ref.get()
        
        if not conversation.exists:
            return jsonify({'error': 'Conversation not found'}), 404

        # Vérifier que l'utilisateur fait partie de la conversation
        conversation_data = conversation.to_dict()
        if request.user['uid'] not in conversation_data.get('participants', []):
            return jsonify({'error': 'User not authorized for this conversation'}), 403

        # Ajouter le message à la sous-collection messages de la conversation
        message_ref = conversation_ref.collection('messages').document()
        message_data['id'] = message_ref.id
        message_ref.set(message_data)

        # Mettre à jour la date de dernière activité de la conversation
        conversation_ref.update({
            'lastActivity': datetime.utcnow(),
            'lastMessage': {
                'content': data['content'][:100] if data['type'] == 'user' else 'Nouveau message',
                'senderId': request.user['uid'],
                'timestamp': datetime.utcnow()
            }
        })

        print(f"✉️ Message envoyé dans la conversation {data['conversationId']}")
        print(f"👤 Expéditeur: {request.user['uid']}")
        print(f"📝 Type: {data['type']}")

        return jsonify(message_data), 201

    except Exception as e:
        print("❌ Erreur lors de l'envoi du message:", str(e))
        return jsonify({'error': 'Failed to send message'}), 500

@message_bp.route('/delete_message/<conversation_id>/<message_id>', methods=['DELETE'])
@verify_firebase_token
def delete_message(conversation_id, message_id):
    try:
        # Initialiser Firestore
        db = firestore.client()
        
        # Références aux documents
        conversation_ref = db.collection('conversations').document(conversation_id)
        message_ref = conversation_ref.collection('messages').document(message_id)
        
        # Vérifier que la conversation existe
        conversation = conversation_ref.get()
        if not conversation.exists:
            return jsonify({'error': 'Conversation not found'}), 404
            
        # Vérifier que l'utilisateur fait partie de la conversation
        conversation_data = conversation.to_dict()
        if request.user['uid'] not in conversation_data.get('participants', []):
            return jsonify({'error': 'User not authorized for this conversation'}), 403
            
        # Récupérer le message
        message = message_ref.get()
        if not message.exists:
            return jsonify({'error': 'Message not found'}), 404
            
        # Vérifier que l'utilisateur est l'expéditeur du message
        message_data = message.to_dict()
        if message_data['senderId'] != request.user['uid']:
            return jsonify({'error': 'Not authorized to delete this message'}), 403
            
        # Supprimer le message
        message_ref.delete()
        
        # Si c'était le dernier message de la conversation, mettre à jour lastMessage
        last_message = None
        messages = conversation_ref.collection('messages').order_by(
            'createdAt', direction=firestore.Query.DESCENDING
        ).limit(1).stream()
        
        for msg in messages:
            last_message = msg.to_dict()
            break
            
        if last_message:
            conversation_ref.update({
                'lastMessage': {
                    'content': last_message.get('content', '')[:100] if last_message.get('type') == 'user' else 'Message précédent',
                    'senderId': last_message.get('senderId'),
                    'timestamp': last_message.get('createdAt')
                }
            })
        else:
            # Aucun message restant
            conversation_ref.update({
                'lastMessage': None
            })
            
        print(f"🗑️ Message supprimé")
        print(f"💬 Conversation: {conversation_id}")
        print(f"📝 Message ID: {message_id}")
        print(f"👤 Supprimé par: {request.user['uid']}")
        
        return jsonify({'message': 'Message deleted successfully'}), 200
        
    except Exception as e:
        print("❌ Erreur lors de la suppression du message:", str(e))
        return jsonify({'error': 'Failed to delete message'}), 500 