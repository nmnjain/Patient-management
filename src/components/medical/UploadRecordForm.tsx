import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Upload } from 'lucide-react';
import { extractTextFromImage } from '../../lib/ocr';

export default function UploadRecordForm() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('1. File change event triggered');
    
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      console.log('2. Selected file:', {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size
      });
      
      setFile(selectedFile);

      if (selectedFile.type.startsWith('image/')) {
        console.log('3. File is an image, attempting OCR...');
        try {
          console.log('4. Starting text extraction...');
          const text = await extractTextFromImage(selectedFile);
          console.log('5. Extraction successful:', text);
          setExtractedText(text);
        } catch (error) {
          console.error('6. OCR failed:', error);
          alert('Failed to extract text from image');
        }
      } else {
        console.log('3. File is not an image, skipping OCR');
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    console.log('Upload started');
    e.preventDefault();
    if (!file || !user) return;

    try {
      setUploading(true);

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('medical-records')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('medical-records')
        .getPublicUrl(filePath);

      // Save record in database
      const { error: dbError } = await supabase
        .from('medical_records')
        .insert({
          patient_id: user.id,
          file_name: file.name,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          description: description,
          uploaded_by: 'patient'
        });

      if (dbError) throw dbError;

      // Reset form
      setFile(null);
      setDescription('');
      setShowModal(false);

      // Refresh the records list (you'll need to implement this)
      window.location.reload();

    } catch (error) {
      console.error('Error uploading record:', error);
      alert('Failed to upload record');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <Upload className="h-4 w-4 mr-2" />
        Upload Record
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Upload Medical Record</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>

            {extractedText && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700">Extracted Text:</h4>
                <div className="mt-1 p-2 bg-gray-50 rounded-md">
                  <pre className="text-xs">{extractedText}</pre>
                </div>
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  File
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  rows={3}
                  placeholder="Enter any additional details about this record"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!file || uploading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
} 