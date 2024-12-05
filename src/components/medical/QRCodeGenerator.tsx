import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Fingerprint, Copy, Check, QrCode, RefreshCw } from 'lucide-react';

interface QRCodeGeneratorProps {
  healthId: string;
}

export default function QRCodeGenerator({ healthId }: QRCodeGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  const generateQRValue = () => {
    // Generate a temporary token using timestamp and random string
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    return `${healthId}_${timestamp}_${randomStr}`;
  };

  const refreshQR = () => {
    setQrValue(generateQRValue());
    setTimeLeft(300); // Reset timer to 5 minutes
  };

  useEffect(() => {
    if (showQR) {
      refreshQR();
      // Start countdown timer
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            refreshQR();
            return 300;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showQR]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(healthId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
        <div className="w-full">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
            Your Health ID
          </h3>
          <p className="text-sm md:text-base text-gray-600 mb-4">
            Share this QR code with healthcare providers for quick access to your records
          </p>
          <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg mb-4">
            <Fingerprint className="w-5 h-5 text-indigo-600 flex-shrink-0" />
            <span className="text-sm md:text-base font-mono truncate">{healthId}</span>
            <button
              onClick={handleCopy}
              className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
              title="Copy Health ID"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>

          <button
            onClick={() => setShowQR(!showQR)}
            className="flex items-center justify-center px-4 py-2 rounded-lg 
              bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors w-full"
          >
            <QrCode className="w-5 h-5 mr-2" />
            {showQR ? 'Hide QR Code' : 'Show QR Code'}
          </button>
        </div>
        
        {showQR && (
          <div className="w-full md:w-1/2 flex flex-col items-center">
            <div className="bg-white p-2 rounded-lg shadow-sm mb-2">
              <QRCodeSVG 
                value={qrValue}
                size={150}
                level="H"
                className="w-32 h-32 md:w-40 md:h-40"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Expires in: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
              <button
                onClick={refreshQR}
                className="p-1 hover:bg-gray-100 rounded-full"
                title="Refresh QR Code"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}