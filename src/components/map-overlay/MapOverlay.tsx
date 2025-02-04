import React, { useCallback, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../../styles/theme";
import { MapOverlayHeader } from "./MapOverlayHeader";
import SearchBottomSheet from "./SearchBottomSheet";
import { useSearchOverlay } from '../../contexts/SearchOverlayContext';

interface MapOverlayProps {
  bottomSheetIndex: number;
  setBottomSheetIndex: (index: number) => void;
  onSearchPress: () => void;
}

export const MapOverlay: React.FC<MapOverlayProps> = ({
  bottomSheetIndex,
  setBottomSheetIndex,
  onSearchPress,
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { isSearching } = useSearchOverlay();

  const handleSheetChange = useCallback((index: number) => {
    setIsFullScreen(index === 2);
  }, []);

  if (isSearching) return null;

  return (
    <View style={styles.container}>
      <MapOverlayHeader 
        isFullScreen={isFullScreen}
        onSearchPress={onSearchPress}
      />
      {bottomSheetIndex === 1 && (
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => setBottomSheetIndex(0)}
        >
          <MaterialIcons name="map" size={24} color={theme.colors.white} />
        </TouchableOpacity>
      )}
      <SearchBottomSheet
        onSheetChange={handleSheetChange}
        isFullScreen={isFullScreen}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  headerSection: {
    width: '100%',
  },

  mapButton: {
    position: 'absolute',
    left: "50%",
    transform: [{ translateX: -24 }],
    bottom: 90,
    backgroundColor: theme.colors.primary,
    borderRadius: 30,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
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
