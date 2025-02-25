// useStorage.ts
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface UploadMetadata {
  description: string;
  uploaded_by: 'patient' | 'doctor';
  doctor_name?: string;
  doctor_id?: string;
  custom_file_name?: string;
  is_processed?: boolean;
}

interface UploadResult {
  recordId: string;
  filePath: string;
  fileUrl: string;
}

export function useStorage() {
  const uploadFile = async (
    file: File, 
    patientId: string, 
    metadata: UploadMetadata
  ): Promise<UploadResult> => {
    try {
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', patientId)
        .single();

      if (profileError || !profile) {
        throw new Error('Profile not found');
      }

      // Use custom filename if provided, otherwise generate a unique one
      const fileName = metadata.custom_file_name || `${uuidv4()}.${file.name.split('.').pop()}`;
      
      // Simplified path structure
      const filePath = `${patientId}/${fileName}`;

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('medical-records')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get initial signed URL for immediate use
      const { data: { signedUrl }, error: signedUrlError } = await supabase.storage
        .from('medical-records')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (signedUrlError) throw signedUrlError;

      // Create a record in the medical_records table and return the id
      const { data: recordData, error: dbError } = await supabase
        .from('medical_records')
        .insert({
            patient_id: patientId,
            doctor_id: metadata.doctor_id,
            doctor_name: metadata.doctor_name,
            file_name: fileName,
            file_path: filePath,
            file_url: signedUrl,
            file_type: file.type,
            file_size: Math.round(file.size / 1024),
            description: metadata.description,
            uploaded_by: metadata.uploaded_by,
            is_processed: metadata.is_processed || false
        })
        .select('id')
        .single();

      if (dbError) throw dbError;

      if (!recordData) throw new Error('Failed to create medical record');

      return {
        recordId: recordData.id,
        filePath: filePath,
        fileUrl: signedUrl
      };

    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  return { uploadFile };
}