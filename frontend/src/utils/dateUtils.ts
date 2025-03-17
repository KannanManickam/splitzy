/**
 * Format date to a readable string
 * @param dateString The date string to format
 * @returns Formatted date string (e.g., "Apr 20, 2023")
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format date with time
 * @param date The date to format
 * @returns Formatted date and time string (e.g., "Apr 20, 2023, 2:30 PM")
 */
export const formatDateWithTime = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return date.toLocaleDateString('en-US', options);
};