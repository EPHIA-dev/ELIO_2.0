import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../../styles/theme";

interface HomeHeaderProps {
  userName: string;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ userName }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleChatPress = () => {
    navigation.navigate("Conversations");
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: theme.colors.white,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <View style={styles.iconContainer}>
            <View style={styles.icon} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Bonjour, {userName}</Text>
            <Text style={styles.subtitle}>Content de vous revoir !</Text>
          </View>
          <TouchableOpacity
            style={styles.rightContainer}
            onPress={handleChatPress}
          >
            <View style={styles.notificationDot} />
            <Ionicons
              name="chatbubble-outline"
              size={24}
              color={theme.colors.text.secondary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  content: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: theme.spacing.sm,
  },
  icon: {
    width: 38,
    height: 38,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  rightContainer: {
    padding: theme.spacing.sm,
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    backgroundColor: "#FF3B30",
    borderRadius: 4,
    zIndex: 1,
  },
});
