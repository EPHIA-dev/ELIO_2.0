import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Calendar, CalendarList } from 'react-native-calendars';
import { theme } from '../../../styles/theme';

interface DateSearchProps {
  onNext: (dates: { startDate: string; endDate: string } | null) => void;
  isActive: boolean;
}

interface MarkedDates {
  [date: string]: {
    startingDay?: boolean;
    endingDay?: boolean;
    color?: string;
    textColor?: string;
    selected?: boolean;
    marked?: boolean;
  };
}

export const DateSearch: React.FC<DateSearchProps> = ({
  onNext,
  isActive,
}) => {
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null);
  const screenWidth = Dimensions.get('window').width;
  const calendarWidth = screenWidth - (theme.spacing.md * 4);

  useEffect(() => {
    if (selectedStartDate && selectedEndDate) {
      onNext({
        startDate: selectedStartDate,
        endDate: selectedEndDate,
      });
    } else {
      onNext(null);
    }
  }, [selectedStartDate, selectedEndDate]);

  if (!isActive) return null;

  const getMarkedDates = (): MarkedDates => {
    if (!selectedStartDate) return {};
    
    const markedDates: MarkedDates = {};
    
    if (selectedStartDate) {
      markedDates[selectedStartDate] = {
        startingDay: true,
        color: theme.colors.primary,
        textColor: theme.colors.white,
      };
    }

    if (selectedEndDate) {
      markedDates[selectedEndDate] = {
        endingDay: true,
        color: theme.colors.primary,
        textColor: theme.colors.white,
      };

      // Marquer les dates entre le début et la fin
      if (selectedStartDate) {
        let currentDate = new Date(selectedStartDate);
        const endDate = new Date(selectedEndDate);
        
        while (currentDate < endDate) {
          currentDate.setDate(currentDate.getDate() + 1);
          const dateString = currentDate.toISOString().split('T')[0];
          
          if (dateString !== selectedEndDate) {
            markedDates[dateString] = {
              color: `${theme.colors.primary}20`,
              textColor: theme.colors.text.primary,
            };
          }
        }
      }
    }

    return markedDates;
  };

  return (
    <View style={styles.container}>
      <CalendarList
        horizontal={true}
        pagingEnabled={true}
        calendarWidth={calendarWidth}
        pastScrollRange={0}
        futureScrollRange={12}
        scrollEnabled={true}
        showScrollIndicator={false}
        minDate={new Date().toISOString().split('T')[0]}
        markingType={'period'}
        markedDates={getMarkedDates()}
        onDayPress={(day) => {
          if (!selectedStartDate || selectedEndDate) {
            setSelectedStartDate(day.dateString);
            setSelectedEndDate(null);
          } else {
            if (new Date(day.dateString) < new Date(selectedStartDate)) {
              setSelectedStartDate(day.dateString);
            } else {
              setSelectedEndDate(day.dateString);
            }
          }
        }}
        theme={{
          calendarBackground: 'transparent',
          textSectionTitleColor: theme.colors.text.primary,
          selectedDayBackgroundColor: theme.colors.primary,
          selectedDayTextColor: theme.colors.white,
          todayTextColor: theme.colors.primary,
          dayTextColor: theme.colors.text.primary,
          textDisabledColor: theme.colors.gray[300],
          monthTextColor: theme.colors.text.primary,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
  },
}); 