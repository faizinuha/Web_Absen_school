import { useState } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { BookOpen, Eye, Filter, Plus, Search, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { AttendanceStatus, Student } from '../types';
import toast from 'react-hot-toast';

const StudentsPage = () => {
  const { students, classes, attendanceRecords } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  
  // Get classes that this teacher teaches
  const teacherClasses = classes.filter(cls => cls.teacher === user?.id);
  
  // Get students for the teacher's classes
  const teacherStudents = students.filter(student => 
    teacherClasses.some(cls => cls.students.includes(student.id))
  );
  
  // Filter students based on search and class filter
  const filteredStudents = teacherStudents.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = !selectedClass || student.class === selectedClass;
    
    return matchesSearch && matchesClass;
  });
  
  // Get attendance stats for a student
  const getAttendanceStats = (studentId: string) => {
    const records = attendanceRecords.flatMap(record => 
      record.records.filter(r => r.studentId === studentId)
    );
    
    const statuses = records.reduce(
      (acc, curr) => {
        acc[curr.status]++;
        return acc;
      }, 
      { present: 0, absent: 0, late: 0, excused: 0 }
    );
    
    const total = Object.values(statuses).reduce((sum, curr) => sum + curr, 0);
    const presentPercentage = total > 0 
      ? ((statuses.present / total) * 100).toFixed(1) 
      : '0';
    
    return { ...statuses, total, presentPercentage };
  };
  
  // Handle adding a new student
  const handleAddStudent = () => {
    toast('This feature is not implemented in the demo', {
      icon: '👨‍💻',
    });
  };

  // Handle viewing student details
  const handleViewStudent = (student: Student) => {
    toast(`Viewing details for ${student.name}`, {
      icon: '👁️',
    });
  };
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-bold text-gray-900">Students</h1>
          <p className="text-gray-600">Manage students in your classes</p>
        </div>
        
        <button
          onClick={handleAddStudent}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          Add New Student
        </button>
      </div>
      
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              className="input pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="input pl-10 w-full"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">All Classes</option>
              {teacherClasses.map((cls) => (
                <option key={cls.id} value={cls.name}>
                  Class {cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="card">
        {filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col\" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance Rate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => {
                  const stats = getAttendanceStats(student.id);
                  
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
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.studentId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Class {student.class}</div>
                        <div className="text-sm text-gray-500">Grade {student.grade}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                              <div 
                                className="bg-primary-500 h-2.5 rounded-full" 
                                style={{ width: `${stats.presentPercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{stats.presentPercentage}%</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                            <span className="text-success">P: {stats.present}</span>
                            <span className="text-danger">A: {stats.absent}</span>
                            <span className="text-warning">L: {stats.late}</span>
                            <span className="text-info">E: {stats.excused}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleViewStudent(student)}
                          className="text-primary-600 hover:text-primary-800 mr-3"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No students found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedClass
                ? "No students match your search criteria"
                : "You don't have any students assigned to your classes yet"}
            </p>
            {teacherClasses.length > 0 && (
              <button
                onClick={handleAddStudent}
                className="mt-4 btn btn-primary btn-sm flex items-center gap-2 mx-auto"
              >
                <Plus size={16} />
                Add New Student
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsPage;