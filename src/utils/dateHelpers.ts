/**
 * Date helper utilities for consistent local date handling
 * Fixes timezone bug where data was being saved to wrong day in UTC
 */

/**
 * Get a date key in YYYY-MM-DD format using LOCAL timezone
 * This ensures protein entries are saved to the correct day as experienced by the user
 * @param date - Optional date object, defaults to current date/time
 * @returns String in format "YYYY-MM-DD" based on device's local timezone
 */
export const getLocalDateKey = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get UTC date key for backwards compatibility with existing data
 * Used to check for data that was saved with the old UTC method
 * @param date - Optional date object, defaults to current date/time
 * @returns String in format "YYYY-MM-DD" based on UTC timezone
 */
export const getUTCDateKey = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Parse a date key string back into a Date object
 * @param dateKey - String in format "YYYY-MM-DD"
 * @returns Date object set to midnight local time
 */
export const parseDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Check if two date keys represent the same day
 * @param key1 - First date key
 * @param key2 - Second date key
 * @returns true if both keys represent the same day
 */
export const areSameDay = (key1: string, key2: string): boolean => {
  return key1 === key2;
};