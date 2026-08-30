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
            <Share2 size={18} className="text-primary-500" />
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
            <div className="w-20 h-16 rounded-lg bg-primary-600/20 text-primary-600 flex items-center justify-center shrink-0 font-bold text-xs">
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
            <div className="text-xs font-black text-primary-600 dark:text-primary-400 mt-1">
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
            className="flex h-10 px-4 items-center justify-center gap-1.5 rounded-xl bg-primary-600 text-white text-xs font-bold hover:bg-primary-500 transition-colors cursor-pointer shrink-0"
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

import { getListingReviews, createListingReview, type ReviewItem } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * 2. Отзывы и Рейтинг арендодателя с реальной базой данных и пересчётом средней оценки
 */
export function LandlordReviewsSection({
  listingId,
  landlordName = "Владелец",
  rating = 5.0,
  onReviewAdded,
}: {
  listingId?: string;
  landlordName?: string;
  rating?: number;
  onReviewAdded?: (newAverageRating: number, newTotalReviews: number) => void;
}) {
  const { isAuthenticated } = useAuthStore();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [averageRating, setAverageRating] = useState(rating);
  const [totalReviewsCount, setTotalReviewsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!listingId) return;
    let isMounted = true;
    setIsLoading(true);
    getListingReviews(listingId)
      .then((data) => {
        if (!isMounted) return;
        setReviews(data.items || []);
        setTotalReviewsCount(data.totalReviews || 0);
        if (data.totalReviews > 0) {
          setAverageRating(data.averageRating);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [listingId]);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!isAuthenticated) {
      toast.error('Пожалуйста, войдите в аккаунт, чтобы оставить отзыв');
      return;
    }
    if (!listingId) return;

    setIsSubmitting(true);
    try {
      const created = await createListingReview(listingId, newRating, newComment.trim());
      const updatedReviews = [created, ...reviews];
      setReviews(updatedReviews);
      
      const newTotal = totalReviewsCount + 1;
      setTotalReviewsCount(newTotal);

      const totalScore = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
      const computedAvg = Number((totalScore / updatedReviews.length).toFixed(1));
      setAverageRating(computedAvg);

      if (onReviewAdded) {
        onReviewAdded(computedAvg, newTotal);
      }

      setNewComment('');
      setNewRating(5);
      toast.success('Спасибо! Ваш отзыв опубликован и учтен в рейтинге.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Не удалось отправить отзыв');
    } finally {
      setIsSubmitting(false);
    }
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
          {totalReviewsCount > 0 ? (
            <>
              <span>{averageRating.toFixed(1)} / 5.0</span>
              <span className="text-stone-400 font-normal text-xs">({totalReviewsCount})</span>
            </>
          ) : (
            <span>Пока нет отзывов (0)</span>
          )}
        </div>
      </div>

      {/* Список отзывов */}
      {isLoading ? (
        <div className="space-y-2">
          <div className="h-20 rounded-xl bg-stone-100 dark:bg-white/5 animate-pulse" />
          <div className="h-20 rounded-xl bg-stone-100 dark:bg-white/5 animate-pulse" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-6 rounded-xl border border-dashed border-stone-200 dark:border-white/10 text-center text-xs text-stone-500 dark:text-stone-400">
          Пока нет отзывов об этом объекте. Будьте первым, кто поделится своим опытом!
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 rounded-xl border border-stone-100 dark:border-white/5 bg-stone-50/70 dark:bg-white/5 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {rev.authorAvatar ? (
                    <img
                      src={rev.authorAvatar}
                      alt={rev.author}
                      className="h-7 w-7 rounded-full object-cover border border-stone-200 dark:border-white/10"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 flex items-center justify-center text-xs font-bold">
                      {rev.author.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-bold text-stone-900 dark:text-white">{rev.author}</span>
                </div>
                <span className="text-[11px] text-stone-400">
                  {new Date(rev.createdAt).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    className={i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200 dark:text-stone-700'}
                  />
                ))}
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {rev.comment}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Форма добавления отзыва */}
      <form onSubmit={handleAddReview} className="space-y-3 p-4 rounded-xl border border-stone-200/70 dark:border-white/5 bg-stone-50/50 dark:bg-stone-900/50">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
          Оставить отзыв о проживании
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500">Ваша оценка:</span>
          <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map((val) => {
              const active = hoverRating ? val <= hoverRating : val <= newRating;
              return (
                <button
                  type="button"
                  key={val}
                  onMouseEnter={() => setHoverRating(val)}
                  onClick={() => setNewRating(val)}
                  className="text-amber-400 hover:scale-125 transition-transform cursor-pointer p-0.5"
                >
                  <Star
                    size={20}
                    className={active ? 'fill-amber-400 text-amber-400' : 'text-stone-300 dark:text-stone-600'}
                  />
                </button>
              );
            })}
          </div>
          <span className="text-xs font-bold text-amber-500 ml-1">
            {hoverRating || newRating} / 5
          </span>
        </div>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Опишите ваши впечатления от общения с хозяином и состояния квартиры..."
          rows={3}
          className="w-full p-3 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs text-stone-900 dark:text-white placeholder-stone-400 outline-none focus:border-primary-500 transition-all resize-none"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs py-2 px-5 cursor-pointer disabled:opacity-50 transition-colors shadow-sm"
          >
            {isSubmitting ? 'Отправка...' : 'Опубликовать отзыв'}
          </button>
        </div>
      </form>
    </div>
  );
}
