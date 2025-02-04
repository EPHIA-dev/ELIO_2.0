import React, { useRef, useState } from "react";
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

interface Conversation {
  id: string;
  name: string;
  message: string;
  date: string;
  time: string;
  day: string;
  status: "accepted" | "pending" | "refused";
  image: any; // Using any for now as it's a require() image
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    name: "Hôpital Saint-Joseph",
    message: "Votre demande a été refusée.",
    date: "18 janvier 2024",
    time: "17h à 1h",
    day: "jeudi",
    status: "refused",
    image: require("../../../assets/images/hospitals/saint-joseph.jpg"),
  },
  {
    id: "2",
    name: "Hôpital de la Conception",
    message: "Votre demande a été acceptée.",
    date: "18 janvier 2024",
    time: "16h à 0h",
    day: "jeudi",
    status: "accepted",
    image: require("../../../assets/images/hospitals/conception.jpg"),
  },
  {
    id: "3",
    name: "Hôpital de la Conception",
    message: "D'accord, je vous confirme ma venue pour le remplacement.",
    date: "15 janvier 2024",
    time: "15h à 23h",
    day: "lundi",
    status: "accepted",
    image: require("../../../assets/images/hospitals/conception.jpg"),
  },
  {
    id: "4",
    name: "Hôpital de la Timone",
    message: "Nous étudions votre candidature.",
    date: "14 janvier 2024",
    time: "17h à 1h",
    day: "dimanche",
    status: "pending",
    image: require("../../../assets/images/hospitals/timone.jpg"),
  },
];

type TabType = "all" | "accepted" | "pending" | "refused";

export const ConversationsScreen = () => {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchAnimation = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef<TextInput>(null);

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

  const filteredConversations = mockConversations.filter((conv) => {
    const matchesSearch = searchQuery
      ? conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.message.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    if (!matchesSearch) return false;

    if (!isSearching) {
      if (activeTab === "all") return true;
      if (activeTab === "accepted") return conv.status === "accepted";
      if (activeTab === "pending") return conv.status === "pending";
      if (activeTab === "refused") return conv.status === "refused";
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
      case "accepted":
        return "#4CAF50";
      case "refused":
        return "#F44336";
      case "pending":
        return "#FFC107";
      default:
        return "#4CAF50";
    }
  };

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity style={styles.conversationItem}>
      <View style={styles.avatarContainer}>
        <Image source={item.image} style={styles.avatar} />
        <View
          style={[
            styles.statusDot,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        />
      </View>
      <View style={styles.conversationContent}>
        <Text style={styles.hospitalName}>{item.name}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.dateTime}>
          {item.date} - {item.time} - {item.day}
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
          {renderTab("Tous", "all")}
          {renderTab("Acceptées", "accepted")}
          {renderTab("En attente", "pending")}
          {renderTab("Refusées", "refused")}
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
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
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
