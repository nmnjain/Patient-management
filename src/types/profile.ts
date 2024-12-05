export interface Profile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  phone_verified: boolean;
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  allergies?: string[];
  medical_history?: string;
  emergency_contact?: string;
  insurance_info?: {
    hasInsurance: boolean;
    details: string;
  };
  chronic_conditions?: string[];
  vaccination_status?: string[];
  address?: string;
  health_id?: string;
}

export interface ProfileSectionProps {
  profile: Profile | null;
  isEditing: boolean;
  onChange: (name: string, value: any) => void;
  setProfile?: (profile: Profile | null) => void;
}
