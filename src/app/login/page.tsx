"use client";

import { createClient } from '@/utils/supabase/client';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    // URL에서 next 파라미터 추출
    const urlParams = new URLSearchParams(window.location.search);
    const nextUrl = urlParams.get('next');
    
    // 콜백 URL 구성 (next 파라미터가 있으면 전달)
    let redirectUrl = `${window.location.origin}/auth/callback`;
    if (nextUrl) {
      redirectUrl += `?next=${encodeURIComponent(nextUrl)}`;
    }

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0c0c0c] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-brand-gold/10 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-brand-emerald/10 blur-[120px] rounded-full animate-pulse"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] z-10"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-[900] italic tracking-[-0.05em] font-display text-brand-gold mb-4">
            NEMONE
          </h1>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">통합 인증 센터</h2>
          <p className="text-zinc-500 text-sm font-medium">단 하나의 계정으로 연결되는 네모네 생태계</p>
        </div>

        <div className="bg-white/5 border border-white/10 p-10 rounded-[40px] backdrop-blur-xl shadow-2xl">
          <div className="space-y-4">
            {/* Google Login Button */}
            <button 
              onClick={handleGoogleLogin}
              className="w-full py-4 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-brand-gold transition-all duration-500 transform hover:-translate-y-1 shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google 계정으로 계속하기
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] font-black">
                <span className="bg-[#121212] px-4 text-zinc-600">OR</span>
              </div>
            </div>

            {/* Email Login Link */}
            <Link 
              href="/signup"
              className="w-full py-4 bg-transparent border border-white/10 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/5 transition-all"
            >
              <Mail size={18} className="text-zinc-500" />
              이메일 주소로 시작하기
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-white/5 flex items-center gap-3 text-zinc-600">
            <ShieldCheck size={24} className="text-brand-emerald opacity-50" />
            <p className="text-[10px] leading-relaxed font-medium">
              보안 인증됨. 네모네는 통합 계정 시스템을 통해 유저님의 데이터를 안전하게 암호화하여 관리합니다.
            </p>
          </div>
        </div>

        {/* Brand Bridge Slogans */}
        <div className="mt-12 flex justify-center gap-6">
          <div className="text-center">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mx-auto mb-2 shadow-[0_0_8px_#D4AF37]"></div>
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">NEMONE AIM</span>
          </div>
          <div className="text-center">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-emerald mx-auto mb-2 shadow-[0_0_8px_#10b981]"></div>
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">NOW HERE</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
