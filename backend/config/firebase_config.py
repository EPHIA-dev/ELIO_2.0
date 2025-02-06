import firebase_admin
from firebase_admin import credentials, auth

# Initialisez Firebase Admin avec vos credentials
# Vous devez télécharger le fichier JSON des credentials depuis la console Firebase
cred = credentials.Certificate("config/elio-49720-firebase-adminsdk-fbsvc-735bfdc0df.json")
firebase_admin = firebase_admin.initialize_app(cred) 