'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
}) => {
  const prefersReducedMotion = useReducedMotion();

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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
          />
          <motion.div
            className={`relative w-full ${maxWidth} rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#1A1A1A] border border-stone-200 dark:border-white/10 z-10`}
            initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.96 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100 dark:border-white/10">
              {title && (
                <div className="text-lg font-bold text-stone-900 dark:text-white">
                  {typeof title === 'string' ? <h3>{title}</h3> : title}
                </div>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Закрыть"
                className="ml-auto p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-white/10 dark:hover:text-stone-200 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
