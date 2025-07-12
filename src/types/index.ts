export type UserRole = 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  class?: string;
  grade?: string;
  department?: string;
}

export interface Teacher extends User {
  role: 'teacher';
  subjects?: string[];
  classes?: string[];
}

export interface Student extends User {
  role: 'student';
  studentId: string;
  class: string;
  grade: string;
  department: string;
}

export interface Class {
  id: string;
  name: string;
  grade: string;
  department: string;
  teacher: string;
  students: string[];
  schedule: ClassSchedule[];
}

export interface ClassSchedule {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string;
  endTime: string;
  subject: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  classId: string;
  date: string;
  records: StudentAttendance[];
  createdBy: string;
  lastUpdated: string;
  qrCode: string;
}

export interface StudentAttendance {
  studentId: string;
  status: AttendanceStatus;
  timeIn?: string;
  notes?: string;
}

export interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  percentage: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => void;
}

export interface DataContextType {
  classes: Class[];
  students: Student[];
  teachers: Teacher[];
  attendanceRecords: AttendanceRecord[];
  isLoading: boolean;
  error: Error | null;
}