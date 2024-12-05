import React from 'react';

interface ProfileFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function ProfileField({ label, children, className = '' }: ProfileFieldProps) {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
