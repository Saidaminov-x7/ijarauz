"use client";

import React, { useState } from 'react';
import { Send, Image as ImageIcon, Video, RotateCw, Star, ThumbsUp, ShieldCheck, Share2, Copy, Check, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

/**
 * 1. Интерактивный 360° Panorama Viewer (Виртуальный 3D тур)
 */
export function Panorama360Viewer({ imageUrl }: { imageUrl: string }) {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - startX;
    setRotation((prev) => (prev + delta * 0.4) % 360);
    setStartX(e.clientX);
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="relative aspect-16/9 w-full rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing border border-stone-200 dark:border-white/10 bg-black select-none"
    >
      <div
        className="w-full h-full bg-cover bg-center transition-all duration-75"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundPosition: `${rotation}% center`,
          transform: 'scale(1.05)',
        }}
      />
      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold">
        <RotateCw size={14} className="animate-spin" />
        360° Виртуальная панорама (Перетаскивайте для вращения)
      </div>
    </div>
  );
}

/**
 * 2. Модальное окно красивого шаринга в Telegram / WhatsApp
 */
export function ShareModal({
  isOpen,
  onClose,
  title,
  price,
  district,
  city,
  url,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  price: number;
  district: string;
  city: string;
  url: string;
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const messageText = `🏠 ${title}\n💰 Цена: $${price}/мес\n📍 Район: ${district}, ${city}\n🔗 Смотреть на Ijarauz: ${url}`;

  const shareTelegram = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(messageText)}`;
    window.open(tgUrl, '_blank');
  };

  const shareWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;
    window.open(waUrl, '_blank');
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Ссылка скопирована!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="card max-w-md w-full p-6 space-y-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/10 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <Share2 size={18} className="text-teal-500" />
            Поделиться объявлением
          </h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 dark:hover:text-white cursor-pointer">
            ✕
          </button>
        </div>

        <p className="text-xs text-stone-500 dark:text-stone-400">
          Отправьте ссылку семье, друзьям или в Telegram-группы поиска жилья в один клик:
        </p>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={shareTelegram}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#2AABEE] text-white font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
          >
            <Send size={15} />
            В Telegram
          </button>
          <button
            type="button"
            onClick={shareWhatsApp}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] text-white font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
          >
            <MessageSquare size={15} />
            В WhatsApp
          </button>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            readOnly
            value={url}
            className="flex-1 h-10 px-3 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-white/5 text-xs text-stone-600 dark:text-stone-300 font-mono outline-none"
          />
          <button
            type="button"
            onClick={copyToClipboard}
            className="flex h-10 px-4 items-center justify-center gap-1.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-500 transition-colors cursor-pointer"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Скопировано' : 'Копировать'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 3. Отзывы и Рейтинг арендодателя
 */
export function LandlordReviewsSection({ landlordName = "Владелец", rating = 4.9 }: { landlordName?: string; rating?: number }) {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      author: 'Азиз Каримов',
      date: '12 февраля 2026',
      rating: 5,
      comment: 'Отличный хозяин, квартира полностью соответствует фотографиям. Залог вернул вовремя без лишних вопросов!',
      cleanliness: 5,
      punctuality: 5,
    },
    {
      id: 2,
      author: 'Елена Смирнова',
      date: '28 января 2026',
      rating: 5,
      comment: 'Тихий район, мебель новая, коммуналка адекватная. Очень вежливый собственник.',
      cleanliness: 5,
      punctuality: 4,
    },
  ]);

  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          cleanliness: 5,
          punctuality: 5,
        },
        ...reviews,
      ]);
      setNewComment('');
      setIsSubmitting(false);
      toast.success('Спасибо за ваш отзыв!');
    }, 400);
  };

  return (
    <div className="space-y-6 pt-6 border-t border-stone-200 dark:border-white/10">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-stone-900 dark:text-white">
            Отзывы об арендодателе ({landlordName})
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Оценки реальных жильцов по пунктуальности, чистоте и возврату депозита
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 font-bold text-sm">
          <Star size={16} className="fill-amber-400 text-amber-400" />
          {rating} / 5.0
        </div>
      </div>

      {/* Список отзывов */}
      <div className="space-y-3">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="p-4 rounded-xl border border-stone-200 dark:border-white/5 bg-stone-50/50 dark:bg-white/5 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 dark:text-white">{rev.author}</span>
              <span className="text-[11px] text-stone-400">{rev.date}</span>
            </div>
            <div className="flex items-center gap-1 text-amber-400">
              {Array.from({ length: rev.rating }).map((_, i) => (
                <Star key={i} size={12} className="fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              {rev.comment}
            </p>
          </div>
        ))}
      </div>

      {/* Форма добавления отзыва */}
      <form onSubmit={handleAddReview} className="space-y-3 p-4 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-stone-900">
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
              <Star size={16} className={val <= newRating ? 'fill-amber-400' : 'text-stone-300 dark:text-stone-600'} />
            </button>
          ))}
        </div>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Опишите ваши впечатления от общения с хозяином и состояния квартиры..."
          rows={2}
          className="w-full p-3 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-white/5 text-xs text-stone-900 dark:text-white placeholder-stone-400 outline-none focus:border-teal-500 transition-all resize-none"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="btn btn-primary text-xs py-2 px-5"
          >
            {isSubmitting ? 'Отправка...' : 'Опубликовать отзыв'}
          </button>
        </div>
      </form>
    </div>
  );
}
