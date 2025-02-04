import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import { theme } from "../styles/theme";

// Import des icônes actives
import CalendarActive from "../../assets/icons/calendar-active.svg";
import ChatActive from "../../assets/icons/chat-active.svg";
import HomeActive from "../../assets/icons/home-active.svg";
import ProfileActive from "../../assets/icons/profile-active.svg";
import SearchActive from "../../assets/icons/search-active.svg";

// Import des icônes inactives
import Calendar from "../../assets/icons/calendar.svg";
import Chat from "../../assets/icons/chat.svg";
import Home from "../../assets/icons/home.svg";
import Profile from "../../assets/icons/profile.svg";
import Search from "../../assets/icons/search.svg";

const ICON_SIZE = 64;
const GAP = theme.spacing.xs;

const TabIcon = ({ route, isFocused }: { route: any; isFocused: boolean }) => {
  const scaleAnim = useRef(new Animated.Value(isFocused ? 1.1 : 1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isFocused ? 1.05 : 1,
      useNativeDriver: true,
      tension: 65,
      friction: 8,
    }).start();
  }, [isFocused]);

  const isSearch = route.name === "Search";
  const baseIconSize = 24;
  const iconSize = isSearch ? baseIconSize * 1.3 : baseIconSize;

  let Icon;
  switch (route.name) {
    case "Home":
      Icon = isFocused ? HomeActive : Home;
      break;
    case "Calendar":
      Icon = isFocused ? CalendarActive : Calendar;
      break;
    case "Search":
      Icon = isFocused ? SearchActive : Search;
      break;
    case "Conversations":
      Icon = isFocused ? ChatActive : Chat;
      break;
    case "Profile":
      Icon = isFocused ? ProfileActive : Profile;
      break;
    default:
      return null;
  }

  return (
    <Animated.View
      style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}
    >
      <Icon width={iconSize} height={iconSize} />
    </Animated.View>
  );
};

interface CustomNavbarProps extends BottomTabBarProps {
  isVisible?: boolean;
}

export const CustomNavbar = ({
  state,
  descriptors,
  navigation,
  isVisible = true,
}: CustomNavbarProps) => {
  console.log('CustomNavbar - isVisible:', isVisible);

  if (!isVisible) {
    console.log('CustomNavbar - returning null');
    return null;
  }

  const translateX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const isSearchPage = state.routes[state.index].name === "Search";
  const prevIsSearchPage = useRef(isSearchPage);

  useEffect(() => {
    const isMovingToSearch = !prevIsSearchPage.current && isSearchPage;
    const isLeavingSearch = prevIsSearchPage.current && !isSearchPage;

    Animated.spring(translateX, {
      toValue: state.index * (ICON_SIZE + GAP),
      useNativeDriver: true,
      tension: 65,
      friction: 8,
    }).start();

    if (isMovingToSearch) {
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }).start();
      }, 100);
    } else if (isLeavingSearch) {
      fadeAnim.setValue(1);
    }

    prevIsSearchPage.current = isSearchPage;
  }, [state.index, isSearchPage]);

  return (
    <View style={[styles.container, isSearchPage && styles.searchContainer]}>
      <View
        style={[
          styles.navbarWrapper,
          isSearchPage && styles.searchNavbarWrapper,
        ]}
      >
        <View style={[styles.navbar, isSearchPage && styles.searchNavbar]}>
          <Animated.View
            style={[
              styles.activeBackground,
              {
                transform: [{ translateX }],
                opacity: fadeAnim,
              },
            ]}
          />
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.tab}
              >
                <TabIcon route={route} isFocused={isFocused} />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 28,
    backgroundColor: "transparent",
    alignItems: "center",
    zIndex: 999,
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  searchContainer: {
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    paddingHorizontal: 0,
    paddingVertical: 0,
    shadowColor: "transparent",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  navbarWrapper: {
    width: "100%",
    alignItems: "center",
  },
  searchNavbarWrapper: {
    backgroundColor: theme.colors.white,
  },
  navbar: {
    flexDirection: "row",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: GAP,
    gap: GAP,
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    position: "relative",
  },
  searchNavbar: {
    backgroundColor: "transparent",
    shadowColor: "transparent",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  activeBackground: {
    position: "absolute",
    width: ICON_SIZE,
    height: ICON_SIZE,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    top: GAP,
    left: GAP,
  },
  tab: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  iconContainer: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.lg,
    backgroundColor: "transparent",
  },
});
