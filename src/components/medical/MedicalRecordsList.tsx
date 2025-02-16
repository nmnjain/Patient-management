import React from 'react';
import { Eye, Trash2, FileText, User, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSignedUrl } from '../../hooks/useSignedUrl';

interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id?: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
  description?: string;
  doctor_name?: string;
  uploaded_by: 'patient' | 'doctor';
}

interface Props {
  records: MedicalRecord[];
  onRecordDeleted?: () => void;
}

export default function MedicalRecordsList({ records, onRecordDeleted }: Props) {
  const { getSignedUrl, loading } = useSignedUrl();

  const handleDelete = async (record: MedicalRecord) => {
    try {
      if (record.uploaded_by !== 'patient') {
        alert('You can only delete records that you uploaded.');
        return;
      }

      const confirmDelete = window.confirm('Are you sure you want to delete this record?');
      if (!confirmDelete) return;

      // Delete from database
      const { error: dbError } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', record.id);

      if (dbError) throw dbError;

      onRecordDeleted?.();
      alert('Record deleted successfully');
    } catch (error) {
      console.error('Error in handleDelete:', error);
      alert('Failed to delete record. Please try again.');
    }
  };

  const handleViewFile = async (record: MedicalRecord) => {
    try {
      // Get a fresh signed URL each time the file is viewed
      const signedUrl = await getSignedUrl(record.file_path);
      window.open(signedUrl, '_blank');
    } catch (error) {
      console.error('Error viewing file:', error);
      alert('Failed to access file. Please try again.');
    }
  };

  return (
    <div className="space-y-3">
      {records.map((record) => (
        <div 
          key={record.id}
          className="bg-white border border-gray-100 rounded-lg p-3 md:p-4 
            hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1">
              <div className="flex items-start">
                <FileText className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">
                    {record.file_name}
                  </h4>
                  {record.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {record.description}
                    </p>
                  )}
                  <div className="flex items-center mt-2 space-x-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(record.created_at).toLocaleDateString()}
                    </div>
                    {record.doctor_name && (
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-1" />
                        {record.doctor_name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleViewFile(record)}
                disabled={loading}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium 
                  text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 
                  transition-colors duration-200 disabled:opacity-50 
                  disabled:cursor-not-allowed"
              >
                <Eye className="w-4 h-4 mr-1.5" />
                {loading ? 'Loading...' : 'View'}
              </button>

              {record.uploaded_by === 'patient' && (
                <button
                  onClick={() => handleDelete(record)}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium 
                    text-red-600 bg-red-50 rounded-lg hover:bg-red-100 
                    transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}