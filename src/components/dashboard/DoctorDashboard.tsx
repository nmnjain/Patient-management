// pages/doctor/DoctorDashboard.tsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/layout/Sidebar';
import DoctorProfileCard from '../../components/profile/DoctorProfileCard';
import PatientAccessSection from '../../components/medical/PatientAccessSection';
import RecentPatientsAccess from './RecentPatientsAccess';

export default function DoctorDashboard() {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">Doctor Dashboard</h1>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="py-4 space-y-6">
              {/* Profile and Recent Patients Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <DoctorProfileCard />
                </div>
                <div className="lg:col-span-2">
                  <RecentPatientsAccess />
                </div>
              </div>
              
              {/* Patient Access Section */}
              <PatientAccessSection />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}