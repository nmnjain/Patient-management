// components/medical/PatientAccess.tsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface Patient {
    id: string;
    name: string;
    health_id: string;
    gender: string;
    blood_group: string;
}

interface MedicalRecord {
    id: string;
    file_name: string;
    file_url: string;
    created_at: string;
    description: string;
}

export default function PatientAccess() {
    const { user } = useAuth();
    const [healthId, setHealthId] = useState('');
    const [loading, setLoading] = useState(false);
    const [patient, setPatient] = useState<Patient | null>(null);
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!healthId || !user) return;

        try {
            setLoading(true);
            setError(null);

            // 1. Fetch patient details
            const { data: patientData, error: patientError } = await supabase
                .from('profiles')
                .select('id, name, health_id, gender, blood_group')
                .eq('health_id', healthId)
                .single();

            if (patientError || !patientData) {
                setError('Patient not found');
                setPatient(null);
                setRecords([]);
                return;
            }

            // 2. Create access token
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

            // 3. Fetch medical records
            const { data: recordsData } = await supabase
                .from('medical_records')
                .select('id, file_name, file_url, created_at, description')
                .eq('patient_id', patientData.id)
                .order('created_at', { ascending: false });

            setPatient(patientData);
            setRecords(recordsData || []);

        } catch (err) {
            setError('Error accessing patient records');
            console.error('Access error:', err);
        } finally {
            setLoading(false);
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
                <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-4">Patient Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-600">Name</p>
                                <p className="font-medium">{patient.name}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Health ID</p>
                                <p className="font-medium">{patient.health_id}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Gender</p>
                                <p className="font-medium">{patient.gender}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Blood Group</p>
                                <p className="font-medium">{patient.blood_group}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium mb-4">Medical Records</h3>
                        {records.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No medical records found for this patient
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {records.map((record) => (
                                    <div
                                        key={record.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium">{record.file_name}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(record.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => window.open(record.file_url, '_blank')}
                                            className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100 transition"
                                        >
                                            View
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}