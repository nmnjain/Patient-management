export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'patient' | 'doctor'
          name: string
          email: string
          health_id?: string
          registration_number?: string
          specialization?: string
          experience?: number
          clinic_name?: string
          clinic_address?: string
          working_hours?: string
          blood_group?: string
          date_of_birth?: string
          gender?: string
          allergies?: string[]
          emergency_contact?: string
          profile_picture?: string
          created_at: string
          updated_at: string
          phone?: string
        }
        Insert: {
          id: string
          role: 'patient' | 'doctor'
          name: string
          email: string
          health_id?: string
          registration_number?: string
          specialization?: string
          experience?: number
          clinic_name?: string
          clinic_address?: string
          working_hours?: string
          blood_group?: string
          date_of_birth?: string
          gender?: string
          allergies?: string[]
          emergency_contact?: string
          profile_picture?: string
        }
        Update: {
          id?: string
          role?: 'patient' | 'doctor'
          name?: string
          email?: string
          health_id?: string
          registration_number?: string
          specialization?: string
          experience?: number
          clinic_name?: string
          clinic_address?: string
          working_hours?: string
          blood_group?: string
          date_of_birth?: string
          gender?: string
          allergies?: string[]
          emergency_contact?: string
          profile_picture?: string
        }
      }
      medical_records: {
        Row: {
          id: string
          patient_id: string
          doctor_id?: string
          file_name: string
          file_url: string
          file_type: string
          file_size: number
          created_at: string
          updated_at: string
        }
        Insert: {
          patient_id: string
          doctor_id?: string
          file_name: string
          file_url: string
          file_type: string
          file_size: number
        }
        Update: {
          patient_id?: string
          doctor_id?: string
          file_name?: string
          file_url?: string
          file_type?: string
          file_size?: number
        }
      }
      access_tokens: {
        Row: {
          id: string
          doctor_id: string
          patient_id: string
          expires_at: string
          created_at: string
        }
        Insert: {
          doctor_id: string
          patient_id: string
          expires_at: string
        }
        Update: {
          doctor_id?: string
          patient_id?: string
          expires_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}