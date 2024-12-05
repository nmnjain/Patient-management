import React from 'react';
import { ProfileField } from '../ProfileField';
import { ProfileSectionProps } from '../../../types/profile';

export function ContactInfo({ profile, isEditing, onChange }: ProfileSectionProps) {
  return (
    <div className="space-y-4">
      <ProfileField label="Phone Number">
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <input
              type="tel"
              name="phone"
              value={profile?.phone || ''}
              onChange={(e) => onChange('phone', e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            />
          ) : (
            <>
              <p className="text-gray-900">{profile?.phone || 'No phone number provided'}</p>
              {profile?.phone_verified && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Verified
                </span>
              )}
            </>
          )}
        </div>
      </ProfileField>

      <ProfileField label="Emergency Contact">
        {isEditing ? (
          <input
            type="text"
            name="emergency_contact"
            value={profile?.emergency_contact || ''}
            onChange={(e) => onChange('emergency_contact', e.target.value)}
            className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Name and contact number"
          />
        ) : (
          <p className="text-gray-900">
            {profile?.emergency_contact || 'No emergency contact provided'}
          </p>
        )}
      </ProfileField>

      <ProfileField label="Address">
        {isEditing ? (
          <textarea
            name="address"
            value={profile?.address || ''}
            onChange={(e) => onChange('address', e.target.value)}
            rows={3}
            className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your full address"
          />
        ) : (
          <p className="text-gray-900 whitespace-pre-line">
            {profile?.address || 'No address provided'}
          </p>
        )}
      </ProfileField>
    </div>
  );
}
