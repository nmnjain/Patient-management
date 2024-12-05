import React, { useState } from 'react';
import { UserCircle, Edit2, Save, Copy, Check } from 'lucide-react';
import Sidebar from '../layout/Sidebar';
import { useProfile } from '../../hooks/useProfile';
import { ProfileSection } from './ProfileSection';
import { PersonalInfo, MedicalInfo, ContactInfo } from './ProfileSections';

export default function ProfilePage() {
  const {
    profile,
    setProfile,
    loading,
    isEditing,
    setIsEditing,
    updateProfile
  } = useProfile();

  const [copySuccess, setCopySuccess] = useState(false);

  const handleChange = (name: string, value: any) => {
    if (!profile) return;
    setProfile(prev => {
      if (!prev) return null;
      // For array fields, merge with existing values
      if (['chronic_conditions', 'allergies', 'vaccination_status'].includes(name)) {
        return {
          ...prev,
          [name]: Array.isArray(value) ? value : []
        };
      }
      // For other fields
      return {
        ...prev,
        [name]: value
      };
    });
  };

  const handleSave = async () => {
    if (!profile) return;
    const success = await updateProfile(profile);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCopyHealthId = async () => {
    if (profile?.health_id) {
      try {
        await navigator.clipboard.writeText(profile.health_id);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy health ID:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6">
        <div className="h-16 lg:hidden" />
        
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <UserCircle className="h-8 w-8 text-indigo-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
            </div>
            <button
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium
                ${isEditing 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                } transition-colors duration-200`}
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </>
              )}
            </button>
          </div>
  
          {/* Profile Sections */}
          <div className="space-y-6">
            <ProfileSection title="Personal Information">
              <PersonalInfo 
                profile={profile} 
                isEditing={isEditing} 
                onChange={handleChange}
              />
            </ProfileSection>
  
            {/* Move Health ID Section here */}
            <ProfileSection title="Health ID">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={profile?.health_id || 'N/A'}
                  readOnly
                  className="flex-1 bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 sm:text-sm cursor-not-allowed"
                />
                <button
                  onClick={handleCopyHealthId}
                  className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  title="Copy Health ID"
                >
                  {copySuccess ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>
              {copySuccess && (
                <p className="text-sm text-green-500 mt-1">
                  Health ID copied to clipboard!
                </p>
              )}
            </ProfileSection>
  
            <ProfileSection title="Medical Information">
              <MedicalInfo 
                profile={profile} 
                isEditing={isEditing} 
                onChange={handleChange}
              />
            </ProfileSection>
  
            <ProfileSection title="Contact & Emergency">
              <ContactInfo 
                profile={profile} 
                isEditing={isEditing} 
                onChange={handleChange}
              />
            </ProfileSection>
          </div>
        </div>
      </main>
    </div>
  );
}
