import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginForm from './components/auth/LoginForm';
import PatientRegistration from './components/auth/PatientRegistration';
import DoctorRegistration from './components/auth/DoctorRegistration';
import PatientDashboard from './components/dashboard/PatientDashboard';
import DoctorDashboard from './components/dashboard/DoctorDashboard';
import ProtectedRoute from './components/common/ProtectedRoute';
import MedicalRecordsPage from './components/medical/MedicalRecordPage';
import ProfilePage from './components/profile/ProfilePage';
import { useAuth } from './context/AuthContext';
import DoctorProfilePage from './components/profile/DoctorProfilePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register/patient" element={<PatientRegistration />} />
          <Route path="/register/doctor" element={<DoctorRegistration />} />
          
          {/* Patient Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/medical-records" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <MedicalRecordsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <ProfilePage />
            </ProtectedRoute>
          } />

          {/* Doctor Routes */}
          <Route path="/doctor/dashboard" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/doctor/profile" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorProfilePage />
            </ProtectedRoute>
          } />

          {/* Role-based Dashboard Redirect */}
          <Route path="/" element={
            <ProtectedRoute allowedRoles={['patient', 'doctor']}>
              <RoleBasedRedirect />
            </ProtectedRoute>
          } />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Helper component to redirect based on user role
function RoleBasedRedirect() {
  const { user } = useAuth();
  
  React.useEffect(() => {
    if (user?.role === 'doctor') {
      window.location.href = '/doctor/dashboard';
    } else if (user?.role === 'patient') {
      window.location.href = '/dashboard';
    }
  }, [user]);

  return null;
}

export default App;