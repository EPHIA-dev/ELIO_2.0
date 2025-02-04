import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Timestamp } from "firebase/firestore";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { theme } from "../../styles/theme";

interface PersonalInfoStepProps {
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    birthDate: Timestamp;
  }) => void;
  initialValues?: {
    firstName?: string;
    lastName?: string;
    birthDate?: Timestamp;
  };
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  onSubmit,
  initialValues = {},
}) => {
  const [firstName, setFirstName] = useState(initialValues.firstName || "");
  const [lastName, setLastName] = useState(initialValues.lastName || "");
  const [birthDate, setBirthDate] = useState<Date>(
    initialValues.birthDate ? initialValues.birthDate.toDate() : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setBirthDate(selectedDate);
      onSubmit({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        birthDate: Timestamp.fromDate(selectedDate),
      });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleInputChange = (
    field: "firstName" | "lastName",
    value: string
  ) => {
    if (field === "firstName") {
      setFirstName(value);
    } else {
      setLastName(value);
    }

    if (value.trim() && (field === "firstName" ? lastName : firstName).trim()) {
      onSubmit({
        firstName: field === "firstName" ? value : firstName,
        lastName: field === "lastName" ? value : lastName,
        birthDate: Timestamp.fromDate(birthDate),
      });
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity
        style={[styles.inputCard, firstName.trim() && styles.inputCardSelected]}
      >
        <TextInput
          style={styles.input}
          placeholder="Prénom"
          value={firstName}
          onChangeText={(value) => handleInputChange("firstName", value)}
          autoCapitalize="words"
          autoComplete="given-name"
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.inputCard, lastName.trim() && styles.inputCardSelected]}
      >
        <TextInput
          style={styles.input}
          placeholder="Nom"
          value={lastName}
          onChangeText={(value) => handleInputChange("lastName", value)}
          autoCapitalize="words"
          autoComplete="family-name"
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.inputCard, styles.dateCard]}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateText}>{formatDate(birthDate)}</Text>
        <Ionicons
          name="calendar-outline"
          size={24}
          color={theme.colors.text.secondary}
        />
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={birthDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  inputCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  inputCardSelected: {
    backgroundColor: `${theme.colors.primary}10`,
    borderColor: theme.colors.primary,
  },
  input: {
    fontSize: 16,
    color: theme.colors.text.primary,
    padding: 0,
  },
  dateCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
});
