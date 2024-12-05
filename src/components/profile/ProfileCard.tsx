import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User2, Mail, Phone, Heart, Calendar } from 'lucide-react';
import { PatientProfile } from '../../types';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function ProfileCard() {
  const { user } = useAuth();
  const [patientUser, setPatientUser] = useState<PatientProfile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, health_id, phone, blood_group, date_of_birth')
          .eq('id', user.id)
          .single();

        if (error) return;

        if (data) {
          setPatientUser(data);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-indigo-100 flex items-center justify-center">
          <User2 className="w-8 h-8 md:w-10 md:h-10 text-indigo-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900">
            {patientUser?.name || 'Loading...'}
          </h3>
          <div className="mt-2 space-y-1">
            <p className="text-sm md:text-base text-gray-600 flex items-center">
              <Mail className="w-4 h-4 mr-2 text-gray-400" />
              {patientUser?.email}
            </p>
            <p className="text-sm md:text-base text-gray-600 flex items-center">
              <Phone className="w-4 h-4 mr-2 text-gray-400" />
              {patientUser?.phone}
            </p>
            <p className="text-sm md:text-base text-gray-600 flex items-center">
              <Heart className="w-4 h-4 mr-2 text-gray-400" />
              Blood Group: {patientUser?.blood_group}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}