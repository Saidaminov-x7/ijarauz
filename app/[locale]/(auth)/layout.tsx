'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { use } from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default function AuthLayout({ children, params }: AuthLayoutProps) {
  return (
    <AuthLayoutInner params={params}>
      {children}
    </AuthLayoutInner>
  );
}

function AuthLayoutInner({ children, params }: AuthLayoutProps) {
  const router = useRouter();
  const { locale } = use(params);

  return (
    <div className="relative flex min-h-[calc(100vh-80px)] flex-col items-center justify-center overflow-hidden py-4 sm:py-6">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-stone-900 to-teal-950 dark:from-stone-950 dark:via-[#111] dark:to-teal-950" />
      
      {/* Decorative blobs */}
      <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-teal-500/10 blur-[120px]" />
      <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-teal-600/10 blur-[120px]" />
      <div className="absolute top-1/3 left-1/4 h-[300px] w-[300px] rounded-full bg-emerald-500/5 blur-[80px]" />

      {/* Card container */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl">
          {/* Inner top gradient stripe */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-400/50 to-transparent" />

          {/* Card inner container */}
          <div className="p-6 sm:p-8">
            {children}
          </div>

          {/* Inner bottom gradient stripe */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>

      {/* Bottom branding */}
      <p className="relative z-10 mt-4 text-xs text-stone-500">
        © 2025 ijara.uz — аренда жилья в Узбекистане
      </p>
    </div>
  );
}