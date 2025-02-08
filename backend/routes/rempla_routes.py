from flask import Blueprint, request, jsonify
from datetime import datetime
from middleware.auth_middleware import verify_firebase_token
from firebase_admin import firestore
import google.cloud.exceptions

rempla_bp = Blueprint('rempla', __name__)

@rempla_bp.route('/search_replacements', methods=['POST'])
@verify_firebase_token
def search_replacements():
    try:
        # Récupérer les données de la requête
        data = request.json
        profession_id = data.get('professionId')
        establishment_ids = data.get('establishmentIds', [])

        print(f"\n🔍 Recherche avec:")
        print(f"- Profession: {profession_id}")
        print(f"- Établissements: {establishment_ids}")

        # Test simple de lecture Firestore
        try:
            print("\n📊 Test de connexion Firestore...")
            db = firestore.client()
            print("✅ Client Firestore obtenu")
        except Exception as e:
            print("❌ Erreur de connexion:", str(e))
            raise

        try:
            print("\n📚 Test de lecture collection...")
            replacements_ref = db.collection('replacements')
            print("✅ Référence collection obtenue")
        except Exception as e:
            print("❌ Erreur d'accès collection:", str(e))
            raise

        try:
            print("\n🔎 Test lecture simple...")
            # Test de lecture sans stream d'abord
            collection_path = replacements_ref._path
            print(f"Collection path: {collection_path}")
            
            # Essai avec get() au lieu de stream()
            docs = replacements_ref.limit(1).get()
            all_docs = list(docs)
            print(f"✅ Nombre de documents trouvés: {len(all_docs)}")
        except google.cloud.exceptions.NotFound as e:
            print("❌ Collection non trouvée:", str(e))
            raise
        except Exception as e:
            print("❌ Erreur de lecture:", str(e))
            raise

        if len(all_docs) > 0:
            print("\n📄 Premier document:")
            doc = all_docs[0]
            print(f"- ID: {doc.id}")
            print(f"- Data: {doc.to_dict()}")
        else:
            print("\n📝 Création document test...")
            test_doc = {
                'professionId': profession_id,
                'establishmentId': establishment_ids[0],
                'startDate': datetime.now(),
                'endDate': datetime.now(),
                'status': 'open',
                'createdAt': datetime.now(),
                'updatedAt': datetime.now()
            }
            try:
                doc_ref = replacements_ref.add(test_doc)
                print(f"✅ Document test créé: {doc_ref[1].id}")
            except Exception as e:
                print("❌ Erreur création document:", str(e))
                raise

        return jsonify({
            "status": "success",
            "message": "Test de lecture effectué",
            "count": len(all_docs)
        })

    except Exception as e:
        print(f"\n❌ Erreur finale: {str(e)}")
        print(f"Type: {type(e)}")
        import traceback
        print("Traceback complet:")
        print(traceback.format_exc())
        return jsonify({
            "status": "error",
            "message": "Une erreur est survenue",
            "error": str(e)
        }), 500