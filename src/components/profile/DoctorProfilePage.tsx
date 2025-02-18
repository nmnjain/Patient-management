import React, { useState } from 'react';
import { UserCircle, Edit2, Save } from 'lucide-react';
import Sidebar from '../layout/Sidebar';
import { useProfile } from '../../hooks/useProfile';
import { ProfileSection } from './ProfileSection';
import { DoctorPersonalInfo } from './DoctorProfileSections/DoctorPersonalInfo';
import { DoctorProfessionalInfo } from './DoctorProfileSections/DoctorProfessionalInfo';
import { DoctorContactInfo } from './DoctorProfileSections/DoctorContactInfo';

export default function DoctorProfilePage() {
    const {
        profile,
        setProfile,
        loading,
        isEditing,
        setIsEditing,
        updateProfile
    } = useProfile();

    const handleChange = (name: string, value: any) => {
        if (!profile) return;
        setProfile(prev => {
            if (!prev) return null;
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
                            <h1 className="text-2xl font-bold text-gray-900">Doctor Profile</h1>
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
                            <DoctorPersonalInfo
                                profile={profile}
                                isEditing={isEditing}
                                onChange={handleChange}
                            />
                        </ProfileSection>

                        <ProfileSection title="Professional Information">
                            <DoctorProfessionalInfo
                                profile={profile}
                                isEditing={isEditing}
                                onChange={handleChange}
                            />
                        </ProfileSection>

                        <ProfileSection title="Contact Information">
                            <DoctorContactInfo
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