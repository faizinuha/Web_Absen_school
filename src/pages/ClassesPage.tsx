import { useState } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { Book, Clock, Edit, Plus, Search, Trash, UserPlus, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const ClassesPage = () => {
  const { classes, students, teachers } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Simulate adding a class (in a real app, this would call an API)
  const handleAddClass = () => {
    toast('This feature is not implemented in the demo', {
      icon: '👨‍💻',
    });
  };

  // Filter classes based on teacher
  const teacherClasses = classes.filter(cls => cls.teacher === user?.id);
  
  // Filter classes based on search
  const filteredClasses = teacherClasses.filter(cls => 
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.grade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get teacher info for a class
  const getTeacherInfo = (teacherId: string) => {
    return teachers.find(teacher => teacher.id === teacherId);
  };
  
  // Get student count for a class
  const getStudentCount = (studentIds: string[]) => {
    return studentIds.length;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-bold text-gray-900">Manage Classes</h1>
          <p className="text-gray-600">View and manage your assigned classes</p>
        </div>
        
        <button
          onClick={handleAddClass}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          Add New Class
        </button>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search classes by name or grade..."
            className="input pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map(cls => {
          const teacherInfo = getTeacherInfo(cls.teacher);
          const studentCount = getStudentCount(cls.students);
          
          return (
            <div key={cls.id} className="card hover:shadow-lg transition-shadow duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Class {cls.name}</h2>
                  <p className="text-gray-500">Grade {cls.grade}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-600 hover:text-primary-500 hover:bg-primary-50 rounded-full transition-colors">
                    <Edit size={16} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-400" />
                  <span className="text-sm">
                    <strong>{studentCount}</strong> Students
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Book className="h-5 w-5 text-gray-400" />
                  <span className="text-sm">
                    <strong>{cls.schedule.length}</strong> Classes per week
                  </span>
                </div>
              </div>
              
              <h3 className="font-medium text-gray-700 mb-2">Schedule</h3>
              <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                {cls.schedule.map((schedule, idx) => (
                  <div key={idx} className="bg-gray-50 p-2 rounded-md flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium capitalize">{schedule.day}</p>
                      <p className="text-xs text-gray-500">{schedule.subject}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock size={14} />
                      <span>{schedule.startTime} - {schedule.endTime}</span>
                    </div>
                  </div>
                ))}
                
                {cls.schedule.length === 0 && (
                  <p className="text-sm text-gray-500">No schedule available</p>
                )}
              </div>
              
              <div className="flex mt-2">
                <button className="btn btn-primary btn-sm w-full flex items-center justify-center gap-1">
                  <UserPlus size={16} />
                  Manage Students
                </button>
              </div>
            </div>
          );
        })}
        
        {filteredClasses.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <Book className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No classes found</h3>
            <p className="text-sm text-gray-500 mb-4">
              {searchTerm 
                ? "No classes match your search criteria" 
                : "You haven't been assigned any classes yet"}
            </p>
            <button
              onClick={handleAddClass}
              className="btn btn-primary btn-sm flex items-center gap-2"
            >
              <Plus size={16} />
              Add New Class
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassesPage;