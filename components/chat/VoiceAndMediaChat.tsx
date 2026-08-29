"use client";

import React, { useState } from 'react';
import { Send, Image as ImageIcon, CheckCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceAndMediaChatProps {
  onSendMessage: (msg: { text?: string; audioUrl?: string; imageUrl?: string }) => void;
}

export function VoiceAndMediaChat({ onSendMessage }: VoiceAndMediaChatProps) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Старт записи голосового сообщения
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        toast.error('Ваш браузер не поддерживает запись аудио');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(blob);
        onSendMessage({ audioUrl, text: '🎤 Голосовое сообщение' });
        toast.success('Голосовое сообщение записано!');
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingDuration(0);

      const interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      (recorder as any)._timer = interval;
    } catch (err) {
      toast.error('Нет доступа к микрофону');
    }
  };

  // Остановка записи
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      clearInterval((mediaRecorder as any)._timer);
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // Загрузка фото вложения
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите файл изображения');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      onSendMessage({ imageUrl: reader.result as string, text: '📷 Фотография объекта' });
      setIsUploading(false);
      toast.success('Фото прикреплено к сообщению');
    };
    reader.readAsDataURL(file);
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage({ text: text.trim() });
    setText('');
  };

  return (
    <div className="p-3 border-t border-stone-200 dark:border-white/10 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md">
      <form onSubmit={handleSendText} className="flex items-center gap-2">
        {/* Кнопка загрузки фото */}
        <label className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading || isRecording}
            className="hidden"
          />
          {isUploading ? <Loader2 size={18} className="animate-spin text-teal-500" /> : <ImageIcon size={18} />}
        </label>

        {/* Поле ввода текста / Индикатор записи */}
        {isRecording ? (
          <div className="flex-1 flex items-center justify-between px-4 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-semibold animate-pulse">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-600" />
              Запись аудио... {recordingDuration}с
            </div>
            <button
              type="button"
              onClick={stopRecording}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
            >
              Отправить
            </button>
          </div>
        ) : (
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Напишите сообщение арендодателю..."
            className="flex-1 h-10 px-4 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-white/5 text-sm text-stone-900 dark:text-white placeholder-stone-400 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
          />
        )}

        {/* Кнопка записи голоса (если текста нет) или отправки сообщения */}
        {text.trim() ? (
          <button
            type="submit"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white hover:bg-teal-500 transition-colors shadow-sm flex-shrink-0 cursor-pointer"
          >
            <Send size={16} />
          </button>
        ) : !isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-stone-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition-colors flex-shrink-0 cursor-pointer"
            title="Записать голосовое сообщение"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          </button>
        ) : null}
      </form>
    </div>
  );
}
