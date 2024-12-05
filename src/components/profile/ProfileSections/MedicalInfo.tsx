import React from 'react';
import { ProfileField } from '../ProfileField';
import { ProfileSectionProps } from '../../../types/profile';
import Select from 'react-select';

// Define allergy options
const ALLERGY_OPTIONS = [
  { value: 'respiratory', label: 'Respiratory Allergies (pollen, dust mites, mold, animal dander)' },
  { value: 'skin', label: 'Skin Allergies (eczema, hives, contact dermatitis)' },
  { value: 'food', label: 'Food Allergies (peanuts, shellfish, milk, eggs)' },
  { value: 'drug', label: 'Drug Allergies (antibiotics, aspirin)' },
  { value: 'insect', label: 'Insect Allergies (bee stings, wasp stings, mosquito bites)' },
  { value: 'seasonal', label: 'Seasonal Allergies (pollen, mold)' },
  { value: 'anaphylaxis', label: 'Anaphylaxis (severe reactions)' },
  { value: 'environmental', label: 'Environmental Allergies (pollutants, smoke, chemicals)' },
  { value: 'occupational', label: 'Occupational Allergies (latex, industrial chemicals)' },
  { value: 'biological', label: 'Allergies to Biological Substances (vaccines, pet dander)' }
];

const CHRONIC_CONDITIONS_OPTIONS = [
  // Cardiovascular Diseases
  { value: 'heart_disease', label: 'Heart Disease' },
  { value: 'hypertension', label: 'Hypertension (High Blood Pressure)' },
  { value: 'stroke', label: 'Stroke' },

  // Diabetes
  { value: 'diabetes_type1', label: 'Type 1 Diabetes' },
  { value: 'diabetes_type2', label: 'Type 2 Diabetes' },
  { value: 'gestational_diabetes', label: 'Gestational Diabetes' },

  // Respiratory Diseases
  { value: 'asthma', label: 'Asthma' },
  { value: 'copd', label: 'COPD (Chronic Obstructive Pulmonary Disease)' },

  // Cancer
  { value: 'lung_cancer', label: 'Lung Cancer' },
  { value: 'colorectal_cancer', label: 'Colorectal Cancer' },
  { value: 'breast_cancer', label: 'Breast Cancer' },
  { value: 'prostate_cancer', label: 'Prostate Cancer' },

  // Arthritis
  { value: 'osteoarthritis', label: 'Osteoarthritis' },
  { value: 'rheumatoid_arthritis', label: 'Rheumatoid Arthritis' },

  // Kidney Disease
  { value: 'chronic_kidney_disease', label: 'Chronic Kidney Disease' },

  // Weight-related
  { value: 'obesity', label: 'Obesity' },

  // Mental Health
  { value: 'depression', label: 'Depression' },
  { value: 'anxiety', label: 'Anxiety' },

  // Neurological Conditions
  { value: 'alzheimers', label: 'Alzheimer\'s Disease' },
  { value: 'dementia', label: 'Dementia' },
  { value: 'multiple_sclerosis', label: 'Multiple Sclerosis' },
  { value: 'epilepsy', label: 'Epilepsy' },

  // Pain Syndromes
  { value: 'fibromyalgia', label: 'Fibromyalgia' },
  { value: 'chronic_back_pain', label: 'Chronic Back Pain' }
];

const VACCINATION_OPTIONS = [
  // Vaccines for Infants and Children
  { value: 'bcg', label: 'BCG (Bacillus Calmette-Guérin) - Tuberculosis' },
  { value: 'dpt', label: 'DPT (Diphtheria, Pertussis, Tetanus)' },
  { value: 'opv', label: 'OPV (Oral Polio Vaccine)' },
  { value: 'hepb', label: 'Hepatitis B' },
  { value: 'rotavirus', label: 'Rotavirus Vaccine' },
  { value: 'pcv', label: 'PCV (Pneumococcal Conjugate Vaccine)' },
  { value: 'mr', label: 'Measles and Rubella Vaccine (MR)' },
  { value: 'pentavalent', label: 'Pentavalent (DPT, Hepatitis B, Hib)' },
  { value: 'je', label: 'Japanese Encephalitis (JE)' },
  { value: 'vitamin_a', label: 'Vitamin A Supplementation' },

  // Vaccines for Adolescents and Adults
  { value: 'td', label: 'Tetanus-Diphtheria (Td) Booster' },
  { value: 'hpv', label: 'HPV (Human Papillomavirus)' },
  { value: 'tdap', label: 'Tdap (Tetanus, Diphtheria, Pertussis)' },

  // COVID-19 Vaccines
  { value: 'covid19', label: 'COVID-19' },

  // Additional Recommended Vaccines
  { value: 'typhoid', label: 'Typhoid' },
  { value: 'hepa', label: 'Hepatitis A' },
  { value: 'flu', label: 'Influenza (Flu)' },
  { value: 'meningococcal', label: 'Meningococcal' },
  { value: 'varicella', label: 'Varicella (Chickenpox)' },
  { value: 'rabies', label: 'Rabies' },
  { value: 'mmr', label: 'MMR (Measles, Mumps, Rubella)' },
  { value: 'pneumonia', label: 'Pneumococcal (Adult)' },
  { value: 'zoster', label: 'Zoster (Shingles)' }
];

export function MedicalInfo({ profile, isEditing, onChange }: ProfileSectionProps) {
  // Helper function to ensure we always have an array and clean the data
  const ensureArray = (value: any): string[] => {
    if (!value) return [];
    if (typeof value === 'string') {
      // Handle string that might be a stringified array
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.map(item => item.replace(/["\[\]]/g, '')) : [value];
      } catch {
        return [value];
      }
    }
    if (Array.isArray(value)) {
      return value.map(item => {
        if (typeof item === 'string') {
          return item.replace(/["\[\]]/g, '');
        }
        return String(item);
      });
    }
    return [];
  };

  // Helper function to get selected options for react-select
  const getSelectedOptions = (options: any[], values: any) => {
    const valueArray = ensureArray(values);
    return options.filter(option => valueArray.includes(option.value));
  };

  // Helper function to handle select changes
  const handleSelectChange = (name: string, selected: any) => {
    const values = selected ? selected.map((option: any) => option.value) : [];
    onChange(name, values);
  };

  // Clean the data before using it
  const chronicConditions = ensureArray(profile?.chronic_conditions);
  const allergies = ensureArray(profile?.allergies);
  const vaccinations = ensureArray(profile?.vaccination_status);

  return (
    <div className="space-y-4">
      <ProfileField label="Blood Group">
        {isEditing ? (
          <select
            name="blood_group"
            value={profile?.blood_group || ''}
            onChange={(e) => onChange('blood_group', e.target.value)}
            className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        ) : (
          <p className="text-gray-900">{profile?.blood_group || 'Not specified'}</p>
        )}
      </ProfileField>

      <ProfileField label="Chronic Conditions">
        {isEditing ? (
          <Select
            isMulti
            name="chronic_conditions"
            options={CHRONIC_CONDITIONS_OPTIONS}
            value={CHRONIC_CONDITIONS_OPTIONS.filter(option => 
              chronicConditions.includes(option.value)
            )}
            onChange={(selected) => handleSelectChange('chronic_conditions', selected)}
            className="basic-multi-select"
            classNamePrefix="select"
            placeholder="Select chronic conditions..."
          />
        ) : (
          <div className="space-y-1">
            {chronicConditions.length > 0 ? (
              chronicConditions.map(condition => (
                <div key={condition} className="text-gray-900">
                  • {CHRONIC_CONDITIONS_OPTIONS.find(opt => opt.value === condition)?.label || condition}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No chronic conditions listed</p>
            )}
          </div>
        )}
      </ProfileField>

      <ProfileField label="Allergies">
        {isEditing ? (
          <Select
            isMulti
            name="allergies"
            options={ALLERGY_OPTIONS}
            value={getSelectedOptions(ALLERGY_OPTIONS, profile?.allergies)}
            onChange={(selected) => handleSelectChange('allergies', selected)}
            className="basic-multi-select"
            classNamePrefix="select"
            placeholder="Select allergies..."
            defaultValue={getSelectedOptions(ALLERGY_OPTIONS, profile?.allergies)}
          />
        ) : (
          <div className="space-y-1">
            {ensureArray(profile?.allergies).length > 0 ? (
              ensureArray(profile?.allergies).map(allergy => (
                <div key={allergy} className="text-gray-900">
                  • {ALLERGY_OPTIONS.find(opt => opt.value === allergy)?.label || allergy}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No allergies listed</p>
            )}
          </div>
        )}
      </ProfileField>

      <ProfileField label="Vaccinations">
        {isEditing ? (
          <Select
            isMulti
            name="vaccination_status"
            options={VACCINATION_OPTIONS}
            value={VACCINATION_OPTIONS.filter(option => 
              vaccinations.includes(option.value)
            )}
            onChange={(selected) => handleSelectChange('vaccination_status', selected)}
            className="basic-multi-select"
            classNamePrefix="select"
            placeholder="Select vaccinations..."
          />
        ) : (
          <div className="space-y-1">
            {vaccinations.length > 0 ? (
              vaccinations.map(vaccination => (
                <div key={vaccination} className="text-gray-900">
                  • {VACCINATION_OPTIONS.find(opt => opt.value === vaccination)?.label || vaccination}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No vaccinations reported</p>
            )}
          </div>
        )}
      </ProfileField>

      <ProfileField label="Medical History">
        {isEditing ? (
          <textarea
            name="medical_history"
            value={profile?.medical_history || ''}
            onChange={(e) => onChange('medical_history', e.target.value)}
            rows={4}
            className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your medical history..."
          />
        ) : (
          <p className="text-gray-900 whitespace-pre-line">
            {profile?.medical_history || 'No medical history provided'}
          </p>
        )}
      </ProfileField>
    </div>
  );
}
