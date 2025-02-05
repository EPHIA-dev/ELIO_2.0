import { Timestamp } from 'firebase/firestore';

/**
 * Message de base avec les champs communs à tous les types de messages
 */
export interface BaseMessage {
  id: string;
  conversationId: string;
  createdAt: Timestamp;
  senderId: string;
  readBy: string[];  // Liste des IDs des utilisateurs qui ont lu le message
  type: 'user' | 'establishment' | 'mission' | 'notification';
}

/**
 * Message texte standard envoyé par un utilisateur ou un établissement
 */
export interface TextMessage extends BaseMessage {
  type: 'user' | 'establishment';
  content: string;
  attachments?: {
    type: 'image' | 'document' | 'pdf';
    url: string;
    name: string;
    size?: number;
    mimeType?: string;
  }[];
}

/**
 * Message spécifique pour les propositions/modifications de mission
 */
export interface MissionMessage extends BaseMessage {
  type: 'mission';
  action: 'proposal' | 'modification' | 'cancellation' | 'confirmation';
  missionId: string;
  status: 'pending' | 'accepted' | 'refused';
  details: {
    date: string;
    startTime: string;
    endTime: string;
    establishmentId: string;
    establishmentName: string;
    specialtyId?: string;
    specialtyName?: string;
    hourlyRate?: number;
    notes?: string;
  };
}

/**
 * Message système pour les notifications importantes
 */
export interface NotificationMessage extends BaseMessage {
  type: 'notification';
  notificationType: 'info' | 'warning' | 'success' | 'error';
  title: string;
  content: string;
  action?: {
    type: 'link' | 'button';
    label: string;
    data: any;
  };
}

/**
 * Union type de tous les types de messages possibles
 */
export type Message = TextMessage | MissionMessage | NotificationMessage;

/**
 * Structure Firestore pour la collection messages
 * Path: conversations/{conversationId}/messages/{messageId}
 */
export interface MessageDocument {
  // Champs communs
  senderId: string;
  createdAt: Timestamp;
  readBy: string[];
  type: Message['type'];

  // Champs spécifiques au type de message
  content?: string;
  attachments?: TextMessage['attachments'];
  action?: MissionMessage['action'];
  missionId?: string;
  status?: MissionMessage['status'];
  details?: MissionMessage['details'];
  notificationType?: NotificationMessage['notificationType'];
  title?: string;
  actionData?: NotificationMessage['action'];
} 