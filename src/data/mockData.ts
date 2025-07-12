import { Teacher, Student, Class, AttendanceRecord } from '../types';
import { format } from 'date-fns';

// Mock Teachers
export const mockTeachers: Teacher[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'teacher@example.com',
    role: 'teacher',
    subjects: ['Mathematics', 'Physics'],
    classes: ['TKJ-10A', 'RPL-11B', 'MM-12A'],
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: '2',
    name: 'Emily Johnson',
    email: 'emily.johnson@example.com',
    role: 'teacher',
    subjects: ['Programming', 'Database'],
    classes: ['RPL-10B', 'TKJ-12A'],
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
];

// Mock Students
export const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Alice Cooper',
    email: 'student@example.com',
    role: 'student',
    studentId: '2023001',
    class: 'TKJ-10A',
    department: 'Computer and Network Engineering',
    grade: '10',
    avatar: 'https://images.pexels.com/photos/1181695/pexels-photo-1181695.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: '2',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    role: 'student',
    studentId: '2023002',
    class: 'RPL-10B',
    department: 'Software Engineering',
    grade: '10',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: '3',
    name: 'Carol Williams',
    email: 'carol.williams@example.com',
    role: 'student',
    studentId: '2023003',
    class: 'MM-12A',
    department: 'Multimedia',
    grade: '12',
    avatar: 'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
];

// Mock Classes
export const mockClasses: Class[] = [
  {
    id: '1',
    name: 'TKJ-10A',
    grade: '10',
    department: 'Computer and Network Engineering',
    teacher: '1',
    students: ['1'],
    schedule: [
      { day: 'monday', startTime: '08:00', endTime: '09:30', subject: 'Network Fundamentals' },
      { day: 'tuesday', startTime: '10:00', endTime: '11:30', subject: 'Computer Hardware' },
      { day: 'wednesday', startTime: '13:00', endTime: '14:30', subject: 'Operating Systems' },
    ],
  },
  {
    id: '2',
    name: 'RPL-10B',
    grade: '10',
    department: 'Software Engineering',
    teacher: '2',
    students: ['2'],
    schedule: [
      { day: 'monday', startTime: '10:00', endTime: '11:30', subject: 'Programming Basics' },
      { day: 'thursday', startTime: '08:00', endTime: '09:30', subject: 'Database Design' },
    ],
  },
  {
    id: '3',
    name: 'MM-12A',
    grade: '12',
    department: 'Multimedia',
    teacher: '1',
    students: ['3'],
    schedule: [
      { day: 'wednesday', startTime: '08:00', endTime: '09:30', subject: 'Digital Design' },
      { day: 'friday', startTime: '10:00', endTime: '11:30', subject: 'Video Editing' },
    ],
  },
];

// Generate attendance records for the past week
const generateAttendanceRecords = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = format(date, 'yyyy-MM-dd');
    
    mockClasses.forEach(cls => {
      records.push({
        id: `${dateString}-class-${cls.id}`,
        classId: cls.id,
        date: dateString,
        createdBy: cls.teacher,
        lastUpdated: dateString,
        qrCode: `attendance-${cls.id}-${dateString}`,
        records: cls.students.map(studentId => ({
          studentId,
          status: i % 5 === 0 ? 'absent' : 'present',
          timeIn: i % 5 === 0 ? undefined : '08:00',
        }))
      });
    });
  }

  return records;
};

export const mockAttendanceRecords: AttendanceRecord[] = generateAttendanceRecords();

// Mock Users array for login
export const mockUsers = [...mockTeachers, ...mockStudents];