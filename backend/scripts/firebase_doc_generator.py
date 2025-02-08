def get_field_description(collection_name, field_name):
    """Retourne une description pour les champs connus"""
    descriptions = {
        "users": {
            "uid": "Identifiant unique de l'utilisateur",
            "email": "Adresse email de l'utilisateur",
            "displayName": "Nom d'affichage de l'utilisateur",
            "photoURL": "URL de la photo de profil",
            "createdAt": "Date de création du compte",
            "updatedAt": "Date de dernière mise à jour",
            "role": "Rôle de l'utilisateur dans l'application",
            "firstName": "Prénom de l'utilisateur",
            "lastName": "Nom de famille de l'utilisateur",
            "phone": "Numéro de téléphone",
            "profession": "Profession de l'utilisateur",
            "specialty": "Spécialité de l'utilisateur",
            "establishment": "Établissement de rattachement"
        },
        "establishments": {
            "name": "Nom de l'établissement",
            "address": "Adresse de l'établissement",
            "phone": "Numéro de téléphone",
            "email": "Adresse email de contact",
            "type": "Type d'établissement",
            "specialties": "Liste des spécialités disponibles",
            "createdAt": "Date de création",
            "updatedAt": "Date de mise à jour",
            "location": "Coordonnées géographiques",
            "description": "Description de l'établissement",
            "website": "Site web de l'établissement"
        },
        "replacements": {
            "startDate": "Date de début du remplacement",
            "endDate": "Date de fin du remplacement",
            "status": "Statut du remplacement (en attente, accepté, terminé, etc.)",
            "description": "Description détaillée du remplacement",
            "requirements": "Exigences spécifiques pour le remplacement",
            "establishment": "Référence vers l'établissement concerné",
            "specialty": "Spécialité requise",
            "createdBy": "Utilisateur ayant créé l'annonce",
            "acceptedBy": "Utilisateur ayant accepté le remplacement",
            "payment": "Informations sur la rémunération",
            "location": "Lieu du remplacement"
        },
        "conversations": {
            "participants": "Liste des participants à la conversation",
            "lastMessage": "Contenu du dernier message",
            "lastMessageDate": "Date du dernier message",
            "createdAt": "Date de création de la conversation",
            "type": "Type de conversation (privée, groupe)",
            "title": "Titre de la conversation (pour les groupes)",
            "unreadCount": "Nombre de messages non lus"
        },
        "professions": {
            "title": "Titre de la profession",
            "description": "Description détaillée",
            "category": "Catégorie de la profession",
            "requirements": "Exigences légales et qualifications",
            "specialties": "Liste des spécialités possibles",
            "createdAt": "Date de création",
            "updatedAt": "Date de mise à jour"
        },
        "specialties": {
            "name": "Nom de la spécialité",
            "description": "Description détaillée",
            "category": "Catégorie de la spécialité",
            "profession": "Profession associée",
            "requirements": "Exigences spécifiques",
            "createdAt": "Date de création",
            "updatedAt": "Date de mise à jour"
        }
    }
    
    collection_fields = descriptions.get(collection_name, {})
    return collection_fields.get(field_name, "Champ personnalisé")

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
            # Filtrer les champs qui ne sont pas des sous-collections
            fields = {k: v for k, v in structure.items() if not k.startswith("subcollection_")}
            if fields:
                markdown += "### Structure des documents\n\n"
                markdown += "| Champ | Type(s) | Description |\n|-------|----------|-------------|\n"
                for field, types in sorted(fields.items()):
                    if isinstance(types, set):
                        type_str = " ou ".join(sorted(types))
                        description = get_field_description(collection_name, field)
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

def analyze_document(doc):
    """Analyser la structure d'un document"""
    try:
        structure = {}
        print(f"      🔍 Lecture des données du document...")
        data = doc.to_dict()
        if data:
            for key, value in data.items():
                if isinstance(value, dict):
                    structure[key] = "dict"
                elif isinstance(value, list):
                    structure[key] = "list"
                elif isinstance(value, (str, int, float, bool)):
                    structure[key] = type(value).__name__
                elif isinstance(value, datetime):
                    structure[key] = "datetime"
                elif value is None:
                    structure[key] = "null"
                else:
                    structure[key] = "unknown"
        return structure
    except Exception as e:
        print(f"⚠️ Erreur lors de l'analyse du document: {str(e)}")
        return {} 