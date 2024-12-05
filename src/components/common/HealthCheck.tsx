import React from 'react';

export default function HealthCheck() {
  return (
    <div className="text-center p-4">
      <h1>System Online</h1>
      <p>Version: {import.meta.env.VITE_APP_VERSION || '1.0.0'}</p>
    </div>
  );
} 