// DoctorProfessionalInfo.tsx - Updated with animations and dropdown
import React from 'react';
import { ProfileField } from '../ProfileField';
import { ProfileSectionProps } from '../../../types/profile';
import { Check, ChevronDown } from 'lucide-react';

// Specialization options from the registration page
const SPECIALIZATION_OPTIONS = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Pediatrician',
  'Neurologist',
  'Psychiatrist',
  'Orthopedic',
  'Gynecologist',
  'ENT Specialist',
  'Ophthalmologist'
];

// Common working hours patterns
const WORKING_HOURS_OPTIONS = [
  'Mon-Fri: 9 AM - 5 PM',
  'Mon-Sat: 9 AM - 6 PM',
  'Mon-Fri: 10 AM - 7 PM',
  'Mon-Sat: 8 AM - 2 PM',
  'Mon-Sun: 10 AM - 6 PM',
  'Custom'
];

export function DoctorProfessionalInfo({ profile, isEditing, onChange }: ProfileSectionProps) {
  const [customWorkingHours, setCustomWorkingHours] = React.useState(false);
  const [specialDropdownOpen, setSpecialDropdownOpen] = React.useState(false);
  const [workingHoursDropdownOpen, setWorkingHoursDropdownOpen] = React.useState(false);

  // Set custom hours mode if the current value isn't in our predefined options
  React.useEffect(() => {
    if (profile?.working_hours && !WORKING_HOURS_OPTIONS.includes(profile.working_hours)) {
      setCustomWorkingHours(true);
    }
  }, [profile?.working_hours]);

  // Handle working hours selection
  const handleWorkingHoursSelect = (option: string) => {
    if (option === 'Custom') {
      setCustomWorkingHours(true);
      onChange('working_hours', profile?.working_hours || '');
    } else {
      setCustomWorkingHours(false);
      onChange('working_hours', option);
    }
    setWorkingHoursDropdownOpen(false);
  };

  return (
    <div className="space-y-4">
      <ProfileField label="Specialization">
        {isEditing ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setSpecialDropdownOpen(!specialDropdownOpen)}
              className="w-full text-left rounded-lg border border-gray-300 py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 flex items-center justify-between bg-white animate-pulse"
            >
              <span>{profile?.specialization || 'Select Specialization'}</span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>
            
            {specialDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                {SPECIALIZATION_OPTIONS.map((option) => (
                  <div
                    key={option}
                    className="px-4 py-2 hover:bg-indigo-50 cursor-pointer flex items-center"
                    onClick={() => {
                      onChange('specialization', option);
                      setSpecialDropdownOpen(false);
                    }}
                  >
                    {profile?.specialization === option && (
                      <Check className="h-4 w-4 text-indigo-600 mr-2" />
                    )}
                    <span className={profile?.specialization === option ? "font-medium" : ""}>
                      {option}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-900">{profile?.specialization}</p>
        )}
      </ProfileField>

      <ProfileField label="Clinic Name">
        {isEditing ? (
          <input
            type="text"
            name="clinic_name"
            value={profile?.clinic_name || ''}
            onChange={(e) => onChange('clinic_name', e.target.value)}
            className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 animate-pulse"
            placeholder="Enter clinic name"
          />
        ) : (
          <p className="text-gray-900">{profile?.clinic_name}</p>
        )}
      </ProfileField>

      <ProfileField label="Working Hours">
        {isEditing ? (
          <div className="space-y-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setWorkingHoursDropdownOpen(!workingHoursDropdownOpen)}
                className="w-full text-left rounded-lg border border-gray-300 py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 flex items-center justify-between bg-white animate-pulse"
              >
                <span>{customWorkingHours ? 'Custom' : (profile?.working_hours || 'Select Working Hours')}</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>
              
              {workingHoursDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                  {WORKING_HOURS_OPTIONS.map((option) => (
                    <div
                      key={option}
                      className="px-4 py-2 hover:bg-indigo-50 cursor-pointer flex items-center"
                      onClick={() => handleWorkingHoursSelect(option)}
                    >
                      {(!customWorkingHours && profile?.working_hours === option) && (
                        <Check className="h-4 w-4 text-indigo-600 mr-2" />
                      )}
                      <span className={(!customWorkingHours && profile?.working_hours === option) ? "font-medium" : ""}>
                        {option}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {customWorkingHours && (
              <input
                type="text"
                name="working_hours"
                value={profile?.working_hours || ''}
                onChange={(e) => onChange('working_hours', e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 mt-2 transition-all duration-300"
                placeholder="e.g., Mon-Fri: 9 AM - 5 PM"
              />
            )}
          </div>
        ) : (
          <p className="text-gray-900">{profile?.working_hours}</p>
        )}
      </ProfileField>
    </div>
  );
}