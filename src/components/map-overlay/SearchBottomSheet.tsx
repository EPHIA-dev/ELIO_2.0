import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useRef } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const navbarHeight = 49;
  const bottomSheetHeaderHeight = 80;

  const screenHeight = Dimensions.get("window").height;
  const mapOverlayHeaderHeight = insets.top + 60 + 40;
  const availableHeight = screenHeight - mapOverlayHeaderHeight - navbarHeight;

  const snapPoints = useMemo(
    () => [110, availableHeight],
    [availableHeight, bottomSheetHeaderHeight, navbarHeight]
  );

  const handleSheetChanges = useCallback(
    (index: number) => {
      console.log("Current sheet index:", index);
      onSheetChange?.(index);
    },
    [onSheetChange]
  );

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
        enableContentPanningGesture={true}
      >
        <BottomSheetView style={styles.contentContainer}>
          <SearchBottomContent />
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
  },
  backgroundFullScreen: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
});

export default SearchBottomSheet;
