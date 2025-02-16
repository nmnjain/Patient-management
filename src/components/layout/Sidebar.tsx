import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  UserCircle,
  LogOut,
  Menu,
  Heart,
} from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-16 bg-gray-50 z-40 lg:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="absolute top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg hover:bg-gray-50 lg:hidden"
          aria-label="Toggle Menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <div
        className={`fixed inset-y-0 left-0 transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 bg-white shadow-lg transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:w-64 z-30`}
      >
        <div className="p-4 overflow-y-auto h-full">
          <div className="flex items-center space-x-2 mb-6 pt-2 lg:pt-0">
            <Heart className="h-8 w-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">HealthSync</span>
          </div>
          
          <nav className="space-y-1">
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 hover:bg-[#34495E] hover:text-white"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            
            <Link 
              to="/medical-records" 
              className="flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 hover:bg-[#34495E] hover:text-white"
            >
              <FileText className="h-5 w-5" />
              <span>Medical Records</span>
            </Link>
            
            <Link 
              to="/profile" 
              className="flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 hover:bg-[#34495E] hover:text-white"
            >
              <UserCircle className="h-5 w-5" />
              <span>Profile</span>
            </Link>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 hover:bg-[#34495E] hover:text-white text-left"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </div>
    </>
  );
}