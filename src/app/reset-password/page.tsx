"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Loader2, Check } from 'lucide-react';
import Link from 'next/link';
import { Lang, detectLang, tr } from '@/utils/lang';
import LangSwitcher from '@/components/LangSwitcher';
import LegalLinks from '@/components/LegalLinks';
import { safeNext } from '@/utils/redirect';

const MIN_LEN = 8;

// 비밀번호 재설정 — 메일의 링크를 누르면 콜백이 임시 로그인 세션을 만들고 이 화면으로 온다. 세션이 없으면(만료·잘못된 링크) 다시 요청하도록 안내한다.
export default function ResetPasswordPage() {
  const supabase = createClient();
  const [ready, setReady] = useState<'loading' | 'ok' | 'none'>('loading');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [lang, setLang] = useState<Lang>('ko');
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const t = (ko: string, en: string, zh: string, ja: string) => tr(lang, ko, en, zh, ja);

  useEffect(() => {
    setLang(detectLang(window.location.search));
    setNextUrl(safeNext(new URLSearchParams(window.location.search).get('next')));
    supabase.auth.getUser().then(({ data: { user } }) => setReady(user ? 'ok' : 'none'));
  }, [supabase]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < MIN_LEN) {
      setError(t(`비밀번호는 ${MIN_LEN}자 이상이어야 해요.`, `Password must be at least ${MIN_LEN} characters.`, `密码至少需要${MIN_LEN}个字符。`, `パスワードは${MIN_LEN}文字以上にしてください。`));
      return;
    }
    if (password !== confirm) {
      setError(t('비밀번호가 서로 달라요.', 'Passwords do not match.', '两次输入的密码不一致。', 'パスワードが一致しません。'));
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(/same|different/i.test(error.message)
        ? t('이전과 다른 비밀번호를 입력해 주세요.', 'Please choose a different password.', '请输入与之前不同的密码。', '以前とは異なるパスワードを入力してください。')
        : error.message);
      setIsLoading(false);
      return;
    }
    setDone(true);
    setIsLoading(false);
  };

  const goOn = () => {
    if (nextUrl && /^https?:\/\//.test(nextUrl)) window.location.href = nextUrl;
    else window.location.href = '/profile';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0c0c0c] relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-brand-gold/5 blur-[120px] rounded-full"></div>
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-[440px] z-10">
        <div className="flex justify-end mb-8">
          <LangSwitcher lang={lang} onChange={setLang} />
        </div>

        <div className="mb-10">
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">
            {t('새 비밀번호 정하기', 'Set a new password', '设置新密码', '新しいパスワードを設定')}
          </h2>
        </div>

        <div className="bg-white/5 border border-white/10 p-10 rounded-[40px] backdrop-blur-xl shadow-2xl">
          {ready === 'loading' && <div className="flex justify-center py-6"><Loader2 className="animate-spin text-brand-gold" /></div>}

          {ready === 'none' && (
            <div className="text-center">
              <p className="text-sm text-zinc-300 leading-relaxed">
                {t(
                  '재설정 링크가 만료되었거나 올바르지 않아요. 비밀번호 찾기를 다시 요청해 주세요.',
                  'This reset link has expired or is invalid. Please request a new one.',
                  '重设链接已过期或无效。请重新申请。',
                  '再設定リンクの有効期限が切れているか、正しくありません。もう一度お申し込みください。',
                )}
              </p>
              <Link href="/forgot-password" className="mt-6 inline-block w-full bg-white text-black rounded-2xl py-3 font-bold text-sm hover:bg-brand-gold transition-all">
                {t('비밀번호 찾기', 'Reset your password', '找回密码', 'パスワードをお忘れの方')}
              </Link>
            </div>
          )}

          {ready === 'ok' && done && (
            <div className="text-center">
              <Check className="w-10 h-10 text-brand-emerald mx-auto mb-5" />
              <p className="text-sm text-zinc-300 leading-relaxed mb-6">
                {t('비밀번호를 바꿨어요. 이제 새 비밀번호로 로그인할 수 있어요.', 'Your password has been changed. You can now sign in with it.', '密码已更改。现在可以使用新密码登录。', 'パスワードを変更しました。新しいパスワードでログインできます。')}
              </p>
              <button onClick={goOn} className="w-full bg-white text-black rounded-2xl py-3 font-bold text-sm hover:bg-brand-gold transition-all">
                {nextUrl ? t('원래 서비스로 돌아가기', 'Back to your service', '返回原服务', '元のサービスに戻る') : t('계정으로 이동', 'Go to my account', '前往我的账户', 'アカウントへ')}
              </button>
            </div>
          )}

          {ready === 'ok' && !done && (
            <form onSubmit={onSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold rounded-2xl text-center">{error}</div>
              )}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="password"
                    required
                    minLength={MIN_LEN}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium text-white focus:outline-none focus:border-brand-gold transition-all"
                    placeholder={t(`${MIN_LEN}자 이상`, `${MIN_LEN}+ characters`, `至少${MIN_LEN}个字符`, `${MIN_LEN}文字以上`)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="password"
                    required
                    minLength={MIN_LEN}
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium text-white focus:outline-none focus:border-brand-gold transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black rounded-2xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-brand-gold transition-all shadow-xl disabled:opacity-50 mt-4"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>{t('비밀번호 변경', 'Change password', '更改密码', 'パスワードを変更')} <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </form>
          )}
        </div>
        <LegalLinks className="mt-6" />
      </motion.div>
    </div>
  );
}
