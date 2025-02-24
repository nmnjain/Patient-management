import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import Sidebar from '../layout/Sidebar';
import MedicalRecordsList from '../medical/MedicalRecordsList';
import ProfileCard from '../profile/ProfileCard';
import QRCodeGenerator from '../medical/QRCodeGenerator';
import { useStorage } from '../../hooks/useStorage';
import { FileText, Upload, AlertCircle, ChevronRight, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MedicalChatbot from '../medical/MedicalChatbot';

import { extractTextFromImage } from '../../lib/ocr';

import { medicalAI } from '../../services/medicalAIService';

interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id?: string;
  file_name: string;
  file_url: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
  description?: string;
  uploaded_by: 'patient' | 'doctor';
  doctor_name?: string;
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const { uploadFile } = useStorage();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const [customFileName, setCustomFileName] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [extractedText, setExtractedText] = useState<string>('');

  const fetchMedicalRecords = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('medical_records')
        .select(`
          id,
          patient_id,
          doctor_id,
          file_name,
          file_url,
          file_path,
          file_type,
          file_size,
          created_at,
          description,
          doctor_name,
          uploaded_by
        `)
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching records:', error);
        return;
      }

      if (data) {
        // Make sure each record has a file_path
        const processedData = data.map(record => ({
          ...record,
          file_path: record.file_path || extractPathFromUrl(record.file_url)
        }));
        setMedicalRecords(processedData);
      }
    } catch (error) {
      console.error('Error in fetchMedicalRecords:', error);
    }
  };

  // Helper function to extract path from URL if needed
  const extractPathFromUrl = (url: string) => {
    try {
      const pathMatch = url.match(/\/storage\/v1\/object\/public\/medical_records\/(.*)/);
      return pathMatch ? pathMatch[1] : url;
    } catch (error) {
      console.error('Error extracting path:', error);
      return url;
    }
  };

  useEffect(() => {
    fetchMedicalRecords();
  }, [user]);

  const handleFileUpload = async () => {
    if (!selectedFile || !user) return;
  
    try {
      setIsUploading(true);
      setUploadError(null);
  
      const formattedDate = selectedDate.replace(/-/g, '/');
      const finalFileName = `${customFileName}_${formattedDate}${selectedFile.name.substring(selectedFile.name.lastIndexOf('.'))}`;
  
      // Upload file and get the record ID
      const uploadResult = await uploadFile(selectedFile, user.id, {
        description: description,
        uploaded_by: 'patient',
        custom_file_name: finalFileName,
        is_processed: false
      });
  
      // If it's an image file, process with OCR and AI
      if (selectedFile.type.startsWith('image/')) {
        try {
          const extractedText = await extractTextFromImage(selectedFile);
          if (extractedText) {
            await medicalAI.processMedicalRecord(extractedText, uploadResult.recordId, user.id);
          }
        } catch (ocrError) {
          console.error('OCR/AI processing error:', ocrError);
          // Continue with the upload even if OCR/AI processing fails
        }
      }
  
      setSelectedFile(null);
      setDescription('');
      setCustomFileName('');
      setSelectedDate(new Date().toISOString().split('T')[0]);
  
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
  
      await fetchMedicalRecords();
  
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload or process file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  const handleRecordDeleted = () => {
    fetchMedicalRecords();
  };


  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8 pt-12 md:pt-0">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 md:mb-0">
              Welcome Back
              <span className="block text-base md:text-lg font-medium text-gray-600 mt-1">
                Manage your health records and information
              </span>
            </h1>
            <div className="flex items-center space-x-2 md:space-x-4">
              <Calendar className="h-5 w-5 md:h-6 md:w-6 text-indigo-600" />
              <span className="text-sm md:text-lg text-gray-700">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:gap-8 mb-4 md:mb-8">
            <ProfileCard />
            <QRCodeGenerator healthId={user?.healthId || ''} />
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6 mb-4 md:mb-8">
            <h2 className="text-xl md:text-2xl font-semibold flex items-center text-gray-800 mb-4 md:mb-6">
              <FileText className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-indigo-600" />
              Upload Medical Record
            </h2>

            <div className="grid grid-cols-1 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  File Name
                </label>
                <input
                  type="text"
                  value={customFileName}
                  onChange={(e) => setCustomFileName(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter file name (e.g., eyesreport)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter record description"
                />
              </div>

              <div className="flex flex-col gap-3">
                <input
                  type="file"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    console.log('File selected:', file?.name);

                    setSelectedFile(file || null);
                    setExtractedText(''); // Reset extracted text

                    if (file && file.type.startsWith('image/')) {
                      try {
                        console.log('Processing image file for OCR...');
                        const text = await extractTextFromImage(file);
                        console.log('Extracted text:', text);
                        setExtractedText(text);
                      } catch (error) {
                        console.error('OCR failed:', error);
                      }
                    }
                  }}
                  className="w-full text-sm text-gray-500 
    file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 
    file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 
    hover:file:bg-indigo-100 focus:outline-none"
                />
                <button
                  onClick={handleFileUpload}
                  disabled={!selectedFile || isUploading}
                  className="w-full flex items-center justify-center px-4 py-2.5 
                    rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>

              

              {uploadError && (
                <div className="flex items-center text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  {uploadError}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-200">
            <div className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800 flex items-center mb-3 md:mb-0">
                  <FileText className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-indigo-600" />
                  Recent Medical Records
                </h2>
                <button
                  onClick={() => navigate('/medical-records')}
                  className="flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 
                  hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                >
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>

              {medicalRecords.length > 0 ? (
                <MedicalRecordsList
                  records={medicalRecords}
                  onRecordDeleted={handleRecordDeleted}
                />
              ) : (
                <div className="text-center py-8 md:py-12">
                  <FileText className="h-10 w-10 md:h-12 md:w-12 text-gray-300 mx-auto mb-3 md:mb-4" />
                  <p className="text-gray-500">No medical records found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <MedicalChatbot />


    </div>
  );
}