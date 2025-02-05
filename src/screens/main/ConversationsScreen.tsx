import React, { useRef, useState, useEffect } from "react";
import {
  Animated,
  FlatList,
  Image,
  Keyboard,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { collection, query, where, orderBy, onSnapshot, getDoc, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useUserData } from '../../hooks/useUserData';
import { theme } from '../../styles/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ConversationsStackParamList } from '../../types/navigation';

interface Conversation {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessage: {
    content: string;
    senderId: string;
    timestamp: Date;
  };
  participants: string[];
  replacementId: string;
  status: 'active' | 'closed' | 'cancelled';
  replacement: {
    establishmentId: string;
    establishmentName?: string;
    date: string;
    startTime: string;
    endTime: string;
    status: "accepted" | "pending" | "refused";
  };
}

type TabType = "active" | "closed" | "cancelled";

type ConversationsScreenNavigationProp = NativeStackNavigationProp<ConversationsStackParamList, 'ConversationsList'>;

export const ConversationsScreen = () => {
  const { userData } = useUserData();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchAnimation = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef<TextInput>(null);
  const navigation = useNavigation<ConversationsScreenNavigationProp>();

  useEffect(() => {
    if (!userData?.uid) return;

    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userData.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const conversationsData: Conversation[] = [];
      
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        
        try {
          const establishmentRef = doc(db, 'establishments', data.establishmentId);
          const establishmentDoc = await getDoc(establishmentRef);
          const establishmentName = establishmentDoc.data()?.name;

          conversationsData.push({
            id: docSnapshot.id,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            lastMessage: {
              content: data.lastMessage.content,
              senderId: data.lastMessage.senderId,
              timestamp: data.lastMessage.timestamp.toDate(),
            },
            participants: data.participants,
            replacementId: data.replacementId,
            status: data.status,
            replacement: {
              establishmentId: data.establishmentId,
              establishmentName,
              date: data.date,
              startTime: data.startTime,
              endTime: data.endTime,
              status: data.status
            }
          });
        } catch (error) {
          console.error('Error fetching conversation data:', error);
        }
      }
      
      conversationsData.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      
      setConversations(conversationsData);
    });

    return () => unsubscribe();
  }, [userData?.uid, activeTab]);

  const startSearch = () => {
    setIsSearching(true);
    Animated.spring(searchAnimation, {
      toValue: 1,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start(() => {
      searchInputRef.current?.focus();
    });
  };

  const closeSearch = () => {
    Keyboard.dismiss();
    Animated.spring(searchAnimation, {
      toValue: 0,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start(() => {
      setIsSearching(false);
      setSearchQuery("");
    });
  };

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = searchQuery
      ? conv.replacement.establishmentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    if (!matchesSearch) return false;

    if (!isSearching) {
      if (activeTab === "active") return true;
      if (activeTab === "closed") return conv.status === "closed";
      if (activeTab === "cancelled") return conv.status === "cancelled";
    }

    return true;
  });

  const renderTab = (title: string, tab: TabType) => (
    <TouchableOpacity
      style={[styles.tab, activeTab === tab && styles.activeTab]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#4CAF50";
      case "closed":
        return "#9E9E9E";
      case "cancelled":
        return "#F44336";
      default:
        return "#4CAF50";
    }
  };

  const formatDate = (date: Date) => {
    return format(date, 'dd MMMM yyyy', { locale: fr });
  };

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity 
      style={styles.conversationItem}
      onPress={() => navigation.navigate('Conversation', { conversationId: item.id })}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatarPlaceholder}>
          <Icon name="image-outline" size={24} color={theme.colors.gray[400]} />
        </View>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        />
      </View>
      <View style={styles.conversationContent}>
        <Text style={styles.hospitalName}>{item.replacement.establishmentName}</Text>
        <Text style={styles.message}>{item.lastMessage.content}</Text>
        <Text style={styles.dateTime}>
          {formatDate(item.lastMessage.timestamp)} - {item.replacement.startTime} à {item.replacement.endTime}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const headerWidth = searchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["85%", "0%"],
  });

  const searchWidth = searchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["15%", "100%"],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Animated.View style={[styles.titleContainer, { width: headerWidth }]}>
          <Text style={styles.title}>Messages</Text>
        </Animated.View>
        <Animated.View style={[styles.searchContainer, { width: searchWidth }]}>
          {isSearching ? (
            <View style={styles.searchInputContainer}>
              <Icon
                name="search"
                size={20}
                color="#666"
                style={styles.searchIcon}
              />
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder="Rechercher..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity
                onPress={closeSearch}
                style={styles.closeButton}
              >
                <Icon name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.searchButton} onPress={startSearch}>
              <Icon name="search" size={24} color="#000" />
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>

      {!isSearching && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContentContainer}
          style={styles.tabsContainer}
        >
          {renderTab("En cours", "active")}
          {renderTab("Terminés", "closed")}
          {renderTab("Annulés", "cancelled")}
        </ScrollView>
      )}

      <FlatList
        data={filteredConversations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          isSearching && styles.listContainerSearching,
        ]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
  },
  searchButton: {
    padding: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  tabsContainer: {
    flexGrow: 0,
  },
  tabsContentContainer: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginBottom: 5,
  },
  tab: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#6200EE",
  },
  tabText: {
    color: "#666",
    fontSize: 14,
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "500",
  },
  listContainer: {
    paddingHorizontal: 15,
    flexGrow: 0,
    marginTop: -5,
  },
  conversationItem: {
    flexDirection: "row",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 15,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },
  conversationContent: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
  },
  message: {
    fontSize: 15,
    color: "#666",
    marginBottom: 4,
  },
  dateTime: {
    fontSize: 13,
    color: "#999",
  },
  titleContainer: {
    overflow: "hidden",
  },
  searchContainer: {
    height: 40,
    minWidth: 40,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#000",
  },
  listContainerSearching: {
    paddingTop: 10,
  },
  closeButton: {
    padding: 8,
  },
});
