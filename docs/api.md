# Documentation API ELIO

## Configuration

L'API utilise une URL de base qui varie selon l'environnement :
- En développement : `http://<ip-locale>:5000`
- En production : Définie par `BACKEND_URL` dans le fichier `.env`

Tous les appels (sauf `/ping`) nécessitent un token d'authentification Firebase dans le header :
```
Authorization: Bearer <firebase-token>
```

## Routes Disponibles

### Debug

#### GET /ping
Test de connectivité avec le backend.

**Réponse** :
```json
{
    "status": "success",
    "message": "Pong! Le serveur est en ligne",
    "timestamp": "2024-02-08T12:00:00.000Z"
}
```

### Utilisateurs

#### POST /create_user
Création d'un nouvel utilisateur.

**Corps de la requête** :
```typescript
{
    professionId?: string;
    specialtyIds?: string[];
    firstName?: string;
    lastName?: string;
    birthDate?: Date;
}
```

#### PUT /update_user/:userId
Mise à jour des informations d'un utilisateur.

**Paramètres URL** :
- `userId`: ID Firebase de l'utilisateur

**Corps de la requête** :
```typescript
{
    professionId?: string;
    specialtyIds?: string[];
    firstName?: string;
    lastName?: string;
    birthDate?: Date;
    isProfileComplete?: boolean;
}
```

### Recherche

#### POST /search_replacements
Recherche de remplacements disponibles.

**Corps de la requête** :
```typescript
{
    professionId: string;          // ID de la profession
    establishmentIds: string[];    // Liste des IDs d'établissements
    specialtyIds?: string[];       // Liste optionnelle des IDs de spécialités
    startDate?: string;           // Date de début (format ISO)
    endDate?: string;             // Date de fin (format ISO)
}
```

**Réponse** :
```typescript
Array<{
    id: string;
    establishmentId: string;
    startDate: string;
    endDate: string;
    specialtyId?: string;
    hourlyRate: number;
    status: 'open' | 'pending' | 'confirmed' | 'cancelled';
}>
```

### Messages

#### POST /send_message
Envoi d'un message dans une conversation.

**Corps de la requête** :
```typescript
{
    type: string;              // 'user' | 'establishment'
    content: string;           // Contenu du message
    conversationId: string;    // ID de la conversation
}
```

#### DELETE /delete_message/:conversationId/:messageId
Suppression d'un message.

**Paramètres URL** :
- `conversationId`: ID de la conversation
- `messageId`: ID du message à supprimer

## Gestion des Erreurs

Les erreurs sont retournées avec un code HTTP approprié et un corps JSON :
```json
{
    "error": "Description de l'erreur",
    "code": "ERROR_CODE",
    "details": {} // Détails optionnels
}
```

Codes d'erreur communs :
- 400: Requête invalide
- 401: Non authentifié
- 403: Non autorisé
- 404: Ressource non trouvée
- 500: Erreur serveur

## Utilisation dans le Code

L'API est accessible via le module `api.ts` qui fournit des fonctions typées :

```typescript
import { api } from '../config/api';

// Exemples d'utilisation
await api.ping();
await api.createUser(userData);
await api.updateUser(userId, updateData);
await api.searchReplacements(searchParams);
await api.sendMessage(messageData);
await api.deleteMessage(conversationId, messageId);
```

## Environnement de Développement

Pour tester l'API en développement :
1. Assurez-vous que le backend Flask tourne sur le port 5000
2. L'app Expo détectera automatiquement l'IP locale
3. Tous les appels sont loggés dans la console avec des émojis pour un debug facile
