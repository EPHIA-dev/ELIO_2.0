import { Timestamp } from "firebase/firestore";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../../styles/theme";

interface ReplacementCardProps {
  replacement: {
    description: string;
    name: string;
    startDate: Timestamp;
    endDate: Timestamp;
    periods: string[];
    rate: {
      amount: number;
      currency: string;
      period: string;
    };
  };
  onPress?: () => void;
}

export const ReplacementCard: React.FC<ReplacementCardProps> = ({
  replacement,
  onPress,
}) => {
  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    const day = date.getDate();
    const month = date
      .toLocaleString("fr-FR", { month: "short" })
      .replace(".", "");
    return `${day} ${month}. ${date.getFullYear()}`;
  };

  const calculateDuration = (startDate: Timestamp, endDate: Timestamp) => {
    if (!startDate || !endDate) return "";
    const start = startDate.toDate();
    const end = endDate.toDate();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    return `${diffHours}h`;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        <View style={styles.imagePlaceholder} />
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>
            {formatDate(replacement.startDate)}
          </Text>
        </View>
        <View style={styles.priceContainer}>
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>{replacement.rate.amount}€</Text>
          </View>
          <View style={styles.durationTag}>
            <Text style={styles.durationText}>
              {calculateDuration(replacement.startDate, replacement.endDate)}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {replacement.name}
        </Text>
        <Text style={styles.date}>{formatDate(replacement.endDate)}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tagsContainer}>
            {replacement.periods.map((period, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{period}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: theme.spacing.sm,
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  imageContainer: {
    position: "relative",
    height: 75,
  },
  imagePlaceholder: {
    backgroundColor: theme.colors.gray[200],
    width: "100%",
    height: "100%",
  },
  dateContainer: {
    position: "absolute",
    top: theme.spacing.xs,
    left: theme.spacing.xs,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    borderRadius: 20,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
  },
  dateText: {
    color: theme.colors.white,
    fontSize: 12,
  },
  priceContainer: {
    position: "absolute",
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  priceTag: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
  },
  priceText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  durationTag: {
    backgroundColor: `${theme.colors.primary}20`,
    borderRadius: 8,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
  },
  durationText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    padding: theme.spacing.md,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.gray[900],
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: theme.colors.gray[500],
    marginBottom: theme.spacing.sm,
  },
  tagsContainer: {
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  tag: {
    backgroundColor: `${theme.colors.primary}20`,
    borderRadius: 20,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
  },
  tagText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "500",
  },
});
