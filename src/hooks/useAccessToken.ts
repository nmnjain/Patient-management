// hooks/useAccessToken.ts
import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface AccessToken {
  id: string;
  doctor_id: string;
  patient_id: string;
  expires_at: string;
  created_at: string;
}

interface AccessTokenResponse {
  success: boolean;
  message: string;
  token?: AccessToken;
}

export function useAccessToken() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAccessToken = async (doctorId: string, patientId: string): Promise<AccessTokenResponse> => {
    try {
      setLoading(true);
      setError(null);

      // Check for existing valid token
      const { data: existingToken, error: existingTokenError } = await supabase
        .from('access_tokens')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('patient_id', patientId)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (existingTokenError && existingTokenError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw existingTokenError;
      }

      if (existingToken) {
        return {
          success: true,
          message: 'Existing valid token found',
          token: existingToken
        };
      }

      // Create new token with 8-hour expiration
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 8);

      const { data: newToken, error: createError } = await supabase
        .from('access_tokens')
        .insert({
          doctor_id: doctorId,
          patient_id: patientId,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (createError) throw createError;

      return {
        success: true,
        message: 'New access token created',
        token: newToken
      };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create access token';
      setError(message);
      return {
        success: false,
        message
      };
    } finally {
      setLoading(false);
    }
  };

  const validateAccessToken = async (tokenId: string): Promise<AccessTokenResponse> => {
    try {
      setLoading(true);
      setError(null);

      const { data: token, error } = await supabase
        .from('access_tokens')
        .select('*')
        .eq('id', tokenId)
        .single();

      if (error) throw error;

      const isValid = new Date(token.expires_at) > new Date();

      return {
        success: isValid,
        message: isValid ? 'Token is valid' : 'Token has expired',
        token: isValid ? token : undefined
      };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to validate token';
      setError(message);
      return {
        success: false,
        message
      };
    } finally {
      setLoading(false);
    }
  };

  const revokeAccessToken = async (tokenId: string): Promise<AccessTokenResponse> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('access_tokens')
        .delete()
        .eq('id', tokenId);

      if (error) throw error;

      return {
        success: true,
        message: 'Access token revoked successfully'
      };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to revoke token';
      setError(message);
      return {
        success: false,
        message
      };
    } finally {
      setLoading(false);
    }
  };

  const getActiveTokens = async (doctorId: string): Promise<AccessToken[]> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('access_tokens')
        .select(`
          id,
          doctor_id,
          patient_id,
          expires_at,
          created_at,
          profiles:patient_id (
            name,
            health_id
          )
        `)
        .eq('doctor_id', doctorId)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch active tokens';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const cleanupExpiredTokens = async (): Promise<void> => {
    try {
      const { error } = await supabase
        .from('access_tokens')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) throw error;
    } catch (err) {
      console.error('Failed to cleanup expired tokens:', err);
    }
  };

  return {
    createAccessToken,
    validateAccessToken,
    revokeAccessToken,
    getActiveTokens,
    cleanupExpiredTokens,
    loading,
    error
  };
}