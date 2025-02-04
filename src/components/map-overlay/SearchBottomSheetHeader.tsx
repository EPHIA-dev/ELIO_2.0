import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { theme } from "../../styles/theme";

interface SearchBottomSheetHeaderProps {
  isFullScreen: boolean;
}

const SearchBottomSheetHeader: React.FC<SearchBottomSheetHeaderProps> = ({
  isFullScreen,
}) => {
  const handleInfoPress = () => {
    console.log("Info pressed");
  };

  return (
    <View style={[styles.header, !isFullScreen && styles.headerRounded]}>
      <View style={styles.indicator} />
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Remplacements</Text>
        </View>
        <TouchableOpacity onPress={handleInfoPress} style={styles.infoButton}>
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={theme.colors.gray[500]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.white,
    paddingTop: 8,
    overflow: "hidden",
  },
  headerRounded: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  indicator: {
    width: 36,
    height: 4,
    backgroundColor: theme.colors.gray[300],
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.gray[900],
  },
  infoButton: {
    padding: 4,
  },
});

export default SearchBottomSheetHeader;
