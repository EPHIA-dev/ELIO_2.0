import firebase_admin
from firebase_admin import firestore
import sys
import os
from datetime import datetime
import time

# Ajouter le chemin du dossier parent pour importer la config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config.firebase_config import app

def detect_reference_type(value, all_collections):
    """Détecter si une valeur est une référence vers une autre collection"""
    if isinstance(value, str):
        # Vérifier si la valeur ressemble à un ID et correspond à une collection
        for collection in all_collections:
            if len(value) > 20 and any(doc.id == value for doc in collection.limit(1).stream()):
                return collection.id
    return None

def analyze_document(doc, all_collections):

    """Analyser la structure d'un document"""
    try:
        structure = {}
        print(f"      🔍 Lecture des données du document...")
        data = doc.to_dict()
        if data:
            print(f"      📄 Données trouvées: {len(data)} champs")
            for key, value in data.items():
                print(f"      🏷️  Analyse du champ: {key}")
                field_info = {"types": set(), "relations": set(), "example": None}
                
                if isinstance(value, dict):
                    field_info["types"].add("dict")
                    # Analyser le contenu du dictionnaire pour les références
                    for v in value.values():
                        ref_type = detect_reference_type(v, all_collections)
                        if ref_type:
                            field_info["relations"].add(f"ref:{ref_type}")
                
                elif isinstance(value, list):
                    if value:
                        element_type = type(value[0]).__name__
                        field_info["types"].add(f"list[{element_type}]")
                        # Vérifier si la liste contient des références
                        for v in value:
                            ref_type = detect_reference_type(v, all_collections)
                            if ref_type:
                                field_info["relations"].add(f"ref:{ref_type}")ce
                    else:
                        field_info["types"].add("list")
                
                elif isinstance(value, (str, int, float, bool)):
                    field_info["types"].add(type(value).__name__)
                    # Vérifier si c'est une référence
                    ref_type = detect_reference_type(value, all_collections)
                    if ref_type:
                        field_info["relations"].add(f"ref:{ref_type}")
                    # Stocker un exemple de valeur pour la documentation
                    if isinstance(value, str):
                        field_info["example"] = value[:50] + "..." if len(value) > 50 else value
                    else:
                        field_info["example"] = str(value)
                
                elif isinstance(value, datetime):
                    field_info["types"].add("datetime")
                    field_info["example"] = value.strftime("%Y-%m-%d %H:%M:%S")
                
                elif value is None:
                    field_info["types"].add("null")
                
                else:
                    field_info["types"].add("unknown")
                
                structure[key] = field_info
                print(f"      ✅ Analyse du champ {key}: {field_info}")

        return structure
    except Exception as e:
        print(f"⚠️ Erreur lors de l'analyse du document: {str(e)}")
        return {}

def analyze_collection(collection_ref, all_collections, processed_collections=None):

    """Analyser récursivement une collection"""
    try:
        if processed_collections is None:
            processed_collections = set()
        
        collection_path = collection_ref._path[0]
        print(f"📁 Analyse de la collection: {collection_path}")
        
        if collection_path in processed_collections:
            return {}
        
        processed_collections.add(collection_path)
        structure = {
            "fields": {},
            "relations": set(),
            "examples": {}
        }
        
        # Récupérer les documents
        print(f"   📄 Récupération des documents...")
        start_time = time.time()
        try:
            docs = list(collection_ref.limit(10).stream())  # Augmenté à 10 pour plus de données

            print(f"   ✅ {len(docs)} documents récupérés en {time.time() - start_time:.2f} secondes")
        except Exception as e:
            print(f"   ⚠️ Erreur lors de la récupération des documents: {str(e)}")
            return {}
        
        for doc in docs:
            print(f"   📝 Analyse du document: {doc.id}")
            doc_structure = analyze_document(doc, all_collections)
            print(f"   📊 Structure trouvée: {len(doc_structure)} champs")
            
            # Fusionner la structure avec les structures précédentes
            for field, field_info in doc_structure.items():
                if field not in structure["fields"]:
                    structure["fields"][field] = {"types": set(), "relations": set(), "examples": set()}
                structure["fields"][field]["types"].update(field_info["types"])
                structure["fields"][field]["relations"].update(field_info.get("relations", set()))
                if "example" in field_info and field_info["example"]:
                    structure["fields"][field]["examples"].add(field_info["example"])
            
            # Vérifier les sous-collections
            print(f"   🔍 Recherche de sous-collections pour {doc.id}...")
            subcollections = list(doc.reference.collections())
            if subcollections:
                print(f"   📚 {len(subcollections)} sous-collections trouvées")
                for subcoll in subcollections:
                    sub_structure = analyze_collection(subcoll, all_collections, processed_collections)
                    if sub_structure:
                        subcoll_name = subcoll.id
                        structure[f"subcollection_{subcoll_name}"] = sub_structure
        
        print(f"📊 Structure finale de la collection {collection_path}: {len(structure['fields'])} champs")
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
            for coll_name in [k for k in structure.keys() if not k.startswith("subcollection_")]:
                markdown += f"- `{coll_name}`\n"
            markdown += "\n## Relations entre collections\n\n"
            markdown += "```mermaid\nflowchart TD\n"
            # Générer le diagramme des relations
            relations = set()
            for coll_name, coll_structure in structure.items():
                if not coll_name.startswith("subcollection_"):
                    for field_info in coll_structure["fields"].values():
                        for relation in field_info.get("relations", set()):
                            if relation.startswith("ref:"):
                                target_coll = relation.split(":")[1]
                                relations.add(f"    {coll_name}-->{target_coll}\n")
            markdown += "".join(sorted(relations))
            markdown += "```\n\n## Détails des collections\n\n"
        
        if collection_name:
            markdown += "#" * (level + 2) + f" Collection: `{collection_name}`\n\n"
            if level == 2:
                markdown += "_Sous-collection_\n\n"
        
        if structure:
            print(f"📝 Génération markdown pour {collection_name or 'racine'}")
            # Documenter les champs
            if "fields" in structure and structure["fields"]:
                markdown += "### Structure des documents\n\n"
                markdown += "| Champ | Type(s) | Relations | Description | Exemples |\n"
                markdown += "|-------|----------|-----------|-------------|----------|\n"
                for field, field_info in sorted(structure["fields"].items()):
                    type_str = " ou ".join(sorted(field_info["types"]))
                    relations_str = ", ".join(sorted(field_info.get("relations", set())))
                    description = get_field_description(collection_name, field)
                    examples = " / ".join(sorted(field_info.get("examples", set())))[:100]
                    markdown += f"| `{field}` | {type_str} | {relations_str} | {description} | {examples} |\n"
            
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

def main():
    try:
        print("\n🔥 Démarrage de l'analyse de la base de données Firebase...")
        
        # Obtenir une connexion avec timeout
        try:
            db = firestore.client()
            print("✅ Connexion à Firestore établie avec succès")
        except Exception as e:
            print(f"\n❌ Erreur de connexion: {str(e)}")
            sys.exit(1)
        
        # Récupérer toutes les collections racines
        print("\n📚 Récupération des collections racines...")
        try:
            collections = list(db.collections())
            all_collections = collections  # Pour la détection des références

            print(f"📊 Nombre de collections trouvées: {len(collections)}")
        except Exception as e:
            print(f"❌ Erreur lors de la récupération des collections: {str(e)}")
            sys.exit(1)
        
        # Analyser chaque collection
        full_structure = {}
        processed_collections = set()
        
        for collection in collections:
            print(f"\n🔍 Analyse de la collection racine: {collection.id}")
            collection_structure = analyze_collection(collection, all_collections, processed_collections)
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