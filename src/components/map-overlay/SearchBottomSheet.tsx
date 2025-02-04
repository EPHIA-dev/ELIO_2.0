import { MaterialIcons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../../styles/theme";
import { SearchBottomContent } from "./SearchBottomContent";
import SearchBottomSheetHeader from "./SearchBottomSheetHeader";

interface SearchBottomSheetProps {
  onSheetChange?: (index: number) => void;
  isFullScreen: boolean;
}

const SearchBottomSheet: React.FC<SearchBottomSheetProps> = ({
  onSheetChange,
  isFullScreen,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  
  // Snappoints relatifs à la section bottomSheet
  const snapPoints = useMemo(() => ["45%", "100%"], []);

  const handleSheetChanges = useCallback(
    (index: number) => {
      onSheetChange?.(index);
    },
    [onSheetChange]
  );

  const handleMapPress = useCallback(() => {
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  const renderHeader = useCallback(
    () => <SearchBottomSheetHeader isFullScreen={isFullScreen} />,
    [isFullScreen]
  );

  return (
    <View style={styles.container}>
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backgroundStyle={[
          styles.background,
          isFullScreen && styles.backgroundFullScreen,
        ]}
        handleComponent={renderHeader}
        enablePanDownToClose={false}
        enableOverDrag={false}
      >
        <BottomSheetView style={styles.contentContainer}>
          <SearchBottomContent />
          {isFullScreen && (
            <TouchableOpacity
              style={styles.mapButton}
              onPress={handleMapPress}
            >
              <MaterialIcons 
                name="map" 
                size={24} 
                color={theme.colors.white} 
                style={styles.mapIcon}
              />
              <Text style={styles.mapButtonText}>Carte</Text>
            </TouchableOpacity>
          )}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  background: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    minHeight: 0,
  },
  backgroundFullScreen: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  mapButton: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    borderRadius: 50,
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mapIcon: {
    marginRight: theme.spacing.xs,
    transform: [{ scale: 0.9 }],
  },
  mapButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },

});

export default SearchBottomSheet;
