// components/medical/PatientAccess.tsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSignedUrl } from '../../hooks/useSignedUrl';
import { supabase } from '../../lib/supabase';

import { Upload, User } from 'lucide-react';
import { useStorage } from '../../hooks/useStorage';

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
    file_path: string;
    file_url?: string;
    created_at: string;
    description: string;
    uploaded_by?: string;
    doctor_name?: string;
}

export default function PatientAccess() {
    const { user } = useAuth();
    const { getSignedUrl } = useSignedUrl();
    const [healthId, setHealthId] = useState('');
    const [loading, setLoading] = useState(false);
    const [patient, setPatient] = useState<Patient | null>(null);
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { uploadFile } = useStorage();
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');
    const [uploading, setUploading] = useState(false);
    const [customFileName, setCustomFileName] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);


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
                .select('id, file_name, file_path, created_at, description')
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

    const handleViewFile = async (record: MedicalRecord) => {
        try {
            const signedUrl = await getSignedUrl(record.file_path);
            window.open(signedUrl, '_blank');
        } catch (err) {
            console.error('Error viewing file:', err);
            setError('Error accessing file');
        }
    };

    const handleDoctorUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !patient || !user) return;

        try {
            setUploading(true);
            setError(null);

            const formattedDate = selectedDate.replace(/-/g, '/');
            const finalFileName = `${customFileName}_${formattedDate}${selectedFile.name.substring(selectedFile.name.lastIndexOf('.'))}`;

            await uploadFile(selectedFile, patient.id, {
                description,
                uploaded_by: 'doctor',
                doctor_name: user.name || 'Unknown Doctor',
                doctor_id: user.id,
                custom_file_name: finalFileName
            });

            // Refresh records after upload
            const { data: newRecords, error: recordsError } = await supabase
                .from('medical_records')
                .select('*')
                .eq('patient_id', patient.id)
                .order('created_at', { ascending: false });

            if (recordsError) throw recordsError;

            setRecords(newRecords);
            setShowUploadModal(false);
            setSelectedFile(null);
            setDescription('');
            setCustomFileName('');
            setSelectedDate(new Date().toISOString().split('T')[0]);

            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) {
                fileInput.value = '';
            }

        } catch (err) {
            setError('Failed to upload record. Please try again.');
            console.error('Upload error:', err);
        } finally {
            setUploading(false);
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
                                            <div className="text-sm text-gray-500 space-y-1">
                                                <p>{new Date(record.created_at).toLocaleDateString()}</p>
                                                <p className="flex items-center">
                                                    <User className="h-4 w-4 mr-1" />
                                                    {record.uploaded_by === 'doctor'
                                                        ? `Uploaded by Dr. ${record.doctor_name}`
                                                        : 'Uploaded by Patient'
                                                    }
                                                </p>
                                                {record.description && (
                                                    <p className="text-gray-600">{record.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleViewFile(record)}
                                            className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100 transition"
                                        >
                                            View
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-4">
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Medical Record
                            </button>
                        </div>
                    </div>

                    {/* Upload Modal */}
                    {showUploadModal && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium">Upload Medical Record for {patient.name}</h3>
                                    <button
                                        onClick={() => setShowUploadModal(false)}
                                        className="text-gray-400 hover:text-gray-500"
                                    >
                                        ×
                                    </button>
                                </div>

                                {error && (
                                    <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleDoctorUpload} className="space-y-4">
                                    <div>
                                        <label
                                            htmlFor="file-name"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            File Name
                                        </label>
                                        <input
                                            id="file-name"
                                            type="text"
                                            value={customFileName}
                                            onChange={(e) => setCustomFileName(e.target.value)}
                                            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="Enter file name (e.g., bloodtest)"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="record-date"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Date
                                        </label>
                                        <input
                                            id="record-date"
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="description"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Description
                                        </label>
                                        <input
                                            id="description"
                                            type="text"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="Enter record description"
                                            required
                                        />
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <label
                                            htmlFor="file-upload"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Select File
                                        </label>
                                        <input
                                            id="file-upload"
                                            type="file"
                                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                            className="w-full text-sm text-gray-500 
                                                file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 
                                                file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 
                                                hover:file:bg-indigo-100 focus:outline-none"
                                            required
                                        />
                                    </div>

                                    <div className="flex justify-end space-x-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowUploadModal(false)}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                            disabled={uploading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 
                                                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
                                                disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                            disabled={uploading || !selectedFile}
                                        >
                                            <Upload className="h-5 w-5 mr-2" />
                                            {uploading ? 'Uploading...' : 'Upload'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}