import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../../styles/theme";

interface ProfileHeaderProps {
  rightComponent?: React.ReactNode;
  title?: string;
  subtitle?: string;
  showChevron?: boolean;
  onRightPress?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  rightComponent,
  title,
  subtitle,
  showChevron = false,
  onRightPress,
}) => {
  const insets = useSafeAreaInsets();

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
        {title && (
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              <View style={styles.icon} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{title}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
            {(showChevron || rightComponent) && (
              <TouchableOpacity
                style={styles.rightContainer}
                onPress={onRightPress}
              >
                {rightComponent || (
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color={theme.colors.text.secondary}
                  />
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
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
    paddingVertical: theme.spacing.xs,
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
  },
});
