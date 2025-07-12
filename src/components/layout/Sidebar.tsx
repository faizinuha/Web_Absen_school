import { 
  BookOpen, 
  CalendarDays, 
  ChevronDown, 
  ClipboardCheck, 
  Home, 
  LayoutDashboard, 
  LineChart, 
  Users 
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [attendanceOpen, setAttendanceOpen] = useState(false);

  // Only teachers (admins) can access student and class management
  const isTeacher = user?.role === 'teacher';

  const sidebarLinks = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard size={20} />,
      show: true,
    },
    {
      title: 'Attendance',
      icon: <ClipboardCheck size={20} />,
      children: [
        {
          title: 'Mark Attendance',
          href: '/attendance/manage',
          show: isTeacher, // Only teachers can mark attendance
        },
        {
          title: 'Attendance History',
          href: '/attendance/history',
          show: true, // Both teachers and students can view history
        },
      ],
      show: true,
    },
    {
      title: 'Classes',
      href: '/classes',
      icon: <BookOpen size={20} />,
      show: isTeacher, // Only teachers can manage classes
    },
    {
      title: 'Students',
      href: '/students',
      icon: <Users size={20} />,
      show: isTeacher, // Only teachers can manage students
    },
  ];

  const NavLink = ({ href, title, icon, active }: { href: string; title: string; icon: React.ReactNode; active: boolean }) => (
    <Link
      to={href}
      className={`flex items-center px-4 py-3 gap-3 rounded-lg ${
        active 
          ? 'bg-primary-50 text-primary-700' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
      onClick={() => {
        if (window.innerWidth < 1024) {
          onClose();
        }
      }}
    >
      {icon}
      <span>{title}</span>
    </Link>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-xl lg:shadow-none transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:sticky lg:top-0 lg:z-0 overflow-y-auto`}
      >
        <div className="p-6 flex items-center gap-2 border-b">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-school text-primary-500">
            <path d="m4 6 8-4 8 4"></path>
            <path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2"></path>
            <path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4"></path>
            <path d="M18 5v17"></path>
            <path d="M6 5v17"></path>
            <circle cx="12" cy="9" r="2"></circle>
          </svg>
          <h1 className="text-xl font-bold text-primary-600">Absen-School</h1>
        </div>

        <nav className="p-4 space-y-2">
          {sidebarLinks.map((link) => {
            if (!link.show) return null;
            
            if (link.children) {
              return (
                <div key={link.title}>
                  <button
                    className={`flex items-center justify-between w-full px-4 py-3 text-left gap-3 rounded-lg ${
                      link.children.some(child => child.href === pathname)
                        ? 'bg-primary-50 text-primary-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setAttendanceOpen(!attendanceOpen)}
                  >
                    <div className="flex items-center gap-3">
                      {link.icon}
                      <span>{link.title}</span>
                    </div>
                    <ChevronDown 
                      size={16} 
                      className={`transition-transform ${attendanceOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  
                  {attendanceOpen && (
                    <div className="pl-10 mt-1 space-y-1">
                      {link.children
                        .filter(child => child.show)
                        .map(child => (
                          <Link
                            key={child.title}
                            to={child.href}
                            className={`block py-2 px-4 rounded-md text-sm ${
                              child.href === pathname 
                                ? 'bg-primary-50 text-primary-600' 
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            onClick={() => {
                              if (window.innerWidth < 1024) {
                                onClose();
                              }
                            }}
                          >
                            {child.title}
                          </Link>
                        ))}
                    </div>
                  )}
                </div>
              );
            }
            
            return (
              <NavLink 
                key={link.title}
                href={link.href}
                title={link.title}
                icon={link.icon}
                active={link.href === pathname}
              />
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;