'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#1A1A1A] border border-stone-200 dark:border-white/10 z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100 dark:border-white/10">
          {title && <h3 className="text-lg font-bold text-stone-900 dark:text-white">{title}</h3>}
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-white/10 dark:hover:text-stone-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
