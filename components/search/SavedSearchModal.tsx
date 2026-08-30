"use client";

import React, { useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';

interface SavedSearchModalProps {
  currentFilters?: Record<string, any>;
  isOpen: boolean;
  onClose: () => void;
}

export function SavedSearchModal({ currentFilters, isOpen, onClose }: SavedSearchModalProps) {
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifyTelegram, setNotifyTelegram] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSaved(true);
      toast.success('Подписка оформлена! Мы уведомим вас при появлении новых квартир.');
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 1500);
    }, 600);
  };

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
            className="card max-w-md w-full p-6 space-y-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/10 rounded-2xl shadow-2xl z-10"
            initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.96 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Bell size={18} className="text-amber-500" />
                Сохранить поиск и получать новинки
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-stone-500 dark:text-stone-400">
              Мы мгновенно пришлем уведомление в Telegram или на Email, как только собственник опубликует подходящую квартиру по вашим фильтрам.
            </p>

            {isSaved ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-3 text-emerald-700 dark:text-emerald-300">
                <Check size={20} className="text-emerald-500" />
                <span className="text-xs font-semibold">Поиск успешно сохранён в личном кабинете!</span>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Telegram @username или телефон:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="@username или +998 90 123 45 67"
                      value={notifyTelegram}
                      onChange={(e) => setNotifyTelegram(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-white/5 text-xs text-stone-900 dark:text-white outline-none focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Или Email:
                  </label>
                  <input
                    type="email"
                    placeholder="example@mail.uz"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-white/5 text-xs text-stone-900 dark:text-white outline-none focus:border-primary-500 transition-all"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-white/5 cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || (!notifyTelegram.trim() && !notifyEmail.trim())}
                    className="btn btn-primary text-xs py-2 px-5 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Сохранение...' : 'Включить авто-поиск'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
