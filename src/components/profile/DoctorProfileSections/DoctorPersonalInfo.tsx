import React from 'react';
import { ProfileField } from '../ProfileField';
import { ProfileSectionProps } from '../../../types/profile';

export function DoctorPersonalInfo({ profile, isEditing, onChange }: ProfileSectionProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProfileField label="Name">
                {isEditing ? (
                    <input
                        type="text"
                        name="name"
                        value={profile?.name || ''}
                        onChange={(e) => onChange('name', e.target.value)}
                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 animate-pulse"
                    />
                ) : (
                    <p className="text-gray-900">{profile?.name}</p>
                )}
            </ProfileField>

            <ProfileField label="Email">
                <p className="text-gray-900">{profile?.email}</p>
            </ProfileField>

            <ProfileField label="Registration Number">
                {isEditing ? (
                    <input
                        type="text"
                        name="registration_number"
                        value={profile?.registration_number || ''}
                        onChange={(e) => onChange('registration_number', e.target.value)}
                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 animate-pulse"
                    />
                ) : (
                    <p className="text-gray-900">{profile?.registration_number}</p>
                )}
            </ProfileField>

            <ProfileField label="Experience (Years)">
                {isEditing ? (
                    <input
                        type="number"
                        name="experience"
                        value={profile?.experience || ''}
                        onChange={(e) => onChange('experience', parseInt(e.target.value))}
                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 animate-pulse"
                        min="0"
                    />
                ) : (
                    <p className="text-gray-900">{profile?.experience} years</p>
                )}
            </ProfileField>
        </div>
    );
}