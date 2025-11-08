/**
 * Date utility functions to handle timestamp serialization consistently
 * Prevents data type mismatches between client and database
 */

/**
 * Safely convert any date-like value to ISO string format for database storage
 * Handles: Date objects, ISO strings, timestamps, null, undefined
 */
export function toISOString(date: Date | string | number | null | undefined): string | null {
  if (!date) return null;

  try {
    // If already a string in ISO format, validate and return
    if (typeof date === 'string') {
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) {
        console.error('Invalid date string:', date);
        return null;
      }
      return parsed.toISOString();
    }

    // If a number (timestamp), convert to Date first
    if (typeof date === 'number') {
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) {
        console.error('Invalid timestamp:', date);
        return null;
      }
      return parsed.toISOString();
    }

    // If a Date object, convert to ISO string
    if (date instanceof Date) {
      if (isNaN(date.getTime())) {
        console.error('Invalid Date object:', date);
        return null;
      }
      return date.toISOString();
    }

    console.error('Unknown date type:', typeof date, date);
    return null;
  } catch (error) {
    console.error('Error converting date to ISO string:', error, date);
    return null;
  }
}

/**
 * Safely convert ISO string to Date object
 * Returns null if conversion fails
 */
export function fromISOString(isoString: string | null | undefined): Date | null {
  if (!isoString) return null;

  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      console.error('Invalid ISO string:', isoString);
      return null;
    }
    return date;
  } catch (error) {
    console.error('Error parsing ISO string:', error, isoString);
    return null;
  }
}

/**
 * Convert date to YYYY-MM-DD format for date-only database columns
 */
export function toDateOnly(date: Date | string | null | undefined): string | null {
  if (!date) return null;

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date for date-only conversion:', date);
      return null;
    }

    // Format as YYYY-MM-DD
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error converting to date-only:', error, date);
    return null;
  }
}

/**
 * Safely convert timestamp (ms) to ISO string
 */
export function timestampToISO(timestamp: number | null | undefined): string | null {
  if (!timestamp) return null;
  return toISOString(timestamp);
}

/**
 * Safely convert ISO string to timestamp (ms)
 */
export function isoToTimestamp(isoString: string | null | undefined): number | null {
  const date = fromISOString(isoString);
  return date ? date.getTime() : null;
}

/**
 * Check if two dates are the same day (ignoring time)
 */
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Ensure timestamp is valid for database storage
 * Returns current timestamp if invalid
 */
export function ensureValidTimestamp(timestamp: any): string {
  const iso = toISOString(timestamp);
  return iso || new Date().toISOString();
}
