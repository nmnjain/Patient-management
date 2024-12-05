import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message.toLowerCase().includes('email not confirmed')) {
          setError(
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Please verify your email address before logging in. 
                    <br />
                    Check your email inbox for the verification link.
                    <br />
                    <button
                      onClick={async () => {
                        const { error } = await supabase.auth.resend({
                          type: 'signup',
                          email,
                        });
                        if (error) {
                          setError('Failed to resend verification email. Please try again.');
                        } else {
                          alert('Verification email has been resent. Please check your inbox.');
                        }
                      }}
                      className="text-yellow-700 underline hover:text-yellow-600 mt-2"
                    >
                      Resend verification email
                    </button>
                  </p>
                </div>
              </div>
            </div>
          );
          return;
        }
        throw signInError;
      }

      if (!user) {
        throw new Error('No user returned after login');
      }

      const { success, redirectTo } = await login(email, password);
      
      if (success && redirectTo) {
        navigate(redirectTo);
      }
    } catch (err: any) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10">
          <div className="flex justify-center mb-6">
            <div className="text-[#2C3E50] text-3xl font-bold">HealthCare</div>
          </div>

          <h2 className="text-center text-2xl font-bold text-gray-900 mb-8">
            Welcome back!
          </h2>

          {error && (
            <div className="mb-4">
              {typeof error === 'string' ? (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              ) : (
                error
              )}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md 
                  shadow-sm text-sm font-medium text-white bg-[#2C3E50] hover:bg-[#34495E] 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#34495E] 
                  transition-colors duration-200"
              >
                Sign In
              </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 
                rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50
                transition-colors duration-200"
            >
              <img
                className="h-5 w-5 mr-2"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google logo"
              />
              Sign in with Google
            </button>

            <div className="flex items-center justify-between mt-4 text-sm">
              <Link
                to="/"
                className="text-[#2C3E50] hover:text-[#34495E] transition-colors duration-200"
              >
                ← Website
              </Link>
              <div className="text-gray-500">
                No account?{' '}
                <Link
                  to="/register/patient"
                  className="text-[#2C3E50] hover:text-[#34495E] transition-colors duration-200"
                >
                  Sign Up →
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}