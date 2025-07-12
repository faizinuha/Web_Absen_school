import { useState } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { AlertCircle, Check, Clock, Info, X } from 'lucide-react';
import { AttendanceStatus, StudentAttendance } from '../types';
import toast from 'react-hot-toast';

const AttendanceManagePage = () => {
  const { classes, students } = useData();
  const { user } = useAuth();
  const [selectedClassId, setSelectedClassId] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [attendanceData, setAttendanceData] = useState<StudentAttendance[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Filter classes that the teacher teaches
  const teacherClasses = classes.filter(cls => cls.teacher === user?.id);

  // Handle class selection
  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    
    // Get students in this class
    const classInfo = classes.find(c => c.id === classId);
    if (classInfo) {
      const studentsInClass = students.filter(s => classInfo.students.includes(s.id));
      
      // Initialize attendance data for all students
      const initialAttendance = studentsInClass.map(student => ({
        studentId: student.id,
        status: 'present' as AttendanceStatus,
        timeIn: format(new Date(), 'HH:mm'),
        notes: ''
      }));
      
      setAttendanceData(initialAttendance);
    }
  };

  // Handle status change for a student
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceData(prev => 
      prev.map(item => 
        item.studentId === studentId 
          ? { ...item, status }
          : item
      )
    );
  };

  // Handle notes change for a student
  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceData(prev => 
      prev.map(item => 
        item.studentId === studentId 
          ? { ...item, notes }
          : item
      )
    );
  };

  // Handle time in change for a student
  const handleTimeChange = (studentId: string, timeIn: string) => {
    setAttendanceData(prev => 
      prev.map(item => 
        item.studentId === studentId 
          ? { ...item, timeIn }
          : item
      )
    );
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClassId) {
      toast.error('Please select a class');
      return;
    }
    
    if (attendanceData.length === 0) {
      toast.error('No students to mark attendance for');
      return;
    }
    
    setSubmitting(true);
    
    // In a real app, this would be an API call
    setTimeout(() => {
      // Save to localStorage (simulate API)
      const newAttendanceRecord = {
        id: `${date}-class-${selectedClassId}`,
        classId: selectedClassId,
        date,
        records: attendanceData,
        createdBy: user?.id || '',
        lastUpdated: new Date().toISOString()
      };
      
      // Get existing records
      const existingRecords = JSON.parse(localStorage.getItem('absen_school_attendance') || '[]');
      
      // Check if record for this date/class already exists
      const existingIndex = existingRecords.findIndex((r: any) => r.id === newAttendanceRecord.id);
      
      if (existingIndex >= 0) {
        // Update existing record
        existingRecords[existingIndex] = newAttendanceRecord;
      } else {
        // Add new record
        existingRecords.push(newAttendanceRecord);
      }
      
      localStorage.setItem('absen_school_attendance', JSON.stringify(existingRecords));
      
      toast.success('Attendance saved successfully');
      setSubmitting(false);
    }, 1000);
  };

  // Get students for the selected class
  const classStudents = selectedClassId 
    ? students.filter(student => {
        const classInfo = classes.find(c => c.id === selectedClassId);
        return classInfo ? classInfo.students.includes(student.id) : false;
      })
    : [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-bold text-gray-900">Mark Attendance</h1>
          <p className="text-gray-600">Record student attendance for today</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Today:</span>
          <span className="font-medium">{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
        </div>
      </div>

      <div className="card mb-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">
                Select Class
              </label>
              <select
                id="class"
                value={selectedClassId}
                onChange={(e) => handleClassChange(e.target.value)}
                className="input"
                required
              >
                <option value="">Select a class</option>
                {teacherClasses.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    Class {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input"
                max={format(new Date(), 'yyyy-MM-dd')}
                required
              />
            </div>
          </div>

          {teacherClasses.length === 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    You are not assigned to any classes yet. Please contact the administrator.
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedClassId && classStudents.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time In
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {classStudents.map(student => {
                    const attendanceRecord = attendanceData.find(a => a.studentId === student.id);
                    
                    return (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden">
                              <img 
                                src={student.avatar || 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'} 
                                alt={student.name} 
                                className="h-10 w-10 object-cover"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-500">ID: {student.studentId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="time"
                            value={attendanceRecord?.timeIn || ''}
                            onChange={(e) => handleTimeChange(student.id, e.target.value)}
                            className="input w-full max-w-[120px]"
                            disabled={attendanceRecord?.status === 'absent'}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-1">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, 'present')}
                              className={`btn btn-sm flex items-center justify-center ${attendanceRecord?.status === 'present' ? 'bg-success text-white' : 'btn-outline'}`}
                              title="Present"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, 'absent')}
                              className={`btn btn-sm flex items-center justify-center ${attendanceRecord?.status === 'absent' ? 'bg-danger text-white' : 'btn-outline'}`}
                              title="Absent"
                            >
                              <X size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, 'late')}
                              className={`btn btn-sm flex items-center justify-center ${attendanceRecord?.status === 'late' ? 'bg-warning text-white' : 'btn-outline'}`}
                              title="Late"
                            >
                              <Clock size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, 'excused')}
                              className={`btn btn-sm flex items-center justify-center ${attendanceRecord?.status === 'excused' ? 'bg-info text-white' : 'btn-outline'}`}
                              title="Excused"
                            >
                              <Info size={16} />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={attendanceRecord?.notes || ''}
                            onChange={(e) => handleNotesChange(student.id, e.target.value)}
                            className="input w-full"
                            placeholder="Add notes..."
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {selectedClassId && classStudents.length === 0 && (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
              <p className="mt-1 text-sm text-gray-500">This class doesn't have any students yet.</p>
            </div>
          )}

          {selectedClassId && classStudents.length > 0 && (
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AttendanceManagePage;