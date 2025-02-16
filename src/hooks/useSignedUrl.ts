import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useSignedUrl() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getSignedUrl = useCallback(async (filePath: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { signedUrl }, error } = await supabase.storage
        .from('medical-records')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) throw error;
      
      return signedUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get signed URL';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getSignedUrl, loading, error };
}