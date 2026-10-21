"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Loader2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Lang, detectLang, tr } from '@/utils/lang';
import LangSwitcher from '@/components/LangSwitcher';
import LegalLinks from '@/components/LegalLinks';
import { safeNext } from '@/utils/redirect';

// 비밀번호 찾기 — 이메일로 재설정 링크를 보낸다. 계정이 있는지 여부를 화면에 드러내지 않는다(항상 같은 안내).
export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [lang, setLang] = useState<Lang>('ko');
  const [backHref, setBackHref] = useState('/signup');
  const t = (ko: string, en: string, zh: string, ja: string) => tr(lang, ko, en, zh, ja);

  useEffect(() => {
    setLang(detectLang(window.location.search));
    const nextUrl = safeNext(new URLSearchParams(window.location.search).get('next'));
    if (nextUrl) setBackHref(`/signup?next=${encodeURIComponent(nextUrl)}`);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const send = async () => {
    setIsLoading(true);
    setError('');
    const nextUrl = safeNext(new URLSearchParams(window.location.search).get('next'));
    // 링크를 누르면 콜백이 세션을 만든 뒤 /reset-password로 보낸다. 재설정이 끝나면 원래 서비스(next)로 돌려보낸다.
    const after = `/reset-password${nextUrl ? `?next=${encodeURIComponent(nextUrl)}` : ''}`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(after)}`,
    });
    setIsLoading(false);
    if (error && /rate limit|too many|seconds/i.test(error.message)) {
      setError(t('잠시 후 다시 시도해 주세요.', 'Please try again in a moment.', '请稍后再试。', 'しばらくしてからもう一度お試しください。'));
      return;
    }
    // 그 밖의 오류(없는 이메일 등)도 같은 안내를 보여 계정 존재 여부를 알려 주지 않는다
    setSent(true);
    setCooldown(60);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await send();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0c0c0c] relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-brand-gold/5 blur-[120px] rounded-full"></div>
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-[440px] z-10">
        <div className="flex items-center justify-between mb-8">
          <Link href={backHref} className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-bold">
            <ChevronLeft size={18} /> {t('돌아가기', 'Back', '返回', '戻る')}
          </Link>
          <LangSwitcher lang={lang} onChange={setLang} />
        </div>

        <div className="mb-10">
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">
            {t('비밀번호 찾기', 'Reset your password', '找回密码', 'パスワードをお忘れの方')}
          </h2>
          <p className="text-zinc-500 text-sm font-medium">
            {t(
              '가입한 이메일을 입력하면 비밀번호를 다시 정하는 링크를 보내드려요.',
              "Enter your email and we'll send you a link to set a new password.",
              '输入注册邮箱,我们会发送重设密码的链接。',
              '登録したメールアドレスを入力すると、パスワードを再設定するリンクをお送りします。',
            )}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 p-10 rounded-[40px] backdrop-blur-xl shadow-2xl">
          {sent ? (
            <div className="text-center">
              <Mail className="w-10 h-10 text-brand-gold mx-auto mb-5" />
              <p className="text-sm text-zinc-300 leading-relaxed">
                {t(
                  '입력한 이메일로 가입된 계정이 있으면 재설정 링크를 보냈어요. 메일이 안 보이면 스팸함도 확인해 주세요.',
                  'If an account exists for that email, we sent a reset link. If you do not see it, check your spam folder.',
                  '如果该邮箱已注册,我们已发送重设链接。若未看到邮件,请检查垃圾邮件箱。',
                  'そのメールアドレスのアカウントがある場合、再設定リンクを送信しました。見当たらない場合は迷惑メールもご確認ください。',
                )}
              </p>
              {error && <p className="mt-4 text-xs font-bold text-rose-500">{error}</p>}
              <button
                type="button"
                onClick={send}
                disabled={cooldown > 0 || isLoading}
                className="mt-6 w-full py-3 border border-white/10 rounded-2xl text-sm font-bold text-white hover:bg-white/5 transition-all disabled:opacity-40"
              >
                {cooldown > 0
                  ? t(`메일 다시 보내기 (${cooldown}초)`, `Resend email (${cooldown}s)`, `重新发送 (${cooldown}秒)`, `メールを再送 (${cooldown}秒)`)
                  : t('메일 다시 보내기', 'Resend email', '重新发送邮件', 'メールを再送')}
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold rounded-2xl text-center">{error}</div>
              )}
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
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black rounded-2xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-brand-gold transition-all shadow-xl disabled:opacity-50 mt-4"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>{t('재설정 링크 보내기', 'Send reset link', '发送重设链接', '再設定リンクを送る')} <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-[11px] text-zinc-600">
          {t('구글·카카오·네이버로 가입했다면 비밀번호가 없어요. 해당 버튼으로 로그인해 주세요.', 'Signed up with Google, Kakao or Naver? You have no password — use that button to sign in.', '通过Google、Kakao、Naver注册的账户没有密码,请使用对应按钮登录。', 'Google・カカオ・Naverで登録した場合はパスワードがありません。該当のボタンでログインしてください。')}
        </p>
        <LegalLinks className="mt-4" />
      </motion.div>
    </div>
  );
}
