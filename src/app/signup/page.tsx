"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lang, detectLang, tr } from '@/utils/lang';
import LangSwitcher from '@/components/LangSwitcher';
import BrandBridge from '@/components/BrandBridge';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    const redirectTarget = nextUrl || '/profile';
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback${nextUrl ? `?next=${encodeURIComponent(nextUrl)}` : ''}`,
      },
    });

    // 이 화면이 로그인 페이지의 "이메일 주소로 시작하기"가 유일하게 연결되는 이메일
    // 경로인데, 정작 signInWithPassword를 쓰는 곳이 코드 전체에 없어 기존 이메일
    // 가입자가 다시 로그인할 방법이 없었다(2026-08-31 발견). Supabase는 이미 가입된
    // 이메일로 signUp을 다시 호출하면 이메일 중복 노출 방지 정책에 따라 두 가지로
    // 응답한다 — ①명시적 에러("User already registered" 계열) 또는 ②에러 없이
    // identities가 빈 배열인 가짜 성공 응답. 두 경우 모두 "이미 있는 계정"으로 보고
    // 같은 비밀번호로 로그인을 시도해 하나의 버튼이 가입/로그인을 다 처리하게 한다.
    const looksAlreadyRegistered =
      (!!error && /already registered|already exists/i.test(error.message)) ||
      (!error && !!data.user && (data.user.identities?.length ?? 0) === 0);

    if (looksAlreadyRegistered) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(t(
          '이미 가입된 이메일이에요. 비밀번호를 다시 확인해주세요.',
          'This email is already registered. Please check your password.',
          '该邮箱已注册,请重新确认密码。',
          'すでに登録済みのメールアドレスです。パスワードをご確認ください。',
        ));
        setIsLoading(false);
      } else {
        router.push(redirectTarget);
      }
      return;
    }

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else if (data.session) {
      // 이 프로젝트는 "Confirm email"이 꺼져 있어(가입 즉시 email_confirmed_at이 찍힘) —
      // signUp()이 바로 세션을 내려주므로 별도 이메일 인증 없이 그대로 로그인 상태로
      // 넘어간다. 예전엔 "이메일을 확인해주세요" 안내를 띄우고 로그인 화면으로 돌려보냈는데,
      // 실제로는 인증할 이메일이 안 오니 사용자가 헷갈렸음(2026-08-31).
      router.push(redirectTarget);
    } else {
      // 혹시 나중에 Confirm email이 켜지는 경우를 대비한 폴백 — 이때는 session이 안 옴
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
            {t('이메일로 계속하기', 'Continue with Email', '使用邮箱继续', 'メールアドレスで続ける')}
          </h2>
          <p className="text-zinc-500 text-sm font-medium">
            {t(
              '처음이면 자동으로 가입되고, 이미 계정이 있으면 로그인됩니다.',
              "New here? We'll create your account. Already a member? You'll be signed in.",
              '首次使用将自动注册,已有账户将直接登录。',
              '初めての方は自動的に登録され、既存の方はログインされます。',
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
                <>{t('계속하기', 'Continue', '继续', '続ける')} <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>
        </div>

        {/* 이 계정 하나로 어떤 서비스를 쓰게 되는지 가입 시점에 보여줌 */}
        <BrandBridge className="mt-12" />
      </motion.div>
    </div>
  );
}
