"use client";

import React, { useState, useEffect } from 'react';
import { Send, Star, Share2, Copy, Check, MessageSquare, Share } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';

/**
 * 1. Модальное окно красивого шаринга с предпросмотром фото, цены, системным Web Share и блокировкой скролла
 */
export function ShareModal({
  isOpen,
  onClose,
  title,
  price,
  district,
  city,
  image,
  url,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  price: number;
  district: string;
  city: string;
  image?: string;
  url: string;
}) {
  const [copied, setCopied] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Блокировка скролла фона при открытой модалке
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const messageText = `🏠 ${title}\n💰 Цена: $${price}/мес\n📍 Район: ${district ? `${district}, ` : ''}${city}\n🔗 Смотреть на Ijarauz: ${url}`;

  const shareTelegram = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(messageText)}`;
    window.open(tgUrl, '_blank');
  };

  const shareWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;
    window.open(waUrl, '_blank');
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: messageText,
          url,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Ссылка скопирована в буфер обмена!');
    setTimeout(() => setCopied(false), 2000);
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
            className="card max-w-md w-full p-6 space-y-4 bg-white dark:bg-[#1E1E1E] border border-stone-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10"
            initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.96 }}
            transition={{ duration: 0.15 }}
          >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <Share2 size={18} className="text-teal-500" />
            Поделиться квартирой
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Карточка предпросмотра с фото и ценой */}
        <div className="flex gap-3 p-3 rounded-xl border border-stone-100 bg-stone-50 dark:border-white/5 dark:bg-white/5 items-center">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-20 h-16 object-cover rounded-lg shrink-0"
            />
          ) : (
            <div className="w-20 h-16 rounded-lg bg-teal-600/20 text-teal-600 flex items-center justify-center shrink-0 font-bold text-xs">
              Ijarauz
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-stone-900 dark:text-white truncate">
              {title}
            </h4>
            <p className="text-[11px] text-stone-400 truncate">
              {district ? `${district}, ` : ''}{city}
            </p>
            <div className="text-xs font-black text-teal-600 dark:text-teal-400 mt-1">
              ${price} / месяц
            </div>
          </div>
        </div>

        {/* Кнопки мессенджеров и системного шаринга */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <button
            type="button"
            onClick={shareTelegram}
            className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl bg-[#2AABEE] text-white font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
          >
            <Send size={16} />
            <span>Telegram</span>
          </button>
          <button
            type="button"
            onClick={shareWhatsApp}
            className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl bg-[#25D366] text-white font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
          >
            <MessageSquare size={16} />
            <span>WhatsApp</span>
          </button>
          <button
            type="button"
            onClick={shareNative}
            className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl bg-stone-800 text-white dark:bg-stone-700 font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
          >
            <Share size={16} />
            <span>Системный</span>
          </button>
        </div>

        {/* Копирование прямой ссылки */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            readOnly
            value={url}
            className="flex-1 h-10 px-3 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-white/5 text-xs text-stone-600 dark:text-stone-300 font-mono outline-none"
          />
          <button
            type="button"
            onClick={copyToClipboard}
            className="flex h-10 px-4 items-center justify-center gap-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-500 transition-colors cursor-pointer shrink-0"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Скопировано' : 'Копировать'}
          </button>
        </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/**
 * 2. Отзывы и Рейтинг арендодателя с карточным фоном и честным пересчётом средней оценки
 */
export function LandlordReviewsSection({
  landlordName = "Владелец",
  rating = 4.9,
}: {
  landlordName?: string;
  rating?: number;
}) {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      author: 'Азиз Каримов',
      date: '12 февраля 2026',
      rating: 5,
      comment: 'Отличный хозяин, квартира полностью соответствует фотографиям. Залог вернул вовремя без лишних вопросов!',
    },
    {
      id: 2,
      author: 'Елена Смирнова',
      date: '28 января 2026',
      rating: 5,
      comment: 'Тихий район, мебель новая, коммуналка адекватная. Очень вежливый собственник.',
    },
  ]);

  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Динамический точный расчёт среднего рейтинга
  const totalScore = reviews.reduce((acc, r) => acc + r.rating, 0);
  const currentAverageRating = reviews.length > 0
    ? (totalScore / reviews.length).toFixed(1)
    : rating.toFixed(1);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setReviews([
        {
          id: Date.now(),
          author: 'Вы (Арендатор)',
          date: 'Только что',
          rating: newRating,
          comment: newComment.trim(),
        },
        ...reviews,
      ]);
      setNewComment('');
      setIsSubmitting(false);
      toast.success('Спасибо! Ваш отзыв добавлен и учтен в рейтинге.');
    }, 300);
  };

  return (
    <div className="rounded-2xl border border-stone-200/80 dark:border-white/10 bg-white dark:bg-[#1A1A1A] p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-bold text-stone-900 dark:text-white">
            Отзывы об арендодателе ({landlordName})
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Оценки реальных жильцов по пунктуальности, чистоте и возврату депозита
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 font-bold text-sm">
          <Star size={16} className="fill-amber-400 text-amber-400" />
          {currentAverageRating} / 5.0
        </div>
      </div>

      {/* Список отзывов */}
      <div className="space-y-3">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="p-4 rounded-xl border border-stone-100 dark:border-white/5 bg-stone-50/70 dark:bg-white/5 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 dark:text-white">{rev.author}</span>
              <span className="text-[11px] text-stone-400">{rev.date}</span>
            </div>
            <div className="flex items-center gap-1 text-amber-400">
              {Array.from({ length: rev.rating }).map((_, i) => (
                <Star key={i} size={13} className="fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              {rev.comment}
            </p>
          </div>
        ))}
      </div>

      {/* Форма добавления отзыва */}
      <form onSubmit={handleAddReview} className="space-y-3 p-4 rounded-xl border border-stone-200/70 dark:border-white/5 bg-stone-50/50 dark:bg-stone-900/50">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
          Оставить отзыв о проживании
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500">Ваша оценка:</span>
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              type="button"
              key={val}
              onClick={() => setNewRating(val)}
              className="text-amber-400 hover:scale-110 transition-transform cursor-pointer"
            >
              <Star size={18} className={val <= newRating ? 'fill-amber-400' : 'text-stone-300 dark:text-stone-600'} />
            </button>
          ))}
        </div>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Опишите ваши впечатления от общения с хозяином и состояния квартиры..."
          rows={2}
          className="w-full p-3 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs text-stone-900 dark:text-white placeholder-stone-400 outline-none focus:border-teal-500 transition-all resize-none"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="btn btn-primary text-xs py-2 px-5 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Отправка...' : 'Опубликовать отзыв'}
          </button>
        </div>
      </form>
    </div>
  );
}
