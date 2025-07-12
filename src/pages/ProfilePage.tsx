import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AtSign, BookOpen, Calendar, Camera, Mail, Phone, User } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state would be initialized with user data
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '123-456-7890', // Mock data
    password: '',
    confirmPassword: '',
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    // In a real app, this would call an API to update the profile
    toast.success('Profile updated successfully');
    setIsEditing(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600">View and edit your profile information</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="card flex flex-col items-center text-center p-8">
          <div className="relative">
            <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-md">
              <img 
                src={user?.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'} 
                alt={user?.name} 
                className="h-full w-full object-cover"
              />
            </div>
            <button 
              className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full shadow-lg hover:bg-primary-600 transition-colors"
              onClick={() => toast('Feature not available in demo', { icon: '📷' })}
            >
              <Camera size={16} />
            </button>
          </div>
          
          <h2 className="mt-4 text-xl font-semibold">{user?.name}</h2>
          <p className="text-gray-500 capitalize">{user?.role}</p>
          
          {user?.role === 'student' && (
            <div className="mt-4 flex flex-col items-center">
              <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium mb-2">
                Class {user.class}
              </div>
              <div className="text-sm text-gray-500">
                Student ID: {(user as any).studentId}
              </div>
            </div>
          )}
          
          {user?.role === 'teacher' && (
            <div className="mt-4 w-full">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Subjects</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {(user as any).subjects?.map((subject: string, idx: number) => (
                  <div 
                    key={idx}
                    className="bg-secondary-50 text-secondary-700 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {subject}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="mt-6 btn btn-outline w-full"
            >
              Edit Profile
            </button>
          )}
        </div>
        
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="card">
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <h2 className="text-xl font-semibold mb-6">Edit Profile</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User size={16} className="text-gray-400" />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="input pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={16} className="text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="input pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone size={16} className="text-gray-400" />
                      </div>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="input pl-10"
                      />
                    </div>
                  </div>
                  
                  <h3 className="font-medium mt-6">Change Password</h3>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Leave blank to keep current password"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Leave blank to keep current password"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm text-gray-500 mb-1">Full Name</h3>
                      <div className="flex items-center gap-2">
                        <User size={18} className="text-gray-400" />
                        <p className="font-medium text-gray-900">{user?.name}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm text-gray-500 mb-1">Email Address</h3>
                      <div className="flex items-center gap-2">
                        <Mail size={18} className="text-gray-400" />
                        <p className="font-medium text-gray-900">{user?.email}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm text-gray-500 mb-1">Role</h3>
                      <div className="flex items-center gap-2">
                        <AtSign size={18} className="text-gray-400" />
                        <p className="font-medium text-gray-900 capitalize">{user?.role}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm text-gray-500 mb-1">Joined Date</h3>
                      <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-gray-400" />
                        <p className="font-medium text-gray-900">January 15, 2023</p>
                      </div>
                    </div>
                  </div>
                  
                  {user?.role === 'student' && (
                    <div>
                      <h3 className="font-medium mb-4 pb-2 border-b">Academic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm text-gray-500 mb-1">Student ID</h3>
                          <p className="font-medium text-gray-900">{(user as any).studentId}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm text-gray-500 mb-1">Grade</h3>
                          <p className="font-medium text-gray-900">{user.grade}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm text-gray-500 mb-1">Class</h3>
                          <div className="flex items-center gap-2">
                            <BookOpen size={18} className="text-gray-400" />
                            <p className="font-medium text-gray-900">Class {user.class}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {user?.role === 'teacher' && (
                    <div>
                      <h3 className="font-medium mb-4 pb-2 border-b">Teaching Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm text-gray-500 mb-1">Subjects</h3>
                          <div className="flex flex-wrap gap-2">
                            {(user as any).subjects?.map((subject: string, idx: number) => (
                              <span 
                                key={idx}
                                className="bg-secondary-50 text-secondary-700 px-2 py-1 rounded-md text-sm"
                              >
                                {subject}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm text-gray-500 mb-1">Classes</h3>
                          <div className="flex flex-wrap gap-2">
                            {(user as any).classes?.map((className: string, idx: number) => (
                              <span 
                                key={idx}
                                className="bg-primary-50 text-primary-700 px-2 py-1 rounded-md text-sm"
                              >
                                Class {className}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;