import { useProfile } from '../../hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { User2, GraduationCap, Mail, Phone, Building2, Clock } from 'lucide-react';

export default function DoctorProfileCard() {
  const { profile, loading } = useProfile();
  const navigate = useNavigate();

  const handleEditProfile = () => {
    navigate('/doctor/profile');
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600" />
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center">
        <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center">
          {profile?.profile_picture ? (
            <img 
              src={profile.profile_picture} 
              alt={profile?.name || 'Doctor profile'} 
              className="h-16 w-16 object-cover rounded-full"
            />
          ) : (
            <User2 className="h-8 w-8 text-gray-500" />
          )}
        </div>
        <div className="ml-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Dr. {profile?.name || 'Unknown Doctor'}
          </h2>
          <p className="text-sm text-gray-500">
            Reg. No: {profile?.registration_number || 'Not available'}
          </p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4">
        <div className="flex items-start">
          <GraduationCap className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
          <span className="text-sm text-gray-600">
            {profile?.specialization || 'Specialization not specified'}
          </span>
        </div>
        <div className="flex items-start">
          <Mail className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
          <span className="text-sm text-gray-600 break-all">
            {profile?.email || 'Email not available'}
          </span>
        </div>
        <div className="flex items-start">
          <Phone className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
          <span className="text-sm text-gray-600">
            {profile?.phone || 'Phone not available'}
          </span>
        </div>
        <div className="flex items-start">
          <Building2 className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
          <div>
            <span className="text-sm text-gray-600 block">
              {profile?.clinic_name || 'Clinic not specified'}
            </span>
            {profile?.clinic_address && (
              <span className="text-xs text-gray-500 mt-1 block">
                {profile.clinic_address}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-start">
          <Clock className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
          <span className="text-sm text-gray-600">
            {profile?.working_hours || 'Working hours not specified'}
          </span>
        </div>
        {profile?.experience && (
          <div className="flex items-start">
            <span className="text-sm text-gray-600 block">
              <span className="font-medium">Experience:</span> {profile.experience} years
            </span>
          </div>
        )}
      </div>
      <div className="mt-6">
        <button 
          onClick={handleEditProfile}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}