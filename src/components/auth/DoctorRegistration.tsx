import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { User2, Mail, Phone, Building2, GraduationCap, Clock, Lock, ArrowLeft, FileText } from 'lucide-react';

export default function DoctorRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    registrationNumber: '',
    specialization: '',
    experience: '',
    clinicName: '',
    clinicAddress: '',
    workingHours: '',
  });
  const [error, setError] = useState('');

  // Function to generate a doctor health ID

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      

      // Sign up the user
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (signUpError) throw signUpError;
      if (!user) throw new Error('No user returned after signup');

      // Create a profile for the doctor
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          role: 'doctor',
          name: formData.name,
          email: formData.email,
          phone: `+91${formData.phone}`,
          // health_id: healthId,
          registration_number: formData.registrationNumber,
          specialization: formData.specialization,
          experience: formData.experience,
          clinic_name: formData.clinicName,
          clinic_address: formData.clinicAddress,
          working_hours: formData.workingHours,
        });

      if (profileError) throw profileError;

      console.log('Doctor registration successful');
      navigate('/login');
    } catch (error) {
      console.error('Error:', error);
      setError('Registration failed. Please check your details and try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let value = e.target.value;
    
    // If it's the phone field, remove any non-digit characters
    if (e.target.name === 'phone') {
      value = value.replace(/\D/g, '');
    }
    
    setFormData({ ...formData, [e.target.name]: value });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Registration Form */}
      <div className="w-[70%] bg-white p-8 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto space-y-6">
          {/* Title */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Doctor Registration</h2>
            <p className="mt-2 text-sm text-gray-600">
              Join our healthcare platform as a medical professional
            </p>
          </div>

          {/* Form */}
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
                  placeholder="Dr. John Doe"
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
                  placeholder="doctor@hospital.com"
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

            {/* Registration Number Field */}
            <div>
              <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
                Medical Registration Number
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="registrationNumber"
                  name="registrationNumber"
                  type="text"
                  required
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 
                    rounded-lg shadow-sm placeholder-gray-400 focus:outline-none 
                    focus:ring-[#2C3E50] focus:border-[#2C3E50] transition-colors duration-200"
                  placeholder="Enter registration number"
                />
              </div>
            </div>

            {/* Specialization Field */}
            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                Specialization
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <GraduationCap className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="specialization"
                  name="specialization"
                  required
                  value={formData.specialization}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 
                    rounded-lg shadow-sm placeholder-gray-400 focus:outline-none 
                    focus:ring-[#2C3E50] focus:border-[#2C3E50] transition-colors duration-200"
                >
                  <option value="">Select Specialization</option>
                  <option value="General Physician">General Physician</option>
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Pediatrician">Pediatrician</option>
                  <option value="Neurologist">Neurologist</option>
                  <option value="Psychiatrist">Psychiatrist</option>
                  <option value="Orthopedic">Orthopedic</option>
                  <option value="Gynecologist">Gynecologist</option>
                  <option value="ENT Specialist">ENT Specialist</option>
                  <option value="Ophthalmologist">Ophthalmologist</option>
                </select>
              </div>
            </div>

            {/* Experience Field */}
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                Years of Experience
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="experience"
                  name="experience"
                  type="number"
                  required
                  min="0"
                  value={formData.experience}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 
                    rounded-lg shadow-sm placeholder-gray-400 focus:outline-none 
                    focus:ring-[#2C3E50] focus:border-[#2C3E50] transition-colors duration-200"
                  placeholder="Years of experience"
                />
              </div>
            </div>

            {/* Clinic Name Field */}
            <div>
              <label htmlFor="clinicName" className="block text-sm font-medium text-gray-700">
                Clinic/Hospital Name
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Building2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="clinicName"
                  name="clinicName"
                  type="text"
                  required
                  value={formData.clinicName}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 
                    rounded-lg shadow-sm placeholder-gray-400 focus:outline-none 
                    focus:ring-[#2C3E50] focus:border-[#2C3E50] transition-colors duration-200"
                  placeholder="Enter clinic/hospital name"
                />
              </div>
            </div>

            {/* Clinic Address Field */}
            <div>
              <label htmlFor="clinicAddress" className="block text-sm font-medium text-gray-700">
                Clinic/Hospital Address
              </label>
              <div className="mt-1 relative">
                <textarea
                  id="clinicAddress"
                  name="clinicAddress"
                  required
                  value={formData.clinicAddress}
                  onChange={handleChange}
                  rows={3}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 
                    rounded-lg shadow-sm placeholder-gray-400 focus:outline-none 
                    focus:ring-[#2C3E50] focus:border-[#2C3E50] transition-colors duration-200"
                  placeholder="Enter complete address"
                />
              </div>
            </div>

            {/* Working Hours Field */}
            <div>
              <label htmlFor="workingHours" className="block text-sm font-medium text-gray-700">
                Working Hours
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="workingHours"
                  name="workingHours"
                  type="text"
                  required
                  value={formData.workingHours}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 
                    rounded-lg shadow-sm placeholder-gray-400 focus:outline-none 
                    focus:ring-[#2C3E50] focus:border-[#2C3E50] transition-colors duration-200"
                  placeholder="e.g., Mon-Sat: 9 AM - 6 PM"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm mt-2">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full bg-[#2C3E50] text-white py-2.5 px-4 rounded-lg 
                  hover:bg-[#34495E] transition-colors duration-200 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C3E50]"
              >
                Register as Doctor
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center justify-between text-sm mt-6">
              <Link 
                to="/" 
                className="text-[#2C3E50] hover:text-[#34495E] transition-colors duration-200 
                  flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Website
              </Link>
              <div className="flex items-center">
                <span className="text-gray-500">Already registered?</span>
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
      <div className="w-[30%] bg-gradient-to-br from-[#2C3E50] to-[#34495E] p-6 flex flex-col justify-center">
        <div className="max-w-xs mx-auto">
          <div className="space-y-6">
            {/* Feature Items */}
            <div className="flex items-center space-x-3 text-white">
              <div className="bg-white/10 p-1.5 rounded-lg">
                <User2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Professional Profile</h3>
                <p className="text-white/80 text-xs">Manage your medical practice efficiently</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-white">
              <div className="bg-white/10 p-1.5 rounded-lg">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Credentials Management</h3>
                <p className="text-white/80 text-xs">Showcase your qualifications</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-white">
              <div className="bg-white/10 p-1.5 rounded-lg">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Clinic Management</h3>
                <p className="text-white/80 text-xs">Manage your practice location</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-white">
              <div className="bg-white/10 p-1.5 rounded-lg">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Schedule Management</h3>
                <p className="text-white/80 text-xs">Set your working hours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}