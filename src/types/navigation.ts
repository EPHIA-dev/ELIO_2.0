export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type ConversationsStackParamList = {
  ConversationsList: undefined;
  Conversation: {
    conversationId: string;
  };
};

export type MainStackParamList = {
  Home: undefined;
  Calendar: undefined;
  Search: undefined;
  Conversations: undefined;
  Profile: undefined;
};
