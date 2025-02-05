import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../../styles/theme";
import { useAuth } from '../../contexts/AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PersonalInfoStepProps {
  onUpdatePersonalInfo: (info: {
    firstName: string;
    lastName: string;
    birthDate: Date | null;
  }) => void;
  personalInfo: {
    firstName: string;
    lastName: string;
    birthDate: Date | null;
  };
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  onUpdatePersonalInfo,
  personalInfo,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      onUpdatePersonalInfo({
        ...personalInfo,
        birthDate: selectedDate
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Prénom</Text>
        <TextInput
          style={styles.input}
          value={personalInfo.firstName}
          onChangeText={(text) => 
            onUpdatePersonalInfo({
              ...personalInfo,
              firstName: text
            })
          }
          placeholder="Votre prénom"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nom</Text>
        <TextInput
          style={styles.input}
          value={personalInfo.lastName}
          onChangeText={(text) => 
            onUpdatePersonalInfo({
              ...personalInfo,
              lastName: text
            })
          }
          placeholder="Votre nom"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Date de naissance</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {personalInfo.birthDate
              ? format(personalInfo.birthDate, 'dd MMMM yyyy', { locale: fr })
              : "Sélectionner une date"}
          </Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={personalInfo.birthDate || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 16,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    fontSize: 16,
  },
  dateButton: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  dateButtonText: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
});
