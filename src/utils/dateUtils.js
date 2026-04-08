/**
 * Date utility functions to determine start and end times for queries.
 * Standardizes to midnight for start dates and 23:59:59.999 for end dates.
 */

const getStartOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getEndOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const getDateRange = (rangeType) => {
  const now = new Date();
  
  switch (rangeType) {
    case "today": {
      return {
        start: getStartOfDay(now),
        end: getEndOfDay(now)
      };
    }
    case "yesterday": {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        start: getStartOfDay(yesterday),
        end: getEndOfDay(yesterday)
      };
    }
    case "this_week": {
      // Assuming week starts on Sunday
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - dayOfWeek);
      return {
        start: getStartOfDay(startOfWeek),
        end: getEndOfDay(now)
      };
    }
    case "last_week": {
      const dayOfWeek = now.getDay();
      const startOfLastWeek = new Date(now);
      startOfLastWeek.setDate(now.getDate() - dayOfWeek - 7);
      
      const endOfLastWeek = new Date(startOfLastWeek);
      endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
      
      return {
        start: getStartOfDay(startOfLastWeek),
        end: getEndOfDay(endOfLastWeek)
      };
    }
    case "this_month": {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        start: getStartOfDay(startOfMonth),
        end: getEndOfDay(now)
      };
    }
    case "last_month": {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of previous month
      return {
        start: getStartOfDay(startOfLastMonth),
        end: getEndOfDay(endOfLastMonth)
      };
    }
    case "this_year": {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return {
        start: getStartOfDay(startOfYear),
        end: getEndOfDay(now)
      };
    }
    default:
      // "all" or unknown defaults to null dates meaning no filter
      return { start: null, end: null };
  }
};
