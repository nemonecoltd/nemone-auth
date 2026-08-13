"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lang, detectLang, tr } from '@/utils/lang';
import LangSwitcher from '@/components/LangSwitcher';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [lang, setLang] = useState<Lang>('ko');
  const t = (ko: string, en: string, zh: string, ja: string) => tr(lang, ko, en, zh, ja);

  useEffect(() => {
    setLang(detectLang(window.location.search));
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const nextUrl = new URLSearchParams(window.location.search).get('next');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback${nextUrl ? `?next=${encodeURIComponent(nextUrl)}` : ''}`,
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      alert(t(
        '회원가입 신청 완료! 이메일을 확인하여 인증을 완료해주세요.',
        'Sign-up complete! Please check your email to verify your account.',
        '注册申请完成!请查收邮箱完成验证。',
        '会員登録の申請が完了しました!メールをご確認の上、認証を完了してください。',
      ));
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0c0c0c] relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-brand-gold/5 blur-[120px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-[440px] z-10"
      >
        <div className="flex items-center justify-between mb-8">
          <Link href="/login" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-bold">
            <ChevronLeft size={18} /> {t('로그인으로 돌아가기', 'Back to login', '返回登录', 'ログインに戻る')}
          </Link>
          <LangSwitcher lang={lang} onChange={setLang} />
        </div>

        <div className="mb-10">
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">
            {t('계정 만들기', 'Create Account', '创建账户', 'アカウント作成')}
          </h2>
          <p className="text-zinc-500 text-sm font-medium">
            {t(
              '네모네 생태계의 새로운 멤버가 되어주세요.',
              'Become a new member of the NEMONE ecosystem.',
              '成为NEMONE生态系统的新成员。',
              'NEMONEエコシステムの新しいメンバーになりましょう。',
            )}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 p-10 rounded-[40px] backdrop-blur-xl shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold rounded-2xl text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium text-white focus:outline-none focus:border-brand-gold transition-all"
                  placeholder={t('홍길동', 'Jane Doe', '张三', '山田太郎')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium text-white focus:outline-none focus:border-brand-gold transition-all"
                  placeholder="hello@nemone.inc"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium text-white focus:outline-none focus:border-brand-gold transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black rounded-2xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-brand-gold transition-all shadow-xl disabled:opacity-50 mt-8"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>{t('가입하기', 'Sign Up', '注册', '登録する')} <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
