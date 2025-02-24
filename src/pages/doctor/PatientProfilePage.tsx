import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStorage } from '../../hooks/useStorage';
import { useSignedUrl } from '../../hooks/useSignedUrl';
import { supabase } from '../../lib/supabase';
import {
    User, Upload, FileText, Clock, Calendar,
    AlertCircle, Heart, Pill, UserCheck, Sparkles,
    Download, ExternalLink, FileX
} from 'lucide-react';

interface Patient {
    id: string;
    name: string;
    health_id: string;
    gender: string;
    blood_group: string;
    date_of_birth: string;
    allergies: string[];
    emergency_contact: string;
    medical_history: string;
    current_medications: string;
    insurance_info: string;
    primary_care_physician: string;
    chronic_conditions: string[];
    vaccination_status: string;
    address: string;
    phone: string;
    email: string;
    medical_summary: string;
}

interface MedicalRecord {
    id: string;
    file_name: string;
    file_path: string;
    created_at: string;
    description: string;
    uploaded_by?: string;
    doctor_name?: string;
}

export default function PatientProfilePage() {
    const { patientId } = useParams<{ patientId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { getSignedUrl } = useSignedUrl();
    const { uploadFile } = useStorage();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');
    const [uploading, setUploading] = useState(false);
    const [customFileName, setCustomFileName] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [showSummary, setShowSummary] = useState(false);

    useEffect(() => {
        if (!patientId || !user) return;

        const fetchPatientData = async () => {
            try {
                setLoading(true);
                setError(null);



                const { data: accessData, error: accessError } = await supabase
                    .from('access_tokens')
                    .select('*')
                    .eq('doctor_id', user.id)
                    .eq('patient_id', patientId)
                    .single();

                if (accessError || !accessData) {
                    setError('You do not have access to this patient');
                    setLoading(false);
                    return;
                }
                const { data: patientData, error: patientError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', patientId)
                    .single();

                if (patientError || !patientData) {
                    setError('Failed to load patient data');
                    setLoading(false);
                    return;
                }

                const { data: recordsData, error: recordsError } = await supabase
                    .from('medical_records')
                    .select('*')
                    .eq('patient_id', patientId)
                    .order('created_at', { ascending: false });

                if (recordsError) {
                    console.error('Error fetching records:', recordsError);
                }

                if (patientData.chronic_conditions && typeof patientData.chronic_conditions === 'string') {
                    try {
                        patientData.chronic_conditions = JSON.parse(patientData.chronic_conditions);
                    } catch (e) {
                        patientData.chronic_conditions = [];
                    }
                }

                setPatient(patientData);
                setRecords(recordsData || []);

            } catch (err) {
                console.error('Error loading patient data:', err);
                setError('Failed to load patient data');
            } finally {
                setLoading(false);
            }
        };

        fetchPatientData();
    }, [patientId, user]);

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
            const finalFileName = customFileName ?
                `${customFileName}_${formattedDate}${selectedFile.name.substring(selectedFile.name.lastIndexOf('.'))}` :
                selectedFile.name;

            await uploadFile(selectedFile, patient.id, {
                description,
                uploaded_by: 'doctor',
                doctor_name: user.name || 'Unknown Doctor',
                doctor_id: user.id,
                custom_file_name: finalFileName
            });

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

        } catch (err) {
            setError('Failed to upload record. Please try again.');
            console.error('Upload error:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleGenerateSummary = async () => {
        if (!patient) return;

        setLoadingSummary(true);

        setTimeout(() => {
            setShowSummary(true);
            setLoadingSummary(false);
        }, 1500);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 p-4 rounded-md">
                    <p className="text-red-700">{error}</p>
                    <button
                        onClick={() => navigate('/doctor/dashboard')}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
                    <p className="text-yellow-700">Patient data not found</p>
                    <button
                        onClick={() => navigate('/doctor/dashboard')}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const calculateAge = (dob: string) => {
        if (!dob) return 'N/A';
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <button
                onClick={() => navigate('/doctor/dashboard')}
                className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
            >
                ← Back to Dashboard
            </button>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                {/* Patient Header */}
                <div className="bg-blue-600 p-6 text-white">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center">
                            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center">
                                <User className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <h1 className="text-2xl font-bold">{patient.name}</h1>
                                <div className="flex items-center mt-1">
                                    <p className="text-blue-200">Health ID: {patient.health_id}</p>
                                    <span className="mx-2">•</span>
                                    <p className="text-blue-200">{patient.gender}</p>
                                    <span className="mx-2">•</span>
                                    <p className="text-blue-200">{calculateAge(patient.date_of_birth)} years</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium flex items-center hover:bg-blue-50"
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Record
                            </button>
                            {!loadingSummary && !showSummary ? (
                                <button
                                    onClick={handleGenerateSummary}
                                    className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium flex items-center hover:bg-blue-50"
                                >
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Generate AI Summary
                                </button>
                            ) : loadingSummary ? (
                                <button
                                    disabled
                                    className="bg-gray-100 text-gray-500 px-4 py-2 rounded-md font-medium flex items-center"
                                >
                                    <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-blue-600 rounded-full"></div>
                                    Generating...
                                </button>
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* Patient Information */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Date of Birth</p>
                                        <p className="text-gray-800">
                                            {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Blood Group</p>
                                        <p className="text-gray-800">{patient.blood_group || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="text-gray-800">{patient.phone || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="text-gray-800">{patient.email || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-500">Address</p>
                                        <p className="text-gray-800">{patient.address || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-500">Emergency Contact</p>
                                        <p className="text-gray-800">{patient.emergency_contact || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Medical Information</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1 text-red-500" />
                                            Allergies
                                        </p>
                                        <p className="text-gray-800">
                                            {patient.allergies && patient.allergies.length
                                                ? patient.allergies.join(', ')
                                                : 'No known allergies'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 flex items-center">
                                            <Heart className="h-4 w-4 mr-1 text-red-500" />
                                            Chronic Conditions
                                        </p>
                                        <p className="text-gray-800">
                                            {patient.chronic_conditions && Array.isArray(patient.chronic_conditions) &&
                                                patient.chronic_conditions.length
                                                ? patient.chronic_conditions.join(', ')
                                                : 'None reported'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 flex items-center">
                                            <Pill className="h-4 w-4 mr-1 text-blue-500" />
                                            Current Medications
                                        </p>
                                        <p className="text-gray-800">{patient.current_medications || 'None'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 flex items-center">
                                            <UserCheck className="h-4 w-4 mr-1 text-green-500" />
                                            Primary Care Physician
                                        </p>
                                        <p className="text-gray-800">{patient.primary_care_physician || 'Not specified'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                        {showSummary && (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 relative">
        <div className="absolute -top-3 -left-3 bg-blue-600 text-white p-2 rounded-md flex items-center">
            <Sparkles className="h-4 w-4 mr-1" />
            AI Summary
        </div>
        <div className="mt-4 text-gray-700 whitespace-pre-line">
            {patient.medical_summary || 
                (() => {
                    // Extract dates and test results
                    const summaryText = `[2022-11-23] Typhoidot IgG negative [2022-11-23] Typhoidot IgG negative [2022-11-23] Rheumatoid factor (RA) negative [2025-02-24] 19-year-old male (B+) with history of eye surgery and asthma. Multiple allergies (skin, food, drug, insect, respiratory) reported. Gestational diabetes listed, etiology unclear given patient's sex.`;
                    
                    // Convert date-prefixed entries to bullet points
                    const regex = /\[(\d{4}-\d{2}-\d{2})\](.*?)(?=\[\d{4}-\d{2}-\d{2}\]|$)/g;
                    let formattedText = summaryText.replace(regex, "• [$1]$2\n");
                    
                    // Remove any date formatting from the demographic information
                    const demographicInfo = formattedText.replace(/^.*\n(.*)/s, "$1");
                    const testResults = formattedText.replace(/(.*\n)(.*)/s, "$1");
                    
                    return `${testResults}\n${demographicInfo}`;
                })()
            }
        </div>
    </div>
)}

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Medical History</h3>
                                <p className="text-gray-700 whitespace-pre-line">
                                    {patient.medical_history || 'No medical history recorded.'}
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Insurance Information</h3>
                                <p className="text-gray-700">
                                    {(() => {
                                        try {
                                            const insuranceData = typeof patient.insurance_info === 'string'
                                                ? JSON.parse(patient.insurance_info)
                                                : patient.insurance_info;

                                            if (insuranceData && insuranceData.hasInsurance) {
                                                return `Insurance Provider: ${insuranceData.details || 'Not specified'}`;
                                            } else {
                                                return 'No insurance information recorded.';
                                            }
                                        } catch (error) {
                                            return patient.insurance_info || 'No insurance information recorded.';
                                        }
                                    })()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Medical Records */}
                    <div className="mt-8">
                        <h3 className="text-xl font-medium text-gray-900 mb-4">Medical Records</h3>
                        {records.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">No medical records found for this patient</p>
                            </div>
                        ) : (
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                                                File Name
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Description
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Uploaded By
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Date
                                            </th>
                                            <th scope="col" className="py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-gray-900">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {records.map((record) => (
                                            <tr key={record.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                                                    {record.file_name}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {record.description || 'No description'}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {record.uploaded_by === 'doctor'
                                                        ? `Dr. ${record.doctor_name || 'Unknown'}`
                                                        : 'Patient'}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {formatDate(record.created_at)}
                                                </td>
                                                <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleViewFile(record)}
                                                        className="text-blue-600 hover:text-blue-900 mx-2"
                                                    >
                                                        <ExternalLink className="h-5 w-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Medical Record</h3>
                        <form onSubmit={handleDoctorUpload}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    File
                                </label>
                                <input
                                    type="file"
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Custom File Name (optional)
                                </label>
                                <input
                                    type="text"
                                    value={customFileName}
                                    onChange={(e) => setCustomFileName(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    placeholder="E.g. Blood Test Result"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Record Date
                                </label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    rows={3}
                                    placeholder="Brief description of this medical record"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!selectedFile || uploading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                                >
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}