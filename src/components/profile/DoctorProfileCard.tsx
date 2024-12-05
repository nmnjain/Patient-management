import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User2, Mail, Phone, Building2, GraduationCap, Clock } from 'lucide-react';

export default function DoctorProfileCard() {
  const { user } = useAuth();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center">
        <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center">
          <User2 className="h-8 w-8 text-gray-500" />
        </div>
        <div className="ml-4">
          <h2 className="text-xl font-semibold text-gray-900">Dr. {user?.name}</h2>
          <p className="text-sm text-gray-500">Reg. No: {user?.registrationNumber}</p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4">
        <div className="flex items-center">
          <GraduationCap className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm text-gray-600">Cardiologist</span>
        </div>
        <div className="flex items-center">
          <Mail className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm text-gray-600">{user?.email}</span>
        </div>
        <div className="flex items-center">
          <Phone className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm text-gray-600">+1 234 567 8900</span>
        </div>
        <div className="flex items-center">
          <Building2 className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm text-gray-600">City Hospital</span>
        </div>
        <div className="flex items-center">
          <Clock className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm text-gray-600">Mon-Fri, 9:00 AM - 5:00 PM</span>
        </div>
      </div>
      <div className="mt-6">
        <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Edit Profile
        </button>
      </div>
    </div>
  );
}