from flask import Blueprint, request, jsonify
from datetime import datetime
from middleware.auth_middleware import verify_firebase_token
from firebase_admin import firestore

rempla_bp = Blueprint('rempla', __name__)

@rempla_bp.route('/search_replacements', methods=['POST'])
@verify_firebase_token
def search_replacements():
    try:
        # Log des headers et du corps de la requête
        print("\n=== Nouvelle requête de recherche ===")
        print("Headers:", dict(request.headers))
        print("Request data:", request.json)

        data = request.json
        if not data or 'professionId' not in data:
            return jsonify({'error': 'professionId is required'}), 400

        db = firestore.client()
        replacements_ref = db.collection('replacements')
        
        # 1. Filtre OBLIGATOIRE : professionId
        query = replacements_ref.where(
            filter=firestore.FieldFilter('professionId', '==', data['professionId'])
        )
        
        # 2. Filtre OPTIONNEL : établissements spécifiques
        if data.get('establishmentIds'):
            query = query.where(
                filter=firestore.FieldFilter('establishmentId', 'in', data['establishmentIds'])
            )
            
        # 3. Filtre OPTIONNEL : plage de dates spécifique
        if data.get('startDate') and data.get('endDate'):
            start_date = datetime.fromisoformat(data['startDate'].replace('Z', '+00:00'))
            end_date = datetime.fromisoformat(data['endDate'].replace('Z', '+00:00'))
            
            print(f"Recherche entre dates: {start_date} et {end_date}")
            
            query = query.where(
                filter=firestore.FieldFilter('startDate', '>=', start_date)
            ).where(
                filter=firestore.FieldFilter('startDate', '<=', end_date)
            )
            
        # 4. Filtre OPTIONNEL : spécialités (filtré après la requête)
        results = query.stream()
        replacements = []
        
        print("\n🔍 Détails des documents trouvés avant filtrage:")
        for doc in results:
            replacement = doc.to_dict()
            print(f"\nDocument ID: {doc.id}")
            print(f"- professionId: {replacement.get('professionId')}")
            print(f"- establishmentId: {replacement.get('establishmentId')}")
            print(f"- startDate: {replacement.get('startDate')}")
            print(f"- specialtyId: {replacement.get('specialtyId')}")
            
            # Ne filtrer par spécialité que si spécifiée
            if data.get('specialtyIds'):
                if replacement.get('specialtyId') not in data['specialtyIds']:
                    continue
                    
            # Formater les dates pour JSON
            replacement['createdAt'] = replacement['createdAt'].isoformat() if 'createdAt' in replacement else None
            replacement['updatedAt'] = replacement['updatedAt'].isoformat() if 'updatedAt' in replacement else None
            replacement['startDate'] = replacement['startDate'].isoformat()
            replacement['endDate'] = replacement['endDate'].isoformat()
            replacements.append(replacement)
        
        # Ajout du log visible pour le nombre de résultats
        print("\n" + "="*50)
        print(f"🔍 RÉSULTATS TROUVÉS : {len(replacements)} {'remplacement' if len(replacements) == 1 else 'remplacements'}")
        if len(replacements) == 0:
            print("❌ Aucun remplacement ne correspond aux critères")
        elif len(replacements) < 3:
            print("⚠️  Peu de remplacements disponibles")
        else:
            print("✅ Nombre satisfaisant de remplacements")
        print("="*50 + "\n")
            
        return jsonify(replacements), 200
        
    except Exception as e:
        print("❌ Erreur:", str(e))
        return jsonify({'error': 'Failed to search replacements'}), 500 