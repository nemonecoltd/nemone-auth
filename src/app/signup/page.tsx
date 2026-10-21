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
import LegalLinks from '@/components/LegalLinks';
import { safeNext } from '@/utils/redirect';
import { TERMS_VERSION } from '@/utils/services';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [agree, setAgree] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);   // 인증 메일을 보낸 주소(이메일 인증이 켜진 경우)
  const [needsConfirm, setNeedsConfirm] = useState(false);       // 이미 가입했지만 인증이 안 끝난 계정
  const [cooldown, setCooldown] = useState(0);
  const [resent, setResent] = useState(false);
  const [lang, setLang] = useState<Lang>('ko');
  const [loginHref, setLoginHref] = useState('/login');
  const t = (ko: string, en: string, zh: string, ja: string) => tr(lang, ko, en, zh, ja);

  useEffect(() => {
    setLang(detectLang(window.location.search));
    const nextUrl = safeNext(new URLSearchParams(window.location.search).get('next'));
    if (nextUrl) setLoginHref(`/login?next=${encodeURIComponent(nextUrl)}`);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const goTo = (target: string) => {
    if (/^https?:\/\//.test(target)) window.location.href = target;   // 가입을 시작한 서비스(다른 도메인)로 돌아간다
    else router.push(target);
  };

  const redirectUrl = () => {
    const nextUrl = safeNext(new URLSearchParams(window.location.search).get('next'));
    return `${window.location.origin}/auth/callback${nextUrl ? `?next=${encodeURIComponent(nextUrl)}` : ''}`;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      setError(t('이용약관과 개인정보처리방침에 동의해 주세요.', 'Please agree to the Terms and Privacy Policy.', '请同意服务条款和隐私政策。', '利用規約とプライバシーポリシーに同意してください。'));
      return;
    }
    setIsLoading(true);
    setError('');
    setNeedsConfirm(false);

    const redirectTarget = safeNext(new URLSearchParams(window.location.search).get('next')) || '/profile';
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl(),
        // 동의한 시각과 약관 버전을 계정에 남긴다(약관을 고치면 TERMS_VERSION을 올려 재동의 대상 판별에 쓴다)
        data: { terms_agreed_at: new Date().toISOString(), terms_version: TERMS_VERSION },
      },
    });

    // 이 화면이 로그인 페이지의 "이메일 주소로 시작하기"가 유일하게 연결되는 이메일 경로라서, 하나의 버튼이 가입과 로그인을
    // 둘 다 처리한다(2026-08-31). Supabase는 이미 가입된 이메일로 signUp을 다시 호출하면 ①명시적 에러 또는 ②에러 없이
    // identities가 빈 배열인 가짜 성공으로 응답한다 — 둘 다 "이미 있는 계정"으로 보고 같은 비밀번호로 로그인을 시도한다.
    const looksAlreadyRegistered =
      (!!error && /already registered|already exists/i.test(error.message)) ||
      (!error && !!data.user && (data.user.identities?.length ?? 0) === 0);

    if (looksAlreadyRegistered) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        if (/not confirmed/i.test(signInError.message)) {
          // 가입은 했지만 메일 인증을 아직 안 한 계정
          setNeedsConfirm(true);
          setError(t(
            '이메일 인증이 아직 끝나지 않았어요. 받은 메일의 링크를 눌러 주세요.',
            'Your email is not verified yet. Please click the link in the email we sent.',
            '邮箱尚未验证。请点击已发送邮件中的链接。',
            'メール認証がまだ完了していません。届いたメールのリンクをクリックしてください。',
          ));
        } else {
          setError(t(
            '이미 가입된 이메일이에요. 비밀번호를 다시 확인해주세요.',
            'This email is already registered. Please check your password.',
            '该邮箱已注册,请重新确认密码。',
            'すでに登録済みのメールアドレスです。パスワードをご確認ください。',
          ));
        }
        setIsLoading(false);
      } else {
        goTo(redirectTarget);
      }
      return;
    }

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else if (data.session) {
      // "Confirm email"이 꺼져 있으면 signUp()이 바로 세션을 내려준다 — 그대로 로그인 상태로 넘어간다.
      goTo(redirectTarget);
    } else {
      // "Confirm email"이 켜져 있으면 세션이 오지 않는다 — 인증 메일을 보냈다고 알리고, 메일의 링크를 눌러야 가입이 끝난다.
      setSentTo(email);
      setCooldown(60);
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError('');
    const target = sentTo || email;
    const { error } = await supabase.auth.resend({ type: 'signup', email: target, options: { emailRedirectTo: redirectUrl() } });
    if (error) {
      setError(error.message);
    } else {
      setResent(true);
      setCooldown(60);
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
          <Link href={loginHref} className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-bold">
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

        {sentTo ? (
          <div className="bg-white/5 border border-white/10 p-10 rounded-[40px] backdrop-blur-xl shadow-2xl text-center">
            <Mail className="w-10 h-10 text-brand-gold mx-auto mb-5" />
            <h3 className="text-xl font-bold text-white mb-2">
              {t('인증 메일을 보냈어요', 'Verification email sent', '验证邮件已发送', '認証メールを送信しました')}
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              <span className="text-white font-bold">{sentTo}</span>
              <br />
              {t(
                '메일의 링크를 누르면 가입이 완료되고 원래 서비스로 돌아가요. 메일이 안 보이면 스팸함도 확인해 주세요.',
                'Click the link in the email to finish signing up and return to your service. If you do not see it, check your spam folder.',
                '点击邮件中的链接即可完成注册并返回原服务。若未看到邮件,请检查垃圾邮件箱。',
                'メールのリンクをクリックすると登録が完了し、元のサービスに戻ります。見当たらない場合は迷惑メールもご確認ください。',
              )}
            </p>
            {error && <p className="mt-4 text-xs font-bold text-rose-500">{error}</p>}
            {resent && !error && (
              <p className="mt-4 text-xs font-bold text-brand-emerald">{t('메일을 다시 보냈어요.', 'Email sent again.', '已重新发送邮件。', 'メールを再送しました。')}</p>
            )}
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0}
              className="mt-6 w-full py-3 border border-white/10 rounded-2xl text-sm font-bold text-white hover:bg-white/5 transition-all disabled:opacity-40"
            >
              {cooldown > 0
                ? t(`메일 다시 보내기 (${cooldown}초)`, `Resend email (${cooldown}s)`, `重新发送 (${cooldown}秒)`, `メールを再送 (${cooldown}秒)`)
                : t('메일 다시 보내기', 'Resend email', '重新发送邮件', 'メールを再送')}
            </button>
            <Link href={loginHref} className="mt-4 inline-block text-xs font-bold text-zinc-500 hover:text-white transition-colors">
              {t('로그인으로 돌아가기', 'Back to login', '返回登录', 'ログインに戻る')}
            </Link>
          </div>
        ) : (
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

            <div className="text-right -mt-1">
              <Link
                href={`/forgot-password${loginHref.includes('next=') ? loginHref.slice(loginHref.indexOf('?')) : ''}`}
                className="text-[11px] font-bold text-zinc-500 hover:text-white transition-colors"
              >
                {t('비밀번호를 잊으셨나요?', 'Forgot your password?', '忘记密码?', 'パスワードをお忘れですか?')}
              </Link>
            </div>

            <label className="flex items-start gap-3 pt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#D4AF37] shrink-0"
              />
              <span className="text-[11px] leading-relaxed text-zinc-400">
                {t('[필수] 만 14세 이상이며, ', '[Required] I am 14 or older and agree to the ', '[必填] 我已满14岁,并同意', '[必須] 14歳以上であり、')}
                <Link href="/terms" target="_blank" className="text-brand-gold underline underline-offset-2">{t('이용약관', 'Terms of Service', '服务条款', '利用規約')}</Link>
                {t('과 ', ' and ', '和', 'と')}
                <Link href="/privacy" target="_blank" className="text-brand-gold underline underline-offset-2">{t('개인정보처리방침', 'Privacy Policy', '隐私政策', 'プライバシーポリシー')}</Link>
                {t('에 동의합니다.', '.', '。', 'に同意します。')}
              </span>
            </label>

            {needsConfirm && (
              <button
                type="button"
                onClick={() => { setSentTo(email); handleResend(); }}
                className="w-full py-3 border border-white/10 rounded-2xl text-xs font-bold text-white hover:bg-white/5 transition-all"
              >
                {t('인증 메일 다시 받기', 'Send verification email again', '重新发送验证邮件', '認証メールを再送')}
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || !agree}
              className="w-full bg-white text-black rounded-2xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-brand-gold transition-all shadow-xl disabled:opacity-50 mt-8"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>{t('계속하기', 'Continue', '继续', '続ける')} <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>
        </div>
        )}

        <LegalLinks className="mt-6" />

        {/* 이 계정 하나로 어떤 서비스를 쓰게 되는지 가입 시점에 보여줌 */}
        <BrandBridge className="mt-12" />
      </motion.div>
    </div>
  );
}
