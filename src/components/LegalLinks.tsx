import Link from 'next/link';

// 로그인·가입·온보딩·프로필 하단의 약관·방침 링크(통합 약관 — 5개 서비스 공통).
export default function LegalLinks({ className = '' }: { className?: string }) {
  return (
    <p className={`text-center text-[10px] text-zinc-600 ${className}`}>
      <Link href="/terms" className="hover:text-zinc-300 underline underline-offset-2">이용약관</Link>
      <span className="mx-2 text-zinc-700">·</span>
      <Link href="/privacy" className="hover:text-zinc-300 underline underline-offset-2">개인정보처리방침</Link>
    </p>
  );
}
