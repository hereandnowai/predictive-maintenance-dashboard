
import React, { ReactNode } from 'react';
import { XCircleIcon } from './icons';
import { BRAND_CONFIG } from '../constants';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };
  const brandColors = BRAND_CONFIG.brand.colors;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300 ease-in-out">
      <div className={`bg-white rounded-lg shadow-xl p-6 w-full ${sizeClasses[size]} transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalShow`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-semibold text-[${brandColors.secondary}]`}>{title}</h2>
          <button onClick={onClose} className={`text-gray-500 hover:text-[${brandColors.secondary}] focus:outline-none focus:ring-2 focus:ring-[${brandColors.primary}] rounded-md`}>
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <div>{children}</div>
      </div>
      {/* Animation is in index.html global styles now */}
    </div>
  );
};
