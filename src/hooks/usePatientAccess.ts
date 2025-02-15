// hooks/usePatientAccess.ts
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAccessToken } from './useAccessToken';

interface DoctorFileAccess {
    medical_record_id: string;
    access_url: string;
    expires_at: string;
}

export function usePatientAccess() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { createAccessToken } = useAccessToken();

    const getPatientByHealthId = async (healthId: string) => {
        try {
            setLoading(true);
            setError(null);

            // Find patient
            const { data: patient, error: patientError } = await supabase
                .from('profiles')
                .select('id, name, health_id')
                .eq('health_id', healthId)
                .single();

            if (patientError || !patient) {
                return { success: false, message: 'Patient not found' };
            }

            // Get current doctor's ID
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { success: false, message: 'Not authenticated' };
            }

            // Create access token
            const { token } = await createAccessToken(user.id, patient.id);
            if (!token) {
                return { success: false, message: 'Failed to create access token' };
            }

            // Generate file access links
            const { error: generateError } = await supabase
                .rpc('generate_doctor_file_access', {
                    p_doctor_id: user.id,
                    p_patient_id: patient.id,
                    p_access_token_id: token.id
                });

            if (generateError) throw generateError;

            // Get medical records with access URLs
            const { data: accessLinks } = await supabase
                .from('doctor_file_access')
                .select(`
                    medical_record_id,
                    access_url,
                    expires_at,
                    medical_records (
                        file_name,
                        description,
                        created_at
                    )
                `)
                .eq('doctor_id', user.id)
                .eq('access_token_id', token.id);

            return {
                success: true,
                message: 'Access granted',
                patient,
                accessToken: token.id,
                records: accessLinks || []
            };

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            return { success: false, message: 'Error accessing records' };
        } finally {
            setLoading(false);
        }
    };

    return {
        getPatientByHealthId,
        loading,
        error
    };
}