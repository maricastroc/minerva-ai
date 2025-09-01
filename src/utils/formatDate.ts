import { format, isToday, isYesterday } from 'date-fns';
import { enUS } from 'date-fns/locale';

export const formatDate = (dateInput: Date | string) => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';

  return format(date, 'MM/dd/yyyy', { locale: enUS });
};
