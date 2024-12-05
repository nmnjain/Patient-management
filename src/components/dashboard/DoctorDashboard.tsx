import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../layout/Sidebar';
import MedicalRecordsList from '../medical/MedicalRecordsList';
import QRScanner from '../medical/QRScanner';
import DoctorProfileCard from '../profile/DoctorProfileCard';

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
            <div className="py-4">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <DoctorProfileCard />
                <QRScanner />
              </div>
              {/* <div className="mt-4">
                <MedicalRecordsList />
              </div> */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}