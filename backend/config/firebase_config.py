import firebase_admin
from firebase_admin import credentials, auth
import os

# Obtenir le chemin absolu du fichier de credentials
current_dir = os.path.dirname(os.path.abspath(__file__))
cred_path = os.path.join(current_dir, "admin.json")

try:
    # Vérifier si Firebase est déjà initialisé
    app = firebase_admin.get_app()
except ValueError:
    # Si non, initialiser avec les credentials
    cred = credentials.Certificate(cred_path)
    app = firebase_admin.initialize_app(cred)

print("✅ Firebase initialisé avec succès") 