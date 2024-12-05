import React from 'react';
import { Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Define the props interface
interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id?: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
  description?: string;
  doctor_name?: string;
  uploaded_by: 'patient' | 'doctor';
}

interface Props {
  records: MedicalRecord[];
  onRecordDeleted: () => void;
}

export default function MedicalRecordsList({ records }: { records: MedicalRecord[] }) {
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

      if (dbError) {
        console.error('Database deletion error:', dbError);
        throw new Error('Failed to delete record from database');
      }

      alert('Record deleted successfully');
      window.location.reload(); // Refresh the page to update the UI
    } catch (error) {
      console.error('Error in handleDelete:', error);
      
      // Check if the record was actually deleted despite the error
      const { data: checkRecord } = await supabase
        .from('medical_records')
        .select('id')
        .eq('id', record.id)
        .single();

      if (!checkRecord) {
        // Record was deleted successfully despite the error
        alert('Record deleted successfully');
        window.location.reload(); // Refresh the page to update the UI
      } else {
        alert('Failed to delete record. Please try again.');
      }
    }
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      // Extract the file path from the full URL
      // Example URL: https://...supabase.co/storage/v1/object/public/medical_records/path/to/file.pdf
      const pathRegex = /\/storage\/v1\/object\/public\/medical_records\/(.*)/;
      const match = fileUrl.match(pathRegex);
      
      if (!match || !match[1]) {
        throw new Error('Invalid file URL format');
      }

      const filePath = match[1];
      
      // Download file using Supabase
      const { data, error } = await supabase
        .storage
        .from('medical_records')
        .download(filePath);

      if (error) {
        throw error;
      }

      // Create and trigger download
      const blob = new Blob([data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file. Please try again.');
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
              <div className="flex items-start md:items-center flex-col md:flex-row md:gap-4">
                <h4 className="text-sm md:text-base font-medium text-gray-900">
                  {record.file_name}
                </h4>
                <span className="text-xs text-gray-500">
                  {new Date(record.created_at).toLocaleDateString()}
                </span>
              </div>
              
              {record.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {record.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 mt-2 md:mt-0">
              {record.file_url && (
                <a
                  href={record.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium 
                    text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 
                    transition-colors duration-200"
                >
                  <Eye className="w-4 h-4 mr-1.5" />
                  View
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}