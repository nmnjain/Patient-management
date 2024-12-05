import React from 'react';

interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function ProfileSection({ title, children, className = '' }: ProfileSectionProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}
