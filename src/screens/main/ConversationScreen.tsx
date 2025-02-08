import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ActionSheetIOS,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { theme } from '../../styles/theme';
import { useUserData } from '../../hooks/useUserData';
import { format, formatRelative } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Message, TextMessage, MissionMessage, NotificationMessage } from '../../types/messages';
import { BACKEND_URL } from '@env';
import { auth } from '../../config/firebase';
import { api } from '../../config/api';

export const ConversationScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { userData } = useUserData();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversation, setConversation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deletingMessageIds, setDeletingMessageIds] = useState<string[]>([]);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const conversationId = route.params?.conversationId;
    if (!conversationId) return;

    // Charger les détails de la conversation
    const conversationRef = doc(db, 'conversations', conversationId);
    getDoc(conversationRef).then(doc => {
      if (doc.exists()) {
        setConversation(doc.data());
      }
      setLoading(false);
    });

    // Écouter les messages
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        messagesData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
        } as Message);
      });
      setMessages(messagesData);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });

    return () => unsubscribe();
  }, [route.params?.conversationId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !userData?.uid || !route.params?.conversationId) return;

    try {
      const messageData = {
        type: 'user',
        content: newMessage.trim(),
        conversationId: route.params.conversationId,
      };

      await api.sendMessage(messageData);
      setNewMessage('');
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert(
        'Erreur',
        'Impossible d\'envoyer le message. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleMessageLongPress = (message: Message) => {
    const isOwnMessage = message.senderId === userData?.uid;
    
    if (!isOwnMessage) return; // Seuls nos propres messages peuvent être supprimés

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Annuler', 'Supprimer'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
          title: 'Message',
          message: 'Que souhaitez-vous faire ?'
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            await handleDeleteMessage(message);
          }
        }
      );
    } else {
      Alert.alert(
        'Message',
        'Que souhaitez-vous faire ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Supprimer', 
            style: 'destructive',
            onPress: () => handleDeleteMessage(message)
          }
        ]
      );
    }
  };

  const handleDeleteMessage = async (message: Message) => {
    try {
      setDeletingMessageIds(prev => [...prev, message.id]);
      await api.deleteMessage(route.params?.conversationId, message.id);
      console.log('✅ Message supprimé avec succès');
    } catch (error) {
      console.error('Error deleting message:', error);
      Alert.alert(
        'Erreur',
        'Impossible de supprimer le message. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    } finally {
      setDeletingMessageIds(prev => prev.filter(id => id !== message.id));
    }
  };

  const renderTextMessage = (message: TextMessage, isOwnMessage: boolean) => {
    if (deletingMessageIds.includes(message.id)) {
      return (
        <View style={[styles.messageContainer, isOwnMessage && styles.ownMessageContainer]}>
          <View style={[
            styles.messageBubble,
            styles.deletingMessageBubble,
            isOwnMessage ? styles.ownMessageBubble : 
            message.type === 'establishment' ? styles.establishmentMessageBubble : styles.userMessageBubble
          ]}>
            <ActivityIndicator size="small" color={isOwnMessage ? theme.colors.white : theme.colors.primary} />
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity 
        style={[styles.messageContainer, isOwnMessage && styles.ownMessageContainer]}
        onLongPress={() => handleMessageLongPress(message)}
        delayLongPress={500}
      >
        <View style={[
          styles.messageBubble, 
          isOwnMessage ? styles.ownMessageBubble : 
          message.type === 'establishment' ? styles.establishmentMessageBubble : styles.userMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : 
            message.type === 'establishment' ? styles.establishmentMessageText : styles.messageText
          ]}>
            {message.content}
          </Text>
          <Text style={[styles.messageTime, isOwnMessage && styles.ownMessageTime]}>
            {format(message.createdAt, 'HH:mm')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMissionMessage = (message: MissionMessage) => (
    <View style={styles.missionContainer}>
      <View style={styles.missionCard}>
        <View style={styles.missionHeader}>
          <Icon 
            name={
              message.action === 'proposal' ? 'calendar' :
              message.action === 'modification' ? 'create' :
              message.action === 'cancellation' ? 'close-circle' : 'checkmark-circle'
            } 
            size={24} 
            color={theme.colors.primary} 
          />
          <Text style={styles.missionTitle}>
            {message.action === 'proposal' ? 'Nouvelle mission' :
             message.action === 'modification' ? 'Modification de la mission' :
             message.action === 'cancellation' ? 'Annulation de la mission' : 'Confirmation de la mission'}
          </Text>
        </View>
        
        <View style={styles.missionDetails}>
          <Text style={styles.missionDetail}>Date: {message.details.date}</Text>
          <Text style={styles.missionDetail}>
            Horaires: {message.details.startTime} - {message.details.endTime}
          </Text>
          {message.details.specialtyName && (
            <Text style={styles.missionDetail}>
              Spécialité: {message.details.specialtyName}
            </Text>
          )}
          {message.details.hourlyRate && (
            <Text style={styles.missionDetail}>
              Taux horaire: {message.details.hourlyRate}€/h
            </Text>
          )}
        </View>

        {message.status === 'pending' && (
          <View style={styles.missionActions}>
            <TouchableOpacity style={styles.missionButton}>
              <Text style={styles.missionButtonText}>Accepter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.missionButton, styles.missionButtonRefuse]}>
              <Text style={[styles.missionButtonText, styles.missionButtonTextRefuse]}>
                Refuser
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.messageTime}>
          {format(message.createdAt, 'HH:mm')}
        </Text>
      </View>
    </View>
  );

  const renderNotificationMessage = (message: NotificationMessage) => (
    <View style={styles.notificationContainer}>
      <View style={[
        styles.notificationCard,
        styles[`notification${message.notificationType}` as keyof typeof styles]
      ]}>
        <Icon 
          name={
            message.notificationType === 'info' ? 'information-circle' :
            message.notificationType === 'warning' ? 'warning' :
            message.notificationType === 'success' ? 'checkmark-circle' : 'alert-circle'
          }
          size={24}
          color={
            message.notificationType === 'info' ? theme.colors.info :
            message.notificationType === 'warning' ? theme.colors.warning :
            message.notificationType === 'success' ? theme.colors.success : theme.colors.error
          }
        />
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{message.title}</Text>
          <Text style={styles.notificationText}>{message.content}</Text>
        </View>
        {message.action && (
          <TouchableOpacity 
            style={[
              styles.notificationAction,
              styles[`notificationAction${message.notificationType}` as keyof typeof styles]
            ]}
          >
            <Text style={styles.notificationActionText}>
              {message.action.label}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderId === userData?.uid;

    switch (item.type) {
      case 'user':
      case 'establishment':
        return renderTextMessage(item as TextMessage, isOwnMessage);
      case 'mission':
        return renderMissionMessage(item as MissionMessage);
      case 'notification':
        return renderNotificationMessage(item as NotificationMessage);
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerText}>{conversation?.establishmentName}</Text>
          <Text style={styles.headerSubtext}>
            {conversation?.status === 'active' ? 'En cours' : 
             conversation?.status === 'closed' ? 'Terminé' : 'Annulé'}
          </Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListHeaderComponent={() => conversation?.createdAt && (
          <View style={styles.conversationDateContainer}>
            <Text style={styles.conversationDate}>
              Conversation créée le {format(conversation.createdAt.toDate(), 'dd MMMM yyyy', { locale: fr })}
            </Text>
          </View>
        )}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Votre message..."
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        >
          <Icon 
            name="send" 
            size={24} 
            color={newMessage.trim() ? theme.colors.primary : theme.colors.gray[400]} 
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  headerTitle: {
    marginLeft: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  headerSubtext: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    flexDirection: 'row',
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
    backgroundColor: theme.colors.gray[100],
  },
  userMessageBubble: {
    backgroundColor: theme.colors.gray[100],
  },
  establishmentMessageBubble: {
    backgroundColor: `${theme.colors.primary}15`,
  },
  ownMessageBubble: {
    backgroundColor: theme.colors.primary,
  },
  messageText: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  establishmentMessageText: {
    color: theme.colors.primary,
  },
  ownMessageText: {
    color: theme.colors.white,
  },
  messageTime: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 4,
    textAlign: 'right',
  },
  ownMessageTime: {
    color: theme.colors.white + '80',
  },
  missionContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  missionCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 16,
    width: '90%',
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginLeft: 8,
  },
  missionDetails: {
    marginBottom: 16,
  },
  missionDetail: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  missionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  missionButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  missionButtonRefuse: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  missionButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  missionButtonTextRefuse: {
    color: theme.colors.primary,
  },
  notificationContainer: {
    marginVertical: 8,
    alignItems: 'center',
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    width: '90%',
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  notificationContent: {
    flex: 1,
    marginLeft: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  notificationText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  notificationAction: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  notificationActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  notificationinfo: {
    backgroundColor: `${theme.colors.info}10`,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.info,
  },
  notificationwarning: {
    backgroundColor: `${theme.colors.warning}10`,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning,
  },
  notificationsuccess: {
    backgroundColor: `${theme.colors.success}10`,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  notificationerror: {
    backgroundColor: `${theme.colors.error}10`,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  notificationActioninfo: {
    backgroundColor: `${theme.colors.info}15`,
  },
  notificationActionwarning: {
    backgroundColor: `${theme.colors.warning}15`,
  },
  notificationActionsuccess: {
    backgroundColor: `${theme.colors.success}15`,
  },
  notificationActionerror: {
    backgroundColor: `${theme.colors.error}15`,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.gray[100],
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  conversationDateContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  conversationDate: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  deletingMessageBubble: {
    minWidth: 50,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
  },
}); 