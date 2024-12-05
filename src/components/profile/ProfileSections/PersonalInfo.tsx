import React from 'react';
import { ProfileField } from '../ProfileField';
import { ProfileSectionProps } from '../../../types/profile';

export function PersonalInfo({ profile, isEditing, onChange }: ProfileSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ProfileField label="Name">
        {isEditing ? (
          <input
            type="text"
            name="name"
            value={profile?.name || ''}
            onChange={(e) => onChange('name', e.target.value)}
            className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
          />
        ) : (
          <p className="text-gray-900">{profile?.name}</p>
        )}
      </ProfileField>

      <ProfileField label="Email">
        <p className="text-gray-900">{profile?.email}</p>
      </ProfileField>

      <ProfileField label="Date of Birth">
        {isEditing ? (
          <input
            type="date"
            name="date_of_birth"
            value={profile?.date_of_birth || ''}
            onChange={(e) => onChange('date_of_birth', e.target.value)}
            className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
          />
        ) : (
          <p className="text-gray-900">{profile?.date_of_birth}</p>
        )}
      </ProfileField>

      <ProfileField label="Gender">
        {isEditing ? (
          <select
            name="gender"
            value={profile?.gender || ''}
            onChange={(e) => onChange('gender', e.target.value)}
            className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        ) : (
          <p className="text-gray-900">{profile?.gender}</p>
        )}
      </ProfileField>
    </div>
  );
}
