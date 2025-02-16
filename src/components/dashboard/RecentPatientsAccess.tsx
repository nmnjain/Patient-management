import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAccessToken } from '../../hooks/useAccessToken';
import { useSignedUrl } from '../../hooks/useSignedUrl';
import { Clock, Search, UserX, ChevronDown, ChevronUp, File } from 'lucide-react';
import { supabase } from '../../lib/supabase';


const RecentPatientsAccess = () => {
    const { user } = useAuth();
    const { getActiveTokens, revokeAccessToken } = useAccessToken();
    const { getSignedUrl } = useSignedUrl();
    const [activePatients, setActivePatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedPatient, setExpandedPatient] = useState(null);
    const [patientRecords, setPatientRecords] = useState({});
    const [loadingRecords, setLoadingRecords] = useState(false);



    const calculateRemainingTime = (expiresAt) => {
        const now = new Date();
        const expiry = new Date(expiresAt);
        expiry.setHours(expiry.getHours() + 5);
        expiry.setMinutes(expiry.getMinutes() + 30);

        const diffMs = expiry.getTime() - now.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return { hours: diffHrs, minutes: diffMins, isExpired: diffMs <= 0 };
    };

    const fetchActivePatients = async () => {
        if (!user?.id) return;
        const tokens = await getActiveTokens(user.id);
        const patientsWithTime = tokens.map(token => ({
            ...token,
            ...token.profiles,
            remainingTime: calculateRemainingTime(token.expires_at)
        }));
        setActivePatients(patientsWithTime.filter(p => !p.remainingTime.isExpired));
        setLoading(false);
    };

    const fetchPatientRecords = async (patientId) => {
        if (patientRecords[patientId]) {
            return;
        }

        setLoadingRecords(true);
        try {
            const { data: records, error } = await supabase
                .from('medical_records')
                .select('*')
                .eq('patient_id', patientId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setPatientRecords(prev => ({
                ...prev,
                [patientId]: records || []
            }));
        } catch (err) {
            console.error('Error fetching records:', err);
        } finally {
            setLoadingRecords(false);
        }
    };

    const handleViewFile = async (record) => {
        try {
            const signedUrl = await getSignedUrl(record.file_path);
            window.open(signedUrl, '_blank');
        } catch (err) {
            console.error('Error viewing file:', err);
        }
    };

    useEffect(() => {
        fetchActivePatients();
        const interval = setInterval(fetchActivePatients, 60000);
        return () => clearInterval(interval);
    }, [user?.id]);

    const handlePatientClick = async (patientId) => {
        if (expandedPatient === patientId) {
            setExpandedPatient(null);
        } else {
            setExpandedPatient(patientId);
            await fetchPatientRecords(patientId);
        }
    };

    const handleRevokeAccess = async (tokenId) => {
        try {
            await revokeAccessToken(tokenId);
            setActivePatients(prevPatients => 
                prevPatients.filter(patient => patient.id !== tokenId)
            );
            setExpandedPatient(null);
        } catch (error) {
            console.error('Error revoking access:', error);
        }
    };

    return (
        <div className="space-y-6 p-6 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-gray-500" />
                    <h2 className="text-xl font-semibold text-gray-900">Recently Accessed Patients</h2>
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-4">Loading...</div>
                ) : activePatients.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No active patient sessions
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activePatients.map((patient) => (
                            <div key={patient.id} className="border border-gray-200 rounded-lg">
                                <div
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-t-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                    onClick={() => handlePatientClick(patient.patient_id)}
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">{patient.name}</p>
                                        <p className="text-sm text-gray-500">ID: {patient.health_id}</p>
                                        <div className="flex items-center text-sm text-gray-500 mt-1">
                                            <Clock className="h-4 w-4 mr-1" />
                                            Expires in: {patient.remainingTime.hours}h {patient.remainingTime.minutes}m
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRevokeAccess(patient.id);
                                            }}
                                            className="p-2 text-gray-500 hover:text-red-500 transition-colors rounded-full hover:bg-gray-200"
                                            title="Revoke Access"
                                        >
                                            <UserX className="h-5 w-5" />
                                        </button>
                                        {expandedPatient === patient.patient_id ?
                                            <ChevronUp className="h-5 w-5 text-gray-500" /> :
                                            <ChevronDown className="h-5 w-5 text-gray-500" />
                                        }
                                    </div>
                                </div>

                                {/* Records Dropdown */}
                                {expandedPatient === patient.patient_id && (
                                    <div className="p-4 border-t border-gray-200">
                                        {loadingRecords ? (
                                            <div className="text-center py-2">Loading records...</div>
                                        ) : patientRecords[patient.patient_id]?.length > 0 ? (
                                            <div className="space-y-2">
                                                {patientRecords[patient.patient_id].map((record) => (
                                                    <div
                                                        key={record.id}
                                                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <File className="h-4 w-4 text-gray-500" />
                                                            <div>
                                                                <p className="text-sm font-medium">{record.file_name}</p>
                                                                <p className="text-xs text-gray-500">
                                                                    {new Date(record.created_at).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleViewFile(record)}
                                                            className="text-sm text-blue-600 hover:text-blue-800"
                                                        >
                                                            View
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center text-gray-500">No records found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentPatientsAccess;