import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  role: string;
  name: string;
  email: string;
  healthId: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; redirectTo?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data: { user: supabaseUser }, error: signInError } = 
        await supabase.auth.signInWithPassword({ email, password });

      if (signInError) throw signInError;

      if (supabaseUser) {
        const { data: profile, error: profileError } = 
          await supabase.from('profiles')
            .select('*')
            .eq('id', supabaseUser.id)
            .single();

        if (profileError) throw profileError;

        const fetchedUser: User = {
          id: supabaseUser.id,
          role: profile.role,
          name: profile.name,
          email: profile.email || '',
          healthId: profile.health_id || '',
        };

        setUser(fetchedUser);
        localStorage.setItem('user', JSON.stringify(fetchedUser));

        // Return success and where to redirect based on role
        if (profile.role === 'doctor') {
          return {
            success: true,
            redirectTo: '/doctor/dashboard'
          };
        } else if (profile.role === 'patient') {
          return {
            success: true,
            redirectTo: '/dashboard'
          };
        }
      }
      return { success: false };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}