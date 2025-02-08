import firebase_admin
from firebase_admin import firestore
import sys
import os
from datetime import datetime
import time

# Ajouter le chemin du dossier parent pour importer la config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config.firebase_config import app

def get_db_with_timeout(timeout=30):
    """Obtenir une connexion à Firestore avec timeout"""
    print("🔄 Tentative de connexion à Firestore...")
    start_time = time.time()
    
    while time.time() - start_time < timeout:
        try:
            db = firestore.client()
            # Test de connexion
            collections = list(db.collections())
            print("✅ Connexion à Firestore établie avec succès")
            return db
        except Exception as e:
            print(f"⚠️ Erreur de connexion: {str(e)}")
            if time.time() - start_time < timeout:
                print("🔄 Nouvelle tentative dans 5 secondes...")
                time.sleep(5)
            else:
                raise TimeoutError("Impossible de se connecter à Firestore après 30 secondes")
    
    raise TimeoutError("Timeout lors de la connexion à Firestore")

def analyze_document(doc):
    """Analyser la structure d'un document"""
    try:
        structure = {}
        print(f"      🔍 Lecture des données du document...")
        data = doc.to_dict()
        if data:
            for key, value in data.items():
                if isinstance(value, (dict, list, str, int, float, bool, datetime)):
                    structure[key] = type(value).__name__
                elif value is None:
                    structure[key] = "null"
        return structure
    except Exception as e:
        print(f"⚠️ Erreur lors de l'analyse du document: {str(e)}")
        return {}

def analyze_collection(collection_ref, processed_collections=None):
    """Analyser récursivement une collection"""
    try:
        if processed_collections is None:
            processed_collections = set()
        
        collection_path = collection_ref._path[0]
        print(f"📁 Analyse de la collection: {collection_path}")
        
        if collection_path in processed_collections:
            return {}
        
        processed_collections.add(collection_path)
        structure = {}
        
        # Récupérer les documents avec timeout
        print(f"   📄 Récupération des documents...")
        start_time = time.time()
        try:
            docs = list(collection_ref.limit(5).stream())
            print(f"   ✅ {len(docs)} documents récupérés en {time.time() - start_time:.2f} secondes")
        except Exception as e:
            print(f"   ⚠️ Erreur lors de la récupération des documents: {str(e)}")
            return {}
        
        for doc in docs:
            print(f"   📝 Analyse du document: {doc.id}")
            doc_structure = analyze_document(doc)
            
            # Fusionner la structure avec les structures précédentes
            for field, field_type in doc_structure.items():
                if field not in structure:
                    structure[field] = set()
                structure[field].add(field_type)
            
            # Vérifier les sous-collections
            print(f"   🔍 Recherche de sous-collections pour {doc.id}...")
            subcollections = list(doc.reference.collections())
            if subcollections:
                print(f"   📚 {len(subcollections)} sous-collections trouvées")
                for subcoll in subcollections:
                    sub_structure = analyze_collection(subcoll, processed_collections)
                    if sub_structure:
                        subcoll_name = f"{collection_path}/{doc.id}/{subcoll.id}"
                        structure[f"subcollection_{subcoll.id}"] = sub_structure
        
        return structure
    except Exception as e:
        print(f"⚠️ Erreur lors de l'analyse de la collection {collection_path}: {str(e)}")
        return {}

def generate_markdown(structure, collection_name="", level=0):
    """Générer la documentation en markdown"""
    try:
        markdown = ""
        if level == 0:
            markdown += "# Structure de la base de données Firebase\n\n"
            markdown += "Ce document décrit la structure des collections et des documents dans notre base de données Firebase.\n\n"
            markdown += "_Document généré automatiquement le " + datetime.now().strftime("%d/%m/%Y à %H:%M") + "_\n\n"
            markdown += "## Vue d'ensemble\n\n"
            markdown += "La base de données contient les collections principales suivantes :\n\n"
            for coll_name in structure.keys():
                markdown += f"- `{coll_name}`\n"
            markdown += "\n## Détails des collections\n\n"
        
        if collection_name:
            markdown += "#" * (level + 2) + f" Collection: `{collection_name}`\n\n"
            if level == 2:
                markdown += "_Sous-collection_\n\n"
        
        if structure:
            if any(not field.startswith("subcollection_") for field in structure.keys()):
                markdown += "### Structure des documents\n\n"
                markdown += "| Champ | Type(s) | Description |\n|-------|----------|-------------|\n"
                for field, types in sorted(structure.items()):
                    if not field.startswith("subcollection_"):
                        if isinstance(types, set):
                            type_str = " ou ".join(sorted(types))
                            description = get_field_description(field)
                            markdown += f"| `{field}` | {type_str} | {description} |\n"
            
            # Traiter les sous-collections
            subcollections = {k: v for k, v in structure.items() if k.startswith("subcollection_")}
            if subcollections:
                markdown += "\n### Sous-collections\n\n"
                for field, sub_structure in subcollections.items():
                    subcoll_name = field.replace("subcollection_", "")
                    markdown += generate_markdown(sub_structure, subcoll_name, level + 1)
        else:
            markdown += "_Aucun document trouvé dans cette collection_\n\n"
        
        return markdown
    except Exception as e:
        print(f"⚠️ Erreur lors de la génération du markdown: {str(e)}")
        return "# Erreur lors de la génération de la documentation\n\n"

def get_field_description(field_name):
    """Retourne une description pour les champs connus"""
    descriptions = {
        # Users
        "uid": "Identifiant unique de l'utilisateur",
        "email": "Adresse email de l'utilisateur",
        "displayName": "Nom d'affichage de l'utilisateur",
        "photoURL": "URL de la photo de profil",
        "createdAt": "Date de création du compte",
        "updatedAt": "Date de dernière mise à jour",
        "role": "Rôle de l'utilisateur dans l'application",
        
        # Establishments
        "name": "Nom de l'établissement",
        "address": "Adresse de l'établissement",
        "phone": "Numéro de téléphone",
        "type": "Type d'établissement",
        "specialties": "Spécialités de l'établissement",
        
        # Replacements
        "startDate": "Date de début du remplacement",
        "endDate": "Date de fin du remplacement",
        "status": "Statut du remplacement",
        "description": "Description du remplacement",
        "requirements": "Exigences pour le remplacement",
        
        # Conversations
        "participants": "Liste des participants à la conversation",
        "lastMessage": "Dernier message de la conversation",
        "lastMessageDate": "Date du dernier message",
        
        # Messages
        "content": "Contenu du message",
        "sender": "Identifiant de l'expéditeur",
        "timestamp": "Horodatage du message",
        
        # Professions
        "title": "Titre de la profession",
        "category": "Catégorie de la profession",
        "requirements": "Exigences pour exercer la profession",
        
        # Specialties
        "name": "Nom de la spécialité",
        "description": "Description de la spécialité",
        "category": "Catégorie de la spécialité"
    }
    return descriptions.get(field_name, "Champ personnalisé")

def main():
    try:
        print("\n🔥 Démarrage de l'analyse de la base de données Firebase...")
        
        # Obtenir une connexion avec timeout
        try:
            db = get_db_with_timeout(timeout=30)
        except TimeoutError as e:
            print(f"\n❌ {str(e)}")
            sys.exit(1)
        
        # Récupérer toutes les collections racines
        print("\n📚 Récupération des collections racines...")
        try:
            collections = list(db.collections())
            print(f"📊 Nombre de collections trouvées: {len(collections)}")
        except Exception as e:
            print(f"❌ Erreur lors de la récupération des collections: {str(e)}")
            sys.exit(1)
        
        # Analyser chaque collection
        full_structure = {}
        processed_collections = set()
        
        for collection in collections:
            print(f"\n🔍 Analyse de la collection racine: {collection.id}")
            collection_structure = analyze_collection(collection, processed_collections)
            if collection_structure:
                full_structure[collection.id] = collection_structure
        
        # Générer le markdown
        print("\n📝 Génération du markdown...")
        markdown = generate_markdown(full_structure)
        
        # Écrire dans le fichier
        docs_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "docs", "firebase_structure.md")
        print(f"\n💾 Écriture du fichier: {docs_path}")
        
        with open(docs_path, "w", encoding="utf-8") as f:
            f.write(markdown)
        
        print("\n✅ Documentation générée avec succès dans docs/firebase_structure.md")
        
        if not full_structure:
            print("\n⚠️ Attention: Aucune donnée n'a été trouvée dans la base de données.")
            
    except Exception as e:
        print(f"\n❌ Erreur lors de l'exécution du script: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 