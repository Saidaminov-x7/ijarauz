'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Hammer, RefreshCw, KeyRound, Lock, CheckCircle2, X } from 'lucide-react';

interface MaintenanceViewProps {
  locale: string;
  initialSettings: {
    maintenanceMode?: boolean;
    maintenanceMessage?: string | null;
    maintenancePasswordEnabled?: boolean;
  };
}

export function MaintenanceView({ locale, initialSettings }: MaintenanceViewProps) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Периодический опрос API (polling раз в 10 секунд), чтобы автоматически вернуть пользователя на сайт, как только техработы завершатся
  useEffect(() => {
    const checkMaintenanceStatus = async () => {
      try {
        const res = await fetch('/api/backend/site-settings/public', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
          // Если режим обслуживания отключили - автоматически перенаправляем на главную
          if (!data.maintenanceMode) {
            router.push(`/${locale || 'ru'}`);
          }
        }
      } catch {
        // Игнорируем сетевые сбои опроса
      }
    };

    const interval = setInterval(checkMaintenanceStatus, 10000);
    return () => clearInterval(interval);
  }, [locale, router]);

  const handleManualCheck = async () => {
    setIsCheckingStatus(true);
    try {
      const res = await fetch('/api/backend/site-settings/public', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        if (!data.maintenanceMode) {
          router.push(`/${locale || 'ru'}`);
          return;
        }
      }
    } catch {
      // Игнорируем
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsVerifying(true);
    setPasswordError('');

    try {
      const res = await fetch('/api/backend/site-settings/public/check-bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.allowed) {
        // Устанавливаем cookie bypass на 24 часа
        document.cookie = `maintenance_bypass=true; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
        setShowPasswordModal(false);
        router.push(`/${locale || 'ru'}`);
        router.refresh();
      } else {
        setPasswordError(data.message || 'Неверный пароль для обхода техобслуживания');
      }
    } catch {
      setPasswordError('Ошибка соединения с сервером при проверке пароля');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Декоративный фон */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="max-w-lg w-full space-y-6 animate-in fade-in zoom-in duration-300 relative z-10">
        <div className="relative mx-auto w-24 h-24 rounded-3xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
          <Hammer className="w-12 h-12 animate-bounce" />
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-xs">
            !
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            Технические работы
          </h1>
          <p className="text-stone-400 text-base leading-relaxed">
            {settings.maintenanceMessage ||
              'Сайт находится в разработке. Мы скоро вернемся с обновленной версией!'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 text-xs text-stone-400 flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Все сервисы платформы временно приостановлены для обновления</span>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleManualCheck}
            disabled={isCheckingStatus}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isCheckingStatus ? 'animate-spin' : ''}`} />
            Проверить доступ
          </button>

          {settings.maintenancePasswordEnabled && (
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-sm font-semibold transition-all"
            >
              <KeyRound className="w-4 h-4 text-teal-400" />
              Ввести пароль
            </button>
          )}
        </div>
      </div>

      {/* Модальное окно ввода пароля */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-stone-900 border border-stone-800 p-6 shadow-2xl text-left space-y-4">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Доступ по паролю</h3>
                <p className="text-xs text-stone-400">Введите пароль для раннего доступа к сайту</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5">
                  Пароль обхода
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль..."
                  autoFocus
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white placeholder-stone-500 text-sm focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>

              {passwordError && (
                <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-xs text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-400 hover:text-white text-sm font-medium transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isVerifying || !password.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold transition-all disabled:opacity-50"
                >
                  {isVerifying ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Войти на сайт
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
