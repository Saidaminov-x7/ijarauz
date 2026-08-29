'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGoogleLogin } from '@react-oauth/google';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import { googleAuth, getMe } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { ArrowRight, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface GoogleAuthButtonProps {
  locale: string;
  mode?: 'login' | 'register';
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export function GoogleAuthButton({ locale, mode = 'login' }: GoogleAuthButtonProps) {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [step, setStep] = useState<'idle' | 'phone' | 'otp' | 'loading' | 'done'>('idle');
  const [tokenValue, setTokenValue] = useState<string | null>(null);
  const [phone, setPhone] = useState('+998');
  const [otpCode, setOtpCode] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const recaptchaRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const finishAuth = (res: { accessToken?: string; token?: string; user?: unknown }) => {
    const token = res.accessToken || res.token;
    const user = res.user as Parameters<typeof setAuth>[0] | undefined;
    if (token && user) {
      setAuth(user, token);
      setStep('done');
      const redirectParam = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('redirect')
        : null;
      const redirect = redirectParam || '/profile';
      const destination = redirect.startsWith('/') ? `/${locale}${redirect}` : `/${locale}/${redirect}`;
      setTimeout(() => {
        router.push(destination);
      }, 300);
      return true;
    }
    return false;
  };

  const tryGoogleAuth = async (payload: {
    idToken: string;
    phone?: string;
  }) => {
    const res = await googleAuth(payload);
    if (!res.user && (res.accessToken || res.token)) {
      useAuthStore.getState().setToken(res.accessToken || res.token);
      res.user = await getMe();
    }
    return finishAuth(res);
  };

  const handleToken = async (token: string) => {
    setError(null);
    setTokenValue(token);
    setStep('loading');
    try {
      await tryGoogleAuth({ idToken: token });
    } catch (err: any) {
      const code = err.response?.data?.code;
      const status = err.response?.status;
      if (status === 400 && (code === 'PHONE_REQUIRED' || String(err.response?.data?.message || '').includes('Phone'))) {
        setStep('phone');
      } else {
        setStep('idle');
        setError(err.response?.data?.message || 'Не удалось войти через Google');
      }
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      if (tokenResponse.access_token) {
        void handleToken(tokenResponse.access_token);
      }
    },
    onError: () => {
      setStep('idle');
      setError('Вход через Google отменён или произошла ошибка');
    },
  });

  const setupRecaptcha = () => {
    if (recaptchaVerifierRef.current) return recaptchaVerifierRef.current;
    if (!recaptchaRef.current) throw new Error('reCAPTCHA container not ready');
    const verifier = new RecaptchaVerifier(firebaseAuth, recaptchaRef.current, {
      size: 'invisible',
      callback: () => {},
    });
    recaptchaVerifierRef.current = verifier;
    return verifier;
  };

  const sendOtp = async () => {
    setError(null);
    try {
      const verifier = setupRecaptcha();
      const result = await signInWithPhoneNumber(firebaseAuth, phone, verifier);
      setConfirmation(result);
      setStep('otp');
      setCountdown(60);
    } catch (e: any) {
      const msg =
        e.code === 'auth/invalid-phone-number'
          ? 'Неверный формат номера телефона'
          : e.code === 'auth/too-many-requests'
          ? 'Слишком много попыток. Подождите немного.'
          : 'Не удалось отправить SMS. Попробуйте ещё раз.';
      setError(msg);
      recaptchaVerifierRef.current = null;
    }
  };

  const verifyOtpAndComplete = async () => {
    if (!confirmation || !tokenValue) return;
    setError(null);
    setStep('loading');
    try {
      await confirmation.confirm(otpCode);
      await tryGoogleAuth({
        idToken: tokenValue,
        phone: phone.trim(),
      });
    } catch (e: any) {
      setStep('otp');
      setError(
        e.response?.data?.message ||
          (e.code === 'auth/invalid-verification-code' ? 'Неверный код из SMS' : 'Ошибка подтверждения'),
      );
    }
  };

  if (step === 'phone') {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-stone-900 dark:text-white">Подтверждение номера телефона</p>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Для завершения регистрации подтвердите номер телефона по SMS
          </p>
        </div>
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-500">
            <AlertCircle size={14} /> {error}
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+998 90 123 45 67"
            className="h-10 flex-1 rounded-xl border border-stone-200 bg-white px-4 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-white/10 dark:bg-stone-900 dark:text-white"
          />
          <button
            type="button"
            onClick={sendOtp}
            className="flex h-10 items-center gap-1.5 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white hover:bg-teal-500 transition-colors"
          >
            <ArrowRight size={16} />
          </button>
        </div>
        <div ref={recaptchaRef} />
      </div>
    );
  }

  if (step === 'otp') {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-stone-900 dark:text-white">Введите код из SMS</p>
          <p className="text-xs text-stone-500 dark:text-stone-400">Отправлен на {phone}</p>
        </div>
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-500">
            <AlertCircle size={14} /> {error}
          </div>
        )}
        <input
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="6-значный код"
          maxLength={6}
          className="h-10 w-full rounded-xl border border-stone-200 bg-white px-4 text-center text-lg font-mono font-bold tracking-widest text-stone-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-white/10 dark:bg-stone-900 dark:text-white"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={verifyOtpAndComplete}
            disabled={otpCode.length !== 6}
            className="flex h-10 flex-1 items-center justify-center rounded-xl bg-teal-600 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Подтвердить и войти
          </button>
          <button
            type="button"
            onClick={sendOtp}
            disabled={countdown > 0}
            className="flex h-10 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 text-xs text-stone-600 hover:text-stone-900 disabled:opacity-40 dark:border-white/10 dark:bg-stone-900 dark:text-stone-300 transition-colors"
          >
            <RefreshCw size={13} />
            {countdown > 0 ? `${countdown}с` : 'Ещё раз'}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="flex h-10 items-center justify-center gap-2 rounded-xl bg-teal-50 text-sm font-semibold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
        <CheckCircle2 size={16} /> Готово! Входим в аккаунт...
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-500">
          <AlertCircle size={14} /> {error}
        </div>
      )}
      <button
        type="button"
        disabled={step === 'loading'}
        onClick={() => {
          setError(null);
          setStep('loading');
          loginWithGoogle();
        }}
        className="flex h-10 w-full items-center justify-center gap-2.5 rounded-xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-700 shadow-xs transition-colors hover:bg-stone-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
      >
        {step === 'loading' ? (
          <svg className="h-4 w-4 animate-spin text-teal-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <GoogleIcon />
        )}
        <span>
          {step === 'loading'
            ? 'Авторизация...'
            : mode === 'register'
            ? 'Зарегистрироваться через Google'
            : 'Войти через Google'}
        </span>
      </button>
      <div ref={recaptchaRef} />
    </div>
  );
}
