# ELIO_Backend/app.py

from flask import Flask, jsonify
from flask_cors import CORS
from routes.user_routes import user_bp
from config.firebase_config import firebase_admin
from routes.rempla_routes import rempla_bp
from routes.message_routes import message_bp
from datetime import datetime

app = Flask(__name__)
CORS(app)  # En développement
# En production, spécifiez l'origine exacte :
# CORS(app, resources={r"/*": {"origins": "https://votre-domaine.com"}})

@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({
        'status': 'success',
        'message': 'Pong! Le serveur est en ligne',
        'timestamp': datetime.now().isoformat()
    })

# Enregistrer le blueprint
app.register_blueprint(user_bp)
app.register_blueprint(rempla_bp)
app.register_blueprint(message_bp)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)  # host='0.0.0.0' permet les connexions externes