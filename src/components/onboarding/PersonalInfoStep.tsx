import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import { theme } from "../../styles/theme";
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import WheelPicker from 'react-native-wheely';

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
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const [selectedYear, setSelectedYear] = useState(currentYear - 30);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);

  const handleDateConfirm = () => {
    const date = new Date(selectedYear, selectedMonth - 1, selectedDay);
    onUpdatePersonalInfo({
      ...personalInfo,
      birthDate: date
    });
    setShowDatePicker(false);
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

      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity 
                onPress={() => setShowDatePicker(false)}
                style={styles.pickerButton}
              >
                <Text style={styles.pickerButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleDateConfirm}
                style={styles.pickerButton}
              >
                <Text style={[styles.pickerButtonText, styles.confirmButton]}>Confirmer</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.wheelContainer}>
              <WheelPicker
                selectedIndex={days.indexOf(selectedDay)}
                options={days.map(String)}
                onChange={(index: number) => setSelectedDay(days[index])}
                containerStyle={styles.wheel}
              />
              <WheelPicker
                selectedIndex={months.indexOf(selectedMonth)}
                options={months.map(m => format(new Date(2000, m-1), 'MMMM', { locale: fr }))}
                onChange={(index: number) => setSelectedMonth(months[index])}
                containerStyle={styles.wheel}
              />
              <WheelPicker
                selectedIndex={years.indexOf(selectedYear)}
                options={years.map(String)}
                onChange={(index: number) => setSelectedYear(years[index])}
                containerStyle={styles.wheel}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

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
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  pickerButton: {
    padding: theme.spacing.sm,
  },
  pickerButtonText: {
    fontSize: 16,
    color: theme.colors.primary,
  },
  confirmButton: {
    fontWeight: 'bold',
  },
  wheelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
  },
  wheel: {
    flex: 1,
    height: 200,
  },
});
