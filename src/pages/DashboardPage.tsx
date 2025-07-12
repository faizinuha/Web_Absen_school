import { useAuth } from '../hooks/useAuth';
import { Calendar, CalendarDays, CheckCheck, ClipboardList, Users, UserX, Clock, QrCode } from 'lucide-react';
import { useData } from '../hooks/useData';
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { AttendanceStats, StudentAttendance } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { QRCodeSVG } from 'qrcode.react';

const DashboardPage = () => {
  const { user } = useAuth();
  const { attendanceRecords, classes, students } = useData();
  const isTeacher = user?.role === 'teacher';

  // Get today's date
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Calculate attendance statistics
  const calculateAttendanceStats = (): AttendanceStats => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;
    let total = 0;
    
    if (isTeacher) {
      attendanceRecords.forEach(record => {
        record.records.forEach(student => {
          total++;
          if (student.status === 'present') present++;
          if (student.status === 'absent') absent++;
          if (student.status === 'late') late++;
          if (student.status === 'excused') excused++;
        });
      });
    } else if (user) {
      attendanceRecords.forEach(record => {
        const studentRecord = record.records.find(r => r.studentId === user.id);
        if (studentRecord) {
          total++;
          if (studentRecord.status === 'present') present++;
          if (studentRecord.status === 'absent') absent++;
          if (studentRecord.status === 'late') late++;
          if (studentRecord.status === 'excused') excused++;
        }
      });
    }
    
    const percentage = total > 0 ? (present / total) * 100 : 0;
    
    return {
      present,
      absent,
      late,
      excused,
      total,
      percentage
    };
  };
  
  const stats = calculateAttendanceStats();
  
  // Get classes for the teacher or the student's class
  const relevantClasses = isTeacher 
    ? classes.filter(c => user?.id && c.teacher === user.id)
    : classes.filter(c => c.name === user?.class);
  
  // Get today's attendance records for the relevant classes
  const todayAttendance = attendanceRecords.filter(
    record => record.date === today && relevantClasses.some(c => c.id === record.classId)
  );

  // Format data for charts
  const pieChartData = [
    { name: 'Present', value: stats.present, color: '#10B981' },
    { name: 'Absent', value: stats.absent, color: '#EF4444' },
    { name: 'Late', value: stats.late, color: '#F59E0B' },
    { name: 'Excused', value: stats.excused, color: '#3B82F6' }
  ].filter(item => item.value > 0);
  
  // Format attendance by day for bar chart (for teachers only)
  const getAttendanceByDay = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return format(date, 'yyyy-MM-dd');
    }).reverse();
    
    return last7Days.map(date => {
      const recordsForDay = attendanceRecords.filter(record => record.date === date);
      let present = 0, absent = 0, late = 0, excused = 0;
      
      recordsForDay.forEach(record => {
        record.records.forEach(student => {
          if (student.status === 'present') present++;
          if (student.status === 'absent') absent++;
          if (student.status === 'late') late++;
          if (student.status === 'excused') excused++;
        });
      });
      
      return {
        date: format(parseISO(date), 'MM/dd'),
        present,
        absent,
        late,
        excused
      };
    });
  };
  
  const attendanceByDay = isTeacher ? getAttendanceByDay() : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.name}!
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Today:</span>
          <span className="font-medium">{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-primary-100 text-sm font-medium mb-1">Attendance Rate</p>
              <p className="text-3xl font-bold">{stats.percentage.toFixed(1)}%</p>
            </div>
            <div className="p-2 bg-white/20 rounded-lg">
              <CheckCheck size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-primary-100">Based on {stats.total} records</span>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Present</p>
              <p className="text-3xl font-bold text-success">{stats.present}</p>
            </div>
            <div className="p-2 bg-green-100 text-success rounded-lg">
              <CheckCheck size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <span>{stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0}% of total</span>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Absent</p>
              <p className="text-3xl font-bold text-danger">{stats.absent}</p>
            </div>
            <div className="p-2 bg-red-100 text-danger rounded-lg">
              <UserX size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <span>{stats.total > 0 ? ((stats.absent / stats.total) * 100).toFixed(1) : 0}% of total</span>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Late</p>
              <p className="text-3xl font-bold text-warning">{stats.late}</p>
            </div>
            <div className="p-2 bg-yellow-100 text-warning rounded-lg">
              <Clock size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <span>{stats.total > 0 ? ((stats.late / stats.total) * 100).toFixed(1) : 0}% of total</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart section */}
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Attendance Overview</h2>
          
          {isTeacher ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={attendanceByDay}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="present" fill="#10B981" name="Present" />
                  <Bar dataKey="absent" fill="#EF4444" name="Absent" />
                  <Bar dataKey="late" fill="#F59E0B" name="Late" />
                  <Bar dataKey="excused" fill="#3B82F6" name="Excused" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-72">
              <div className="text-center">
                <PieChart width={240} height={240}>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
                <p className="text-gray-500 mt-4">Your attendance distribution</p>
              </div>
            </div>
          )}
        </div>

        {/* Today's Classes with QR Code */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">
            {isTeacher ? "Today's Classes" : "Recent Attendance"}
          </h2>
          
          {isTeacher ? (
            <div className="space-y-4">
              {relevantClasses.length > 0 ? (
                relevantClasses.map(cls => {
                  const todayDay = format(new Date(), 'EEEE').toLowerCase();
                  const todaySchedule = cls.schedule.filter(s => s.day === todayDay);
                  const todayQR = todayAttendance.find(a => a.classId === cls.id)?.qrCode;
                  
                  return todaySchedule.length > 0 ? (
                    <div key={cls.id} className="border rounded-lg overflow-hidden">
                      <div className="bg-primary-50 px-4 py-2">
                        <h3 className="font-medium">Class {cls.name}</h3>
                        <p className="text-sm text-gray-500">{cls.department}</p>
                      </div>
                      <div className="p-4">
                        {todaySchedule.map((schedule, idx) => (
                          <div key={idx} className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Calendar size={16} className="text-gray-400" />
                              <span>{schedule.subject}</span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {schedule.startTime} - {schedule.endTime}
                            </div>
                          </div>
                        ))}
                        
                        {/* QR Code Section */}
                        {todayQR && (
                          <div className="mt-4 flex flex-col items-center border-t pt-4">
                            <QRCodeSVG
                              value={todayQR}
                              size={120}
                              level="H"
                              includeMargin
                              className="mb-2"
                            />
                            <p className="text-sm text-gray-500">Scan to mark attendance</p>
                          </div>
                        )}
                        
                        <div className="flex gap-2 mt-4">
                          <Link 
                            to="/attendance/manage" 
                            className="btn btn-primary btn-sm flex-1"
                          >
                            Mark Attendance
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <CalendarDays className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                  <p>No classes scheduled for today</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {todayAttendance.length > 0 ? (
                todayAttendance.map((record, idx) => {
                  const classInfo = classes.find(c => c.id === record.classId);
                  const studentRecord = record.records.find(r => r.studentId === user?.id);
                  
                  return studentRecord ? (
                    <div key={idx} className="flex items-center justify-between p-2 border-b last:border-b-0">
                      <div>
                        <div className="font-medium">Class {classInfo?.name}</div>
                        <div className="text-sm text-gray-500">{classInfo?.department}</div>
                      </div>
                      <div>
                        <span className={`badge badge-${studentRecord.status}`}>
                          {studentRecord.status.charAt(0).toUpperCase() + studentRecord.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ) : null;
                })
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <ClipboardList className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                  <p>No attendance records for today</p>
                </div>
              )}
              
              <Link to="/attendance/history" className="btn btn-outline btn-sm w-full mt-4">
                View Full History
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {isTeacher && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Attendance</h2>
            <Link to="/attendance/history" className="text-primary-500 text-sm hover:underline">
              View All
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Present
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Absent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Late
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceRecords
                  .filter(record => 
                    relevantClasses.some(cls => cls.id === record.classId)
                  )
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 5)
                  .map(record => {
                    const statuses = record.records.reduce(
                      (acc, curr) => {
                        acc[curr.status]++;
                        return acc;
                      }, 
                      { present: 0, absent: 0, late: 0, excused: 0 }
                    );
                    
                    const classInfo = classes.find(c => c.id === record.classId);
                    
                    return (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {format(parseISO(record.date), 'MMMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {classInfo?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {classInfo?.department || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-success">
                          {statuses.present}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-danger">
                          {statuses.absent}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-warning">
                          {statuses.late}
                        </td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;