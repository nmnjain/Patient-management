import React, { useState } from 'react';
import { QrCode, Search } from 'lucide-react';

export default function QRScanner() {
  const [healthId, setHealthId] = useState('');
  const [scanning, setScanning] = useState(false);

  const handleScan = () => {
    setScanning(true);
    // Simulate QR scanning
    setTimeout(() => {
      setScanning(false);
      setHealthId('HD123456');
    }, 2000);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle manual health ID search
    console.log('Searching for health ID:', healthId);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Patient Access</h3>
      </div>

      <div className="space-y-6">
        <div>
          <button
            onClick={handleScan}
            className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={scanning}
          >
            <QrCode className="mr-2 h-5 w-5" />
            {scanning ? 'Scanning...' : 'Scan QR Code'}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>

        <form onSubmit={handleManualSearch}>
          <div className="flex space-x-2">
            <input
              type="text"
              value={healthId}
              onChange={(e) => setHealthId(e.target.value)}
              placeholder="Enter Health ID"
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}