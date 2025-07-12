import { useState, useEffect, useMemo } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { format, parseISO, isWithinInterval, subDays } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, Download, Filter } from 'lucide-react';
import { AttendanceStatus } from '../types';

const AttendanceHistoryPage = () => {
  const { attendanceRecords, classes, students } = useData();
  const { user } = useAuth();
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(
    format(subDays(new Date(), 30), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | ''>('');
  const [studentIdFilter, setStudentIdFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const isTeacher = user?.role === 'teacher';

  // Filter classes based on user role
  const userClasses = isTeacher
    ? classes.filter((cls) => cls.teacher === user?.id)
    : classes.filter((cls) => user?.class === cls.name);

  // Get students for the selected class
  const classStudents = useMemo(() => {
    if (!selectedClassId) return [];
    const classInfo = classes.find((c) => c.id === selectedClassId);
    if (!classInfo) return [];
    return students.filter((s) => classInfo.students.includes(s.id));
  }, [selectedClassId, classes, students]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedClassId, startDate, endDate, statusFilter, studentIdFilter]);

  // Filter attendance records
  const filteredAttendance = useMemo(() => {
    let filtered = [...attendanceRecords];

    // Filter by class
    if (selectedClassId) {
      filtered = filtered.filter((record) => record.classId === selectedClassId);
    } else if (!isTeacher && user?.class) {
      // For students, only show their class records
      const studentClass = classes.find((cls) => cls.name === user.class);
      if (studentClass) {
        filtered = filtered.filter((record) => record.classId === studentClass.id);
      }
    }

    // Filter by date range
    filtered = filtered.filter((record) => {
      const recordDate = parseISO(record.date);
      return isWithinInterval(recordDate, {
        start: parseISO(startDate),
        end: parseISO(endDate),
      });
    });

    // For students, only show their own records
    if (!isTeacher && user?.id) {
      filtered = filtered.map((record) => ({
        ...record,
        records: record.records.filter((r) => r.studentId === user.id),
      })).filter((record) => record.records.length > 0);
    }

    // Filter by status
    if (statusFilter) {
      filtered = filtered.map((record) => ({
        ...record,
        records: record.records.filter((r) => r.status === statusFilter),
      })).filter((record) => record.records.length > 0);
    }

    // Filter by student
    if (studentIdFilter && isTeacher) {
      filtered = filtered.map((record) => ({
        ...record,
        records: record.records.filter((r) => r.studentId === studentIdFilter),
      })).filter((record) => record.records.length > 0);
    }

    return filtered;
  }, [
    attendanceRecords,
    selectedClassId,
    startDate,
    endDate,
    statusFilter,
    studentIdFilter,
    isTeacher,
    user,
    classes,
  ]);

  // Sort records by date (most recent first)
  const sortedRecords = [...filteredAttendance].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Paginate records
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = sortedRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(sortedRecords.length / recordsPerPage);

  // Reset filters
  const resetFilters = () => {
    setSelectedClassId('');
    setStartDate(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
    setEndDate(format(new Date(), 'yyyy-MM-dd'));
    setStatusFilter('');
    setStudentIdFilter('');
    setCurrentPage(1);
  };

  // Export attendance data as CSV
  const exportToCSV = () => {
    // Create CSV headers
    let csvContent = 'Date,Class,Student,Status,Time In,Notes\n';
    
    // Add data rows
    sortedRecords.forEach(record => {
      const classInfo = classes.find(c => c.id === record.classId);
      const className = classInfo ? classInfo.name : 'Unknown';
      
      record.records.forEach(studentRecord => {
        const studentInfo = students.find(s => s.id === studentRecord.studentId);
        const studentName = studentInfo ? studentInfo.name : 'Unknown';
        
        csvContent += `"${record.date}","${className}","${studentName}","${studentRecord.status}","${studentRecord.timeIn || ''}","${studentRecord.notes || ''}"\n`;
      });
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-bold text-gray-900">Attendance History</h1>
          <p className="text-gray-600">
            View and filter attendance records
          </p>
        </div>
        
        <button
          onClick={exportToCSV}
          className="btn btn-outline flex items-center gap-2"
        >
          <Download size={16} />
          Export Data
        </button>
      </div>

      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <select
              id="class"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="input"
            >
              <option value="">All Classes</option>
              {userClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  Class {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AttendanceStatus | '')}
              className="input"
            >
              <option value="">All Statuses</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="excused">Excused</option>
            </select>
          </div>

          {isTeacher && (
            <div>
              <label htmlFor="student" className="block text-sm font-medium text-gray-700 mb-1">
                Student
              </label>
              <select
                id="student"
                value={studentIdFilter}
                onChange={(e) => setStudentIdFilter(e.target.value)}
                className="input"
                disabled={!selectedClassId}
              >
                <option value="">All Students</option>
                {classStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={resetFilters}
            className="btn btn-outline"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Attendance Records</h2>
        
        {currentRecords.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time In
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentRecords.flatMap(record => 
                    record.records.map(studentRecord => {
                      const studentInfo = students.find(s => s.id === studentRecord.studentId);
                      const classInfo = classes.find(c => c.id === record.classId);
                      
                      return (
                        <tr key={`${record.id}-${studentRecord.studentId}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {format(parseISO(record.date), 'MMMM d, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {classInfo?.name || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 flex-shrink-0 rounded-full overflow-hidden mr-3">
                                <img 
                                  src={studentInfo?.avatar || 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'} 
                                  alt={studentInfo?.name} 
                                  className="h-8 w-8 object-cover"
                                />
                              </div>
                              {studentInfo?.name || 'Unknown'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`badge badge-${studentRecord.status}`}>
                              {studentRecord.status.charAt(0).toUpperCase() + studentRecord.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {studentRecord.timeIn || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {studentRecord.notes || '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{indexOfFirstRecord + 1}</span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastRecord, sortedRecords.length)}
                </span>{' '}
                of <span className="font-medium">{sortedRecords.length}</span> results
              </p>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="btn btn-outline btn-sm"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <div className="flex items-center space-x-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-md ${
                        currentPage === i + 1
                          ? 'bg-primary-500 text-white'
                          : 'bg-white hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="btn btn-outline btn-sm"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No records found</h3>
            <p className="mt-1 text-sm text-gray-500">Try changing your search filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceHistoryPage;