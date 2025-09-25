import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { MonthlyCalendarData, CalendarDay, MonthlyStats } from '../types';
import { localStorageService } from '../services/localStorage';
import { getLocalDateKey } from '../utils/dateHelpers';

export default function CalendarScreen() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState<MonthlyCalendarData | null>(null);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [userGoal, setUserGoal] = useState(120);

  useEffect(() => {
    loadMonthData();
  }, [currentMonth]);

  useFocusEffect(
    useCallback(() => {
      loadMonthData();
    }, [currentMonth])
  );

  const loadMonthData = async () => {
    try {
      // Load user's protein goal from local storage
      let goalAmount = 120; // default
      
      const profile = await localStorageService.getUserProfile();
      if (profile) {
        goalAmount = profile.proteinGoal;
        setUserGoal(goalAmount);
      }

      // Load actual protein data from localStorage service for each day of the month
      const monthData = [];
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateKey = getLocalDateKey(date);
        
        try {
          const entries = await localStorageService.getProteinLogsForDate(dateKey);
          if (entries.length > 0) {
            const totalProtein = entries.reduce((sum: number, entry: any) => sum + (entry.amount || 0), 0);
            
            monthData.push({
              date: dateKey,
              total_protein: totalProtein,
              goal_protein: goalAmount,
            });
          }
        } catch (error) {
          console.error(`Error loading protein data for ${dateKey}:`, error);
        }
      }
      
      const calendar = generateCalendarData(currentMonth, monthData, goalAmount);
      setCalendarData(calendar);
    } catch (error) {
      console.error('Error loading month data:', error);
      // Fallback to empty calendar on error
      const calendar = generateCalendarData(currentMonth, [], userGoal);
      setCalendarData(calendar);
    }
  };

  const generateCalendarData = (date: Date, data: any[], goalAmount: number = 120): MonthlyCalendarData => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    let totalProtein = 0;
    let daysWithData = 0;
    let daysGoalMet = 0;
    let daysBelowGoal = 0;

    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const currentDateKey = getLocalDateKey(currentDate);
      const dayData = data.find(d => d.date === currentDateKey);

      const isCurrentMonth = currentDate.getMonth() === month;
      const today = new Date();
      const isToday = currentDate.toDateString() === today.toDateString();
      
      // Debug logging for today's date
      if (currentDate.getDate() === today.getDate() && isCurrentMonth) {
        console.log('Calendar debug:', {
          currentDate: currentDate.toDateString(),
          today: today.toDateString(),
          currentDateKey,
          isToday,
          hasData: !!dayData,
          dataDate: dayData?.date
        });
      }
      
      let status: CalendarDay['status'] = 'no_data';
      let proteinAmount: number | undefined;
      
      if (dayData) {
        proteinAmount = dayData.total_protein;
        totalProtein += proteinAmount;
        daysWithData++;
        
        if (proteinAmount >= dayData.goal_protein) {
          status = 'goal_met';
          daysGoalMet++;
        } else {
          status = 'below_goal';
          daysBelowGoal++;
        }
      }

      days.push({
        date: currentDate.getDate(),
        fullDate: currentDate,
        proteinAmount,
        goalAmount: dayData?.goal_protein || goalAmount,
        status,
        isCurrentMonth,
        isToday,
        isSelected: false,
      });
    }

    const stats: MonthlyStats = {
      successRate: daysWithData > 0 ? Math.round((daysGoalMet / daysWithData) * 100) : 0,
      goalsCrushed: daysGoalMet,
      dailyAverage: daysWithData > 0 ? Math.round(totalProtein / daysWithData) : 0,
      totalProtein,
      daysWithData,
      daysGoalMet,
      daysBelowGoal,
    };

    return {
      month: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      year,
      days,
      stats,
    };
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDayPress = (day: CalendarDay) => {
    // Only allow selection for days with data
    if (day.isCurrentMonth && day.proteinAmount !== undefined) {
      setSelectedDay(day);
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Month Navigation */}
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={handlePreviousMonth}>
            <Text style={styles.navArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{calendarData?.month}</Text>
          <TouchableOpacity onPress={handleNextMonth}>
            <Text style={styles.navArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary.teal }]} />
            <Text style={styles.legendText}>Goal met</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.secondary.orange }]} />
            <Text style={styles.legendText}>Below goal</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#E0E0E0' }]} />
            <Text style={styles.legendText}>No data</Text>
          </View>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendar}>
          {/* Week day headers */}
          <View style={styles.weekDaysRow}>
            {weekDays.map(day => (
              <Text key={day} style={styles.weekDay}>{day}</Text>
            ))}
          </View>

          {/* Calendar days */}
          <View style={styles.daysGrid}>
            {calendarData?.days.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  !day.isCurrentMonth && styles.otherMonth,
                  day.isToday && styles.today,
                  day.isSelected && styles.selected,
                ]}
                onPress={() => handleDayPress(day)}
                disabled={!day.isCurrentMonth}
              >
                <Text style={[
                  styles.dayNumber,
                  !day.isCurrentMonth && styles.dayNumberOther,
                ]}>
                  {day.date}
                </Text>
                {day.isCurrentMonth && (
                  <View style={[
                    styles.dayIndicator,
                    { 
                      backgroundColor: 
                        day.status === 'goal_met' ? colors.primary.teal :
                        day.status === 'below_goal' ? colors.secondary.orange :
                        '#E0E0E0' // Grey for no data
                    }
                  ]}>
                    {day.proteinAmount !== undefined ? (
                      <Text style={styles.dayProtein}>{day.proteinAmount}g</Text>
                    ) : (
                      <Text style={[styles.dayProtein, { color: '#999' }]}>-</Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Monthly Progress Card */}
        {calendarData && (
          <LinearGradient
            colors={colors.gradients.monthlyCard}
            style={styles.progressCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.progressHeader}>
              <Text style={styles.trophy}>🏆</Text>
              <Text style={styles.progressTitle}>MONTHLY PROGRESS</Text>
              <Text style={styles.star}>⭐</Text>
            </View>

            <Text style={styles.achievementsTitle}>
              {currentMonth.toLocaleDateString('en-US', { month: 'long' })} Achievements
            </Text>

            <View style={styles.successRateContainer}>
              <Text style={styles.successRate}>{calendarData.stats.successRate}%</Text>
              <Text style={styles.successRateLabel}>SUCCESS RATE</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${calendarData.stats.successRate}%` }
                  ]}
                />
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statIcon}>🎯</Text>
                <Text style={styles.statNumber}>{calendarData.stats.goalsCrushed}</Text>
                <Text style={styles.statLabel}>GOALS CRUSHED</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statIcon}>📈</Text>
                <Text style={styles.statNumber}>{calendarData.stats.dailyAverage}g</Text>
                <Text style={styles.statLabel}>DAILY AVERAGE</Text>
              </View>
            </View>

            <Text style={styles.momentum}>🚀 BUILDING MOMENTUM! 🚀</Text>
          </LinearGradient>
        )}

        {/* Detailed Breakdown */}
        {calendarData && (
          <View style={styles.breakdown}>
            <Text style={styles.breakdownTitle}>Detailed Breakdown</Text>
            <View style={styles.breakdownStats}>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownNumber}>{calendarData.stats.daysGoalMet}</Text>
                <Text style={styles.breakdownLabel}>Goals met</Text>
              </View>
              <View style={styles.breakdownItem}>
                <Text style={[styles.breakdownNumber, { color: colors.secondary.orange }]}>
                  {calendarData.stats.daysBelowGoal}
                </Text>
                <Text style={styles.breakdownLabel}>Below goal</Text>
              </View>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownNumber}>{calendarData.stats.totalProtein}g</Text>
                <Text style={styles.breakdownLabel}>Total protein</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  navArrow: {
    fontSize: 32,
    color: colors.text.secondary,
    paddingHorizontal: 10,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  calendar: {
    paddingHorizontal: 10,
  },
  weekDaysRow: {
    flexDirection: 'row',
    paddingBottom: 10,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otherMonth: {
    opacity: 0.3,
  },
  today: {
    borderWidth: 2,
    borderColor: colors.primary.teal,
    borderRadius: 10,
  },
  selected: {
    backgroundColor: colors.primary.lightTeal,
    borderRadius: 10,
  },
  dayNumber: {
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 2,
  },
  dayNumberOther: {
    color: colors.text.light,
  },
  dayIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  dayProtein: {
    fontSize: 10,
    color: colors.text.white,
    fontWeight: '600',
  },
  noDataProtein: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
  },
  progressCard: {
    margin: 20,
    padding: 20,
    borderRadius: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  trophy: {
    fontSize: 24,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.white,
    letterSpacing: 1,
  },
  star: {
    fontSize: 24,
  },
  achievementsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.white,
    textAlign: 'center',
    marginBottom: 30,
  },
  successRateContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  successRate: {
    fontSize: 64,
    fontWeight: 'bold',
    color: colors.text.white,
  },
  successRateLabel: {
    fontSize: 14,
    color: colors.text.white,
    letterSpacing: 1,
    marginTop: 5,
  },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginTop: 15,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.text.white,
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 15,
    flex: 0.45,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.white,
  },
  statLabel: {
    fontSize: 11,
    color: colors.text.white,
    letterSpacing: 0.5,
    marginTop: 5,
  },
  momentum: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.white,
    textAlign: 'center',
    letterSpacing: 1,
  },
  breakdown: {
    padding: 20,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 20,
  },
  breakdownStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary.teal,
  },
  breakdownLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 5,
  },
});