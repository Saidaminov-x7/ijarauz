'use client';

import { useState, useRef, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
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

export function GoogleAuthButton({ locale, mode = 'login' }: GoogleAuthButtonProps) {
  const setAuth = useAuthStore((s) => s.setAuth);

  const [step, setStep] = useState<'idle' | 'phone' | 'otp' | 'loading' | 'done'>('idle');
  const [idToken, setIdToken] = useState<string | null>(null);
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
      setTimeout(() => {
        window.location.href = `/${locale}/profile`;
      }, 400);
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

  const handleCredential = async (credential: string) => {
    setError(null);
    setIdToken(credential);
    setStep('loading');
    try {
      await tryGoogleAuth({ idToken: credential });
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
    if (!confirmation || !idToken) return;
    setError(null);
    setStep('loading');
    try {
      await confirmation.confirm(otpCode);
      await tryGoogleAuth({
        idToken,
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
          <p className="text-sm font-semibold text-white">Подтверждение номера телефона</p>
          <p className="text-xs text-stone-400">
            Для завершения регистрации подтвердите номер телефона по SMS
          </p>
        </div>
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-400">
            <AlertCircle size={14} /> {error}
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+998 90 123 45 67"
            className="h-11 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder-stone-500 outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20"
          />
          <button
            type="button"
            onClick={sendOtp}
            className="flex h-11 items-center gap-1.5 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white hover:bg-teal-500 transition-colors"
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
          <p className="text-sm font-semibold text-white">Введите код из SMS</p>
          <p className="text-xs text-stone-400">Отправлен на {phone}</p>
        </div>
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-400">
            <AlertCircle size={14} /> {error}
          </div>
        )}
        <input
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="6-значный код"
          maxLength={6}
          className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-center text-lg font-mono font-bold tracking-widest text-white outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={verifyOtpAndComplete}
            disabled={otpCode.length !== 6}
            className="flex h-11 flex-1 items-center justify-center rounded-xl bg-teal-600 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Подтвердить и войти
          </button>
          <button
            type="button"
            onClick={sendOtp}
            disabled={countdown > 0}
            className="flex h-11 items-center gap-1.5 rounded-xl border border-white/10 px-3 text-xs text-stone-400 hover:text-white disabled:opacity-40 transition-colors"
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
      <div className="flex h-11 items-center justify-center gap-2 rounded-xl bg-teal-600/20 text-sm font-semibold text-teal-400">
        <CheckCircle2 size={16} /> Готово! Входим в аккаунт...
      </div>
    );
  }

  if (step === 'loading') {
    return (
      <div className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm text-stone-300">
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        Авторизация через Google...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-400">
          <AlertCircle size={14} /> {error}
        </div>
      )}
      <div className="flex w-full justify-center overflow-hidden rounded-xl [&>div]:w-full">
        <GoogleLogin
          onSuccess={(cred) => {
            if (cred.credential) void handleCredential(cred.credential);
          }}
          onError={() => {
            setStep('idle');
            setError('Вход через Google отменён или заблокирован браузером');
          }}
          text={mode === 'register' ? 'signup_with' : 'signin_with'}
          width="100%"
          theme="filled_black"
          shape="rectangular"
        />
      </div>
      <div ref={recaptchaRef} />
    </div>
  );
}

