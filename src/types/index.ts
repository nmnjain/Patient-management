export interface User {
  id: string;
  role: 'patient' | 'doctor';
  name: string;
  email: string;
  healthId?: string;
  registrationNumber?: string;
}

export interface PatientProfile extends User {
  role: 'patient';
  date_of_birth: string;
  gender: string;
  blood_group: string;
  allergies: string[];
  emergency_contact: string;
  profilePicture?: string;
  phone: string;
  healthId?: string;
}

export interface DoctorProfile extends User {
  role: 'doctor';
  specialization: string;
  experience: number;
  clinicName: string;
  clinicAddress: string;
  workingHours: string;
  rating: number;
  profilePicture?: string;
  verified: boolean;
}