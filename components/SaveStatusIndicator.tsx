import React from 'react';
import { IconCloud, IconCloudCheck, IconCloudOff, IconEdit, IconEye } from './Icon';
import type { SaveStatus } from '../types';

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  errorMessage?: string | null;
}

const statusConfig = {
  unsaved: {
    icon: <IconEdit className="w-5 h-5" />,
    text: 'Unsaved changes',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
  },
  saving: {
    icon: <IconCloud className="w-5 h-5 animate-pulse" />,
    text: 'Saving...',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  saved: {
    icon: <IconCloudCheck className="w-5 h-5" />,
    text: 'All changes saved',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
  },
  error: {
    icon: <IconCloudOff className="w-5 h-5" />,
    text: 'Error saving data',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
  },
  readonly: {
    icon: <IconEye className="w-5 h-5" />,
    text: 'Read-Only Mode',
    color: 'text-gray-400',
    bgColor: 'bg-gray-700/50',
  },
  idle: {
      icon: null,
      text: null,
      color: '',
      bgColor: ''
  }
};

const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({ status, errorMessage }) => {
  if (status === 'idle') {
    return null;
  }

  const { icon, text, color, bgColor } = statusConfig[status];

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-2 rounded-full shadow-lg border border-gray-600 backdrop-blur-md transition-all duration-300 ${bgColor} ${color}`}
      role="status"
      aria-live="polite"
      title={status === 'error' && errorMessage ? errorMessage : text}
    >
      {icon}
      <span className="text-sm font-semibold">{text}</span>
    </div>
  );
};

export default SaveStatusIndicator;
