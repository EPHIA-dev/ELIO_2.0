import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { theme } from '../../../styles/theme';
import { format, addMonths, startOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DateSearchProps {
  selectedDates: { startDate: string; endDate: string } | null;
  onSelect: (dates: { startDate: string; endDate: string } | null) => void;
}

interface QuickSelect {
  label: string;
  days: number;
}

const quickSelects: QuickSelect[] = [
  { label: '+3 jours', days: 3 },
  { label: '+7 jours', days: 7 },
  { label: '+30 jours', days: 30 },
];

const MONTHS_TO_DISPLAY = 12;

export const DateSearch: React.FC<DateSearchProps> = ({
  selectedDates,
  onSelect,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectionMode, setSelectionMode] = useState<'start' | 'end'>('start');
  const [months] = useState(() => {
    const today = new Date();
    return Array.from({ length: MONTHS_TO_DISPLAY }, (_, i) => 
      startOfMonth(addMonths(today, i))
    );
  });

  const handleDayPress = (dateString: string) => {
    if (selectionMode === 'start') {
      // On commence une nouvelle sélection
      onSelect({
        startDate: dateString,
        endDate: dateString
      });
      setSelectionMode('end');
    } else {
      // On finalise la sélection
      if (!selectedDates) return;
      
      if (dateString < selectedDates.startDate) {
        // Si la date de fin est avant la date de début, on inverse
        onSelect({
          startDate: dateString,
          endDate: selectedDates.startDate
        });
      } else {
        onSelect({
          startDate: selectedDates.startDate,
          endDate: dateString
        });
      }
      setSelectionMode('start');
    }
  };

  const handleQuickSelect = (days: number) => {
    const startDate = format(new Date(), 'yyyy-MM-dd');
    const endDate = format(addDays(new Date(), days), 'yyyy-MM-dd');
    onSelect({ startDate, endDate });
    setSelectionMode('start');
  };

  const isDateSelected = (dateString: string) => {
    if (!selectedDates) return false;
    const date = new Date(dateString);
    return isWithinInterval(date, {
      start: new Date(selectedDates.startDate),
      end: new Date(selectedDates.endDate)
    });
  };

  const isStartDate = (dateString: string) => 
    selectedDates?.startDate === dateString;

  const isEndDate = (dateString: string) => 
    selectedDates?.endDate === dateString;

  const renderMonth = (month: Date) => {
    const days = eachDayOfInterval({
      start: month,
      end: addMonths(month, 1)
    });

    const weeks = [];
    let currentWeek: (Date | null)[] = [];

    // Ajouter des jours vides au début si nécessaire
    const firstDay = days[0].getDay();
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null);
    }

    days.forEach(day => {
      if (!isSameMonth(day, month)) return;
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    });

    // Compléter la dernière semaine si nécessaire
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);

    return (
      <View key={format(month, 'yyyy-MM')} style={styles.month}>
        <Text style={styles.monthTitle}>
          {format(month, 'MMMM yyyy', { locale: fr })}
        </Text>
        <View style={styles.weekDays}>
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
            <Text key={i} style={styles.weekDay}>{day}</Text>
          ))}
        </View>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.week}>
            {week.map((day, dayIndex) => {
              if (!day) return <View key={dayIndex} style={styles.emptyDay} />;
              
              const dateString = format(day, 'yyyy-MM-dd');
              const isSelected = isDateSelected(dateString);
              const isStart = isStartDate(dateString);
              const isEnd = isEndDate(dateString);
              const isToday = isSameDay(day, new Date());
              const isPast = day.getTime() < new Date().getTime();

              return (
                <TouchableOpacity
                  key={dayIndex}
                  style={[
                    styles.day,
                    isSelected && styles.selectedDay,
                    isStart && styles.startDay,
                    isEnd && styles.endDay,
                    isSelected && !isStart && !isEnd && styles.inRangeDay,
                    isPast && styles.pastDay
                  ]}
                  onPress={() => !isPast && handleDayPress(dateString)}
                  disabled={isPast}
                >
                  <Text style={[
                    styles.dayText,
                    (isStart || isEnd) && styles.selectedDayText,
                    isSelected && !isStart && !isEnd && styles.inRangeDayText,
                    isToday && styles.todayText,
                    isPast && styles.pastDayText
                  ]}>
                    {format(day, 'd')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.calendarContainer}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          <View style={styles.monthsContainer}>
            {months.map(renderMonth)}
          </View>
        </ScrollView>
      </View>

      <View style={styles.quickSelectWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickSelectContainer}
        >
          {quickSelects.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickSelectButton}
              onPress={() => handleQuickSelect(item.days)}
            >
              <Text style={styles.quickSelectText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    flexDirection: 'column',
  },
  calendarContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  monthsContainer: {
    flex: 1,
  },
  quickSelectWrapper: {
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  month: {
    padding: theme.spacing.sm,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textTransform: 'capitalize',
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.xs,
  },
  weekDay: {
    width: 32,
    textAlign: 'center',
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  week: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 2,
  },
  day: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyDay: {
    width: 32,
    height: 32,
  },
  dayText: {
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  selectedDay: {
    backgroundColor: 'transparent',
  },
  startDay: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  endDay: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  inRangeDay: {
    backgroundColor: `${theme.colors.primary}30`,
    borderRadius: 0,
  },
  todayText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  pastDay: {
    opacity: 0.5,
  },
  pastDayText: {
    color: theme.colors.text.secondary,
  },
  quickSelectContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
    flexDirection: 'row',
  },
  quickSelectButton: {
    backgroundColor: `${theme.colors.primary}15`,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  quickSelectText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  selectedDayText: {
    color: theme.colors.white,
    fontWeight: '500',
  },
  inRangeDayText: {
    color: theme.colors.text.primary,
  },
}); 