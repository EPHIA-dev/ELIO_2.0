import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../../../styles/theme";

interface SearchCardProps {
  onPress?: () => void;
}

export const SearchCard: React.FC<SearchCardProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Trouvez vos remplas</Text>
          <Text style={styles.subtitle}>
            La première application dédiée aux{"\n"}remplacements médicaux
          </Text>
          <View style={styles.searchButton}>
            <Ionicons
              name="search"
              size={20}
              color={theme.colors.text.primary}
            />
            <Text style={styles.searchText}>Rechercher un remplacement</Text>
          </View>
        </View>
        <View style={styles.imageContainer}>
          <Image
            source={require("../../../../assets/images/doctor.png")}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    height: 180,
    overflow: "hidden",
  },
  content: {
    flex: 1,
    flexDirection: "row",
    padding: theme.spacing.lg,
  },
  textContainer: {
    flex: 1,
    justifyContent: "space-between",
    zIndex: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.white,
    opacity: 0.8,
    marginBottom: theme.spacing.md,
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    alignSelf: "flex-start",
  },
  searchText: {
    marginLeft: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  imageContainer: {
    position: "absolute",
    right: -20,
    bottom: 0,
    width: 170,
    height: 170,
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
