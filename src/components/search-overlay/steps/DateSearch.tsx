import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../../styles/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DateSearchProps {
  selectedDates: { startDate: string; endDate: string } | null;
  onSelect: (dates: { startDate: string; endDate: string } | null) => void;
}

export const DateSearch: React.FC<DateSearchProps> = ({
  selectedDates,
  onSelect,
}) => {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [tempDates, setTempDates] = useState<{
    start: Date;
    end: Date;
  }>(() => {
    if (selectedDates) {
      return {
        start: new Date(selectedDates.startDate),
        end: new Date(selectedDates.endDate),
      };
    }
    const today = new Date();
    return {
      start: today,
      end: new Date(today.setDate(today.getDate() + 7)),
    };
  });

  const handleStartDateChange = (event: any, date?: Date) => {
    setShowStartPicker(false);
    if (date) {
      setTempDates(prev => {
        const newDates = {
          start: date,
          end: prev.end < date ? date : prev.end,
        };
        onSelect({
          startDate: format(newDates.start, 'yyyy-MM-dd'),
          endDate: format(newDates.end, 'yyyy-MM-dd'),
        });
        return newDates;
      });
    }
  };

  const handleEndDateChange = (event: any, date?: Date) => {
    setShowEndPicker(false);
    if (date) {
      setTempDates(prev => {
        const newDates = {
          start: prev.start,
          end: date < prev.start ? prev.start : date,
        };
        onSelect({
          startDate: format(newDates.start, 'yyyy-MM-dd'),
          endDate: format(newDates.end, 'yyyy-MM-dd'),
        });
        return newDates;
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.datePickersContainer}>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowStartPicker(true)}
        >
          <MaterialIcons name="calendar-today" size={24} color={theme.colors.primary} />
          <View style={styles.dateTextContainer}>
            <Text style={styles.dateLabel}>Date de début</Text>
            <Text style={styles.dateValue}>
              {format(tempDates.start, 'dd MMMM yyyy', { locale: fr })}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowEndPicker(true)}
        >
          <MaterialIcons name="calendar-today" size={24} color={theme.colors.primary} />
          <View style={styles.dateTextContainer}>
            <Text style={styles.dateLabel}>Date de fin</Text>
            <Text style={styles.dateValue}>
              {format(tempDates.end, 'dd MMMM yyyy', { locale: fr })}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {showStartPicker && (
        <DateTimePicker
          value={tempDates.start}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
          minimumDate={new Date()}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={tempDates.end}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
          minimumDate={tempDates.start}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
  },
  datePickersContainer: {
    gap: theme.spacing.md,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  dateTextContainer: {
    marginLeft: theme.spacing.md,
  },
  dateLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
}); 