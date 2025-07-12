import { AttendanceStatus } from '../types';

export const getStatusColor = (status: AttendanceStatus): string => {
  switch (status) {
    case 'present':
      return 'text-success';
    case 'absent':
      return 'text-danger';
    case 'late':
      return 'text-warning';
    case 'excused':
      return 'text-info';
    default:
      return 'text-gray-500';
  }
};

export const getStatusBadge = (status: AttendanceStatus): string => {
  switch (status) {
    case 'present':
      return 'badge-present';
    case 'absent':
      return 'badge-absent';
    case 'late':
      return 'badge-late';
    case 'excused':
      return 'badge-excused';
    default:
      return '';
  }
};

export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
  
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const calculateAttendancePercentage = (
  present: number,
  total: number
): string => {
  if (total === 0) return '0';
  return ((present / total) * 100).toFixed(1);
};