import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User2, Mail, Lock, Phone, Calendar, Heart, ArrowLeft, Fingerprint, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';


export default function PatientRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    bloodGroup: '',
    gender: '',
  });
  const [error, setError] = useState('');

  // Function to generate a random health ID
  const generateHealthId = () => {
    // Generate a random 8-character string
    const randomStr = Math.random().toString(36).substring(2, 10);
    // Format: e[random8chars] (e for patient/user)
    return `e${randomStr}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const healthId = generateHealthId();

      // Sign up the user
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (signUpError) throw signUpError;
      if (!user) throw new Error('No user returned after signup');

      // Create a profile for the user with the generated health ID
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          role: 'patient',
          name: formData.name,
          email: formData.email,
          phone: `+91${formData.phone}`,
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender,
          blood_group: formData.bloodGroup,
          health_id: healthId, // Add the generated health ID
        });

      if (profileError) throw profileError;

      // Create an initial medical record entry
      const { error: recordError } = await supabase
        .from('medical_records')
        .insert([
          {
            patient_id: user.id,
            file_name: 'Initial Record',
            file_url: '',
            file_type: '',
            file_size: 0,
          },
        ]);

      if (recordError) {
        console.error('Initial medical record insertion error:', recordError);
      } else {
        console.log('Initial medical record created successfully');
      }

      console.log('Registration successful');
      navigate('/login');
    } catch (error) {
      console.error('Error:', error);
      setError('Registration failed. Please check your details and try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let value = e.target.value;
    
    // If it's the phone field, remove any non-digit characters
    if (e.target.name === 'phone') {
      value = value.replace(/\D/g, '');
    }
    
    setFormData({ ...formData, [e.target.name]: value });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Registration Form */}
      <div className="w-full lg:w-[70%] bg-white p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full mx-auto space-y-6">
          {/* Logo and Title */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Sign up for Free</h2>
            <p className="mt-2 text-sm text-gray-600">
              Join our healthcare platform for better medical record management
            </p>
          </div>

          {/* Registration Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 
                    rounded-lg shadow-sm placeholder-gray-400 focus:outline-none 
                    focus:ring-[#2C3E50] focus:border-[#2C3E50] transition-colors duration-200"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 
                    rounded-lg shadow-sm placeholder-gray-400 focus:outline-none 
                    focus:ring-[#2C3E50] focus:border-[#2C3E50] transition-colors duration-200"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 
                    rounded-lg shadow-sm placeholder-gray-400 focus:outline-none 
                    focus:ring-[#2C3E50] focus:border-[#2C3E50] transition-colors duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  maxLength={10}
                  value={formData.phone}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 
                    rounded-lg shadow-sm placeholder-gray-400 focus:outline-none 
                    focus:ring-[#2C3E50] focus:border-[#2C3E50] transition-colors duration-200"
                  placeholder="Enter 10 digit number"
                />
              </div>
            </div>

            {/* Date of Birth Field */}
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 
                    rounded-lg shadow-sm placeholder-gray-400 focus:outline-none 
                    focus:ring-[#2C3E50] focus:border-[#2C3E50] transition-colors duration-200"
                />
              </div>
            </div>

            {/* Blood Group Field */}
            <div>
              <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700">
                Blood Group
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Heart className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="bloodGroup"
                  name="bloodGroup"
                  required
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 
                    rounded-lg shadow-sm placeholder-gray-400 focus:outline-none 
                    focus:ring-[#2C3E50] focus:border-[#2C3E50] transition-colors duration-200"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            {/* Gender Field */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <div className="mt-1">
                <select
                  id="gender"
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 
                    rounded-lg shadow-sm placeholder-gray-400 focus:outline-none 
                    focus:ring-[#2C3E50] focus:border-[#2C3E50] transition-colors duration-200"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full bg-[#2C3E50] text-white py-2.5 px-4 rounded-lg 
                  hover:bg-[#34495E] transition-colors duration-200 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C3E50]"
              >
                Create Account
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col sm:flex-row items-center justify-between text-sm mt-6 gap-4 sm:gap-0">
              <Link 
                to="/" 
                className="text-[#2C3E50] hover:text-[#34495E] transition-colors duration-200 
                  flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Website
              </Link>
              <div className="flex items-center">
                <span className="text-gray-500">Have an account?</span>
                <Link 
                  to="/login" 
                  className="ml-1 text-[#2C3E50] hover:text-[#34495E] 
                    transition-colors duration-200"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Right Panel - Features */}
      <div className="hidden lg:block lg:w-[30%] bg-gradient-to-br from-[#2C3E50] to-[#34495E] p-6">
        <div className="max-w-xs mx-auto">
          <div className="space-y-6">
            {/* Feature Items */}
            <div className="flex items-center space-x-3 text-white">
              <div className="bg-white/10 p-1.5 rounded-lg">
                <User2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Personal Health Records</h3>
                <p className="text-white/80 text-xs">Securely store and manage your medical history</p>
              </div>

            </div>

            <div className="flex items-center space-x-3 text-white">
              <div className="bg-white/10 p-1.5 rounded-lg">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Vaccination Management</h3>
                <p className="text-white/80 text-xs">Track your vaccination history</p>
              </div>

            </div>

            <div className="flex items-center space-x-3 text-white">
              <div className="bg-white/10 p-1.5 rounded-lg">
                <Fingerprint className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Unique Health ID</h3>
                <p className="text-white/80 text-xs">Access with secure health identifier</p>
              </div>

            </div>

            <div className="flex items-center space-x-3 text-white">
              <div className="bg-white/10 p-1.5 rounded-lg">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Medical History</h3>
                <p className="text-white/80 text-xs">Track allergies and conditions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}