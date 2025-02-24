import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAccessToken } from '../../hooks/useAccessToken';
import { useSignedUrl } from '../../hooks/useSignedUrl';
import { useNavigate } from 'react-router-dom';
import { Clock, Search, UserX, ExternalLink, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Patient {
    id: string;
    patient_id: string;
    name: string;
    health_id: string;
    remainingTime: {
        hours: number;
        minutes: number;
        isExpired: boolean;
    };
}

const RecentPatientsAccess = () => {
    const { user } = useAuth();
    const { getActiveTokens, revokeAccessToken } = useAccessToken();
    const { getSignedUrl } = useSignedUrl();
    const navigate = useNavigate();
    const [activePatients, setActivePatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);

    const calculateRemainingTime = (expiresAt: string) => {
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
        
        try {
            const tokens = await getActiveTokens(user.id);
            const patientsWithTime = tokens.map(token => ({
                ...token,
                ...token.profiles,
                remainingTime: calculateRemainingTime(token.expires_at)
            }));
            setActivePatients(patientsWithTime.filter(p => !p.remainingTime.isExpired));
        } catch (error) {
            console.error("Error fetching active patients:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivePatients();
        
        const subscription = supabase
            .channel('access_tokens_changes')
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'access_tokens',
                filter: `doctor_id=eq.${user?.id}` 
            }, () => {
                fetchActivePatients();
            })
            .subscribe();
            
        const interval = setInterval(fetchActivePatients, 60000);
        
        return () => {
            subscription.unsubscribe();
            clearInterval(interval);
        };
    }, [user?.id]);

    const handleViewProfile = (patientId: string) => {
        navigate(`/doctor/patient/${patientId}`);
    };

    const handleRevokeAccess = async (tokenId: string) => {
        try {
            await revokeAccessToken(tokenId);
            setActivePatients(prevPatients => 
                prevPatients.filter(patient => patient.id !== tokenId)
            );
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
                    <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : activePatients.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No active patient sessions
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activePatients.map((patient) => (
                            <div key={patient.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="bg-blue-100 rounded-full p-2 mr-3">
                                            <User className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{patient.name}</p>
                                            <p className="text-sm text-gray-500">ID: {patient.health_id}</p>
                                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                                <Clock className="h-4 w-4 mr-1" />
                                                Expires in: {patient.remainingTime.hours}h {patient.remainingTime.minutes}m
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleViewProfile(patient.patient_id)}
                                            className="p-2 text-blue-600 hover:text-blue-800 transition-colors rounded-full hover:bg-gray-100"
                                            title="View Patient Profile"
                                        >
                                            <ExternalLink className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleRevokeAccess(patient.id)}
                                            className="p-2 text-gray-500 hover:text-red-500 transition-colors rounded-full hover:bg-gray-200"
                                            title="Revoke Access"
                                        >
                                            <UserX className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentPatientsAccess;