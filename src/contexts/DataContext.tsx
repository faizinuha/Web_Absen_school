import React, { createContext, useState, useEffect } from 'react';
import { DataContextType, AttendanceRecord, Class, Student, Teacher } from '../types';
import { mockClasses, mockStudents, mockTeachers, mockAttendanceRecords } from '../data/mockData';

export const DataContext = createContext<DataContextType>({
  classes: [],
  students: [],
  teachers: [],
  attendanceRecords: [],
  isLoading: true,
  error: null,
});

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchData = () => {
      try {
        // Load data from localStorage or use mock data if none exists
        const storedClasses = localStorage.getItem('absen_school_classes');
        const storedStudents = localStorage.getItem('absen_school_students');
        const storedTeachers = localStorage.getItem('absen_school_teachers');
        const storedAttendance = localStorage.getItem('absen_school_attendance');

        setClasses(storedClasses ? JSON.parse(storedClasses) : mockClasses);
        setStudents(storedStudents ? JSON.parse(storedStudents) : mockStudents);
        setTeachers(storedTeachers ? JSON.parse(storedTeachers) : mockTeachers);
        setAttendanceRecords(storedAttendance ? JSON.parse(storedAttendance) : mockAttendanceRecords);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error loading data'));
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update localStorage whenever data changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('absen_school_classes', JSON.stringify(classes));
      localStorage.setItem('absen_school_students', JSON.stringify(students));
      localStorage.setItem('absen_school_teachers', JSON.stringify(teachers));
      localStorage.setItem('absen_school_attendance', JSON.stringify(attendanceRecords));
    }
  }, [classes, students, teachers, attendanceRecords, isLoading]);

  return (
    <DataContext.Provider
      value={{
        classes,
        students,
        teachers,
        attendanceRecords,
        isLoading,
        error,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};