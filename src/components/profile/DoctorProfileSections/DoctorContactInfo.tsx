import React from 'react';
import { ProfileField } from '../ProfileField';
import { ProfileSectionProps } from '../../../types/profile'; 

export function DoctorContactInfo({ profile, isEditing, onChange }: ProfileSectionProps) {
    return (
        <div className="space-y-4">
            <ProfileField label="Phone Number">
                {isEditing ? (
                    <input
                        type="tel"
                        name="phone"
                        value={profile?.phone || ''}
                        onChange={(e) => onChange('phone', e.target.value)}
                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 animate-pulse"
                        placeholder="+91XXXXXXXXXX"
                    />
                ) : (
                    <div className="flex items-center space-x-2">
                        <p className="text-gray-900">{profile?.phone || 'No phone number provided'}</p>
                        {profile?.phone_verified && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Verified
                            </span>
                        )}
                    </div>
                )}
            </ProfileField>

            <ProfileField label="Clinic Address">
                {isEditing ? (
                    <textarea
                        name="clinic_address"
                        value={profile?.clinic_address || ''}
                        onChange={(e) => onChange('clinic_address', e.target.value)}
                        rows={3}
                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 animate-pulse"
                        placeholder="Enter clinic address"
                    />
                ) : (
                    <p className="text-gray-900 whitespace-pre-line">
                        {profile?.clinic_address || 'No address provided'}
                    </p>
                )}
            </ProfileField>
        </div>
    );
}