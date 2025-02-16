import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Trash2, Eye, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../layout/Sidebar';
import { useSignedUrl } from '../../hooks/useSignedUrl';

interface MedicalRecord {
  id: string;
  patient_id: string;
  file_name: string;
  file_path: string;
  created_at: string;
  description?: string;
  uploaded_by: 'patient' | 'doctor';
}

export default function MedicalRecordPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const { getSignedUrl, loading: urlLoading } = useSignedUrl();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    const fetchRecords = async () => {
      try {
        const { data, error } = await supabase
          .from('medical_records')
          .select(`
            id,
            patient_id,
            file_name,
            file_path,
            created_at,
            description,
            uploaded_by
          `)
          .eq('patient_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching records:', error);
          return;
        }

        setRecords(data || []);
      } catch (error) {
        console.error('Error in fetchRecords:', error);
      } finally {
        setPageLoading(false);
      }
    };

    fetchRecords();
  }, [user, loading, navigate]);

  const handleDelete = async (recordId: string) => {
    try {
      const { error: dbError } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', recordId);

      if (dbError) {
        console.error('Database deletion error:', dbError);
        throw new Error('Failed to delete record from database');
      }

      setRecords((prevRecords) => prevRecords.filter(record => record.id !== recordId));

      alert('Record deleted successfully');
    } catch (error) {
      console.error('Error in handleDelete:', error);
      alert('Failed to delete record. Please try again.');
    }
  };

  const handleViewFile = async (record: MedicalRecord) => {
    try {
      const signedUrl = await getSignedUrl(record.file_path);
      window.open(signedUrl, '_blank');
    } catch (error) {
      console.error('Error viewing file:', error);
      alert('Failed to access file. Please try again.');
    }
  };

  if (loading || pageLoading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Medical Records</h1>
            <div>Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <FileText className="mr-2 h-6 w-6 text-indigo-600" />
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Medical Records</h1>
          </div>

          {records.length > 0 ? (
            <div className="space-y-4">
              {records.map((record) => (
                <div 
                  key={record.id} 
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-100
                    hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center gap-2">
                        <h3 className="font-medium text-gray-900">{record.file_name}</h3>
                        <span className="text-sm text-gray-500">
                          {new Date(record.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {record.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {record.description}
                        </p>
                      )}
                      
                      <p className="text-xs text-gray-400 mt-1">
                        Uploaded by: {record.uploaded_by === 'patient' ? 'You' : 'Doctor'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewFile(record)}
                        disabled={urlLoading}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium 
                          text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 
                          transition-colors duration-200 disabled:opacity-50
                          disabled:cursor-not-allowed"
                      >
                        <Eye className="w-4 h-4 mr-1.5" />
                        {urlLoading ? 'Loading...' : 'View'}
                      </button>

                      {record.uploaded_by === 'patient' && (
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium 
                            text-red-600 bg-red-50 rounded-lg hover:bg-red-100 
                            transition-colors duration-200"
                          title="Delete record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No medical records found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}