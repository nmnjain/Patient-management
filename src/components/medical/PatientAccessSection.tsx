// components/medical/PatientAccessSection.tsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Patient {
    id: string;
    name: string;
    health_id: string;
}

export default function PatientAccessSection() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [healthId, setHealthId] = useState('');
    const [loading, setLoading] = useState(false);
    const [patient, setPatient] = useState<Patient | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!healthId || !user) return;

        try {
            setLoading(true);
            setError(null);

            // Fetch patient details
            const { data: patientData, error: patientError } = await supabase
                .from('profiles')
                .select('id, name, health_id')
                .eq('health_id', healthId)
                .single();

            if (patientError || !patientData) {
                setError('Patient not found');
                setPatient(null);
                setLoading(false);
                return;
            }

            // Check if access token already exists
            const { data: existingToken, error: tokenCheckError } = await supabase
                .from('access_tokens')
                .select('id')
                .eq('doctor_id', user.id)
                .eq('patient_id', patientData.id)
                .single();

            // If token doesn't exist, create a new one
            if (!existingToken) {
                // Create access token
                const expiresAt = new Date();
                expiresAt.setHours(expiresAt.getHours() + 8);

                const { error: tokenError } = await supabase
                    .from('access_tokens')
                    .insert({
                        doctor_id: user.id,
                        patient_id: patientData.id,
                        expires_at: expiresAt.toISOString(),
                    });

                if (tokenError) throw tokenError;
            }

            setPatient(patientData);

        } catch (err) {
            setError('Error accessing patient records');
            console.error('Access error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewProfile = () => {
        if (patient) {
            navigate(`/doctor/patient/${patient.id}`);
        }
    };

    return (
        <div className="space-y-6 p-6 bg-white rounded-lg shadow">
            <div>
                <h2 className="text-2xl font-semibold mb-2">Access Patient Records</h2>
                <p className="text-gray-600">Enter patient's Health ID to view their medical records</p>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
                <input
                    type="text"
                    value={healthId}
                    onChange={(e) => setHealthId(e.target.value)}
                    placeholder="Enter Health ID"
                    className="flex-1 p-2 border border-gray-300 rounded"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            {patient && (
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <div className="bg-blue-100 rounded-full p-2 mr-3">
                                <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium">{patient.name}</h3>
                                <p className="text-gray-600">Health ID: {patient.health_id}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleViewProfile}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                        >
                            View Full Profile
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}