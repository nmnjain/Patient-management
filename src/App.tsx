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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register/patient" element={<PatientRegistration />} />
          <Route path="/register/doctor" element={<DoctorRegistration />} />
          
          {/* Patient Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="patient">
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medical-records"
            element={
              <ProtectedRoute role="patient">
                <MedicalRecordsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute role="patient">
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Doctor Routes */}
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute role="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/profile"
            element={
              <ProtectedRoute role="doctor">
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/doctor/patients"
            element={
              <ProtectedRoute role="doctor">
                <PatientListPage />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path="/doctor/appointments"
            element={
              <ProtectedRoute role="doctor">
                <AppointmentsPage />
              </ProtectedRoute>
            }
          /> */}

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;