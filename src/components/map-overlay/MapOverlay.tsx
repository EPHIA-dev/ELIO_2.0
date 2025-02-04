import { MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../styles/theme";
import { MapOverlayHeader } from "./MapOverlayHeader";
import SearchBottomSheet from "./SearchBottomSheet";

interface MapOverlayProps {
  bottomSheetIndex: number;
  setBottomSheetIndex: (index: number) => void;
}

export const MapOverlay: React.FC<MapOverlayProps> = ({
  bottomSheetIndex,
  setBottomSheetIndex,
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get("window").height;
  const navbarHeight = 63;

  const handleSheetChange = useCallback((index: number) => {
    setIsFullScreen(index === 2);
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          height: screenHeight - navbarHeight,
        },
      ]}
      pointerEvents="box-none"
    >
      {bottomSheetIndex === 2 && (
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => setBottomSheetIndex(1)}
        >
          <MaterialIcons name="map" size={24} color={theme.colors.white} />
        </TouchableOpacity>
      )}
      <MapOverlayHeader isFullScreen={isFullScreen} />
      <SearchBottomSheet
        onSheetChange={handleSheetChange}
        isFullScreen={isFullScreen}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 1,
  },
  handle: {
    paddingVertical: 10,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  background: {
    backgroundColor: theme.colors.white,
  },
  indicator: {
    backgroundColor: theme.colors.gray[300],
    width: 50,
    height: 4,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: theme.colors.white,
  },
  text: {
    fontSize: 20,
    color: theme.colors.black,
    fontWeight: "500",
    marginTop: theme.spacing.md,
  },
  mapButton: {
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -24 }],
    bottom: 90,
    backgroundColor: theme.colors.primary,
    borderRadius: 30,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
