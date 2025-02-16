import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export function useStorage() {
  const uploadFile = async (
    file: File, 
    patientId: string, 
    metadata: { description: string; uploaded_by: 'patient' | 'doctor'; custom_file_name?: string }
  ) => {
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

      // Create a record in the medical_records table
      const { error: dbError } = await supabase
        .from('medical_records')
        .insert({
          patient_id: patientId,
          file_name: fileName,
          file_path: filePath,
          file_url: signedUrl, // Keep for backward compatibility
          file_type: file.type,
          file_size: Math.round(file.size / 1024),
          description: metadata.description,
          uploaded_by: metadata.uploaded_by
        });

      if (dbError) throw dbError;

    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  return { uploadFile };
}