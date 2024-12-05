import { supabase } from '../lib/supabase';

export function useAccessToken() {
  const createAccessToken = async (doctorId: string, patientId: string) => {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24-hour access

      const { data, error } = await supabase
        .from('access_tokens')
        .insert({
          doctor_id: doctorId,
          patient_id: patientId,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  };

  const validateAccessToken = async (tokenId: string) => {
    try {
      const { data, error } = await supabase
        .from('access_tokens')
        .select('*')
        .eq('id', tokenId)
        .single();

      if (error) throw error;

      const isValid = new Date(data.expires_at) > new Date();
      return { isValid, data };
    } catch (error) {
      throw error;
    }
  };

  return {
    createAccessToken,
    validateAccessToken,
  };
}