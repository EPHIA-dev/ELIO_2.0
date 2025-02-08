import firebase_admin
from firebase_admin import credentials, auth
import os

# Initialisez Firebase Admin avec vos credentials
# Vous devez télécharger le fichier JSON des credentials depuis la console Firebase
current_dir = os.path.dirname(os.path.abspath(__file__))
cred_path = os.path.join(current_dir, "elio-49720-firebase-adminsdk-fbsvc-735bfdc0df.json")
cred = credentials.Certificate(cred_path)
firebase_admin = firebase_admin.initialize_app(cred) 