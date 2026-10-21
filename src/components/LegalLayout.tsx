import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { COMPANY } from '@/utils/services';

export default function LegalLayout({ title, effective, children }: { title: string; effective: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0c0c0c]">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft size={14} /> 로그인으로
        </Link>
        <p className="mt-8 text-[10px] font-black uppercase tracking-[0.25em] text-brand-gold">NEMONE</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">{title}</h1>
        <p className="mt-2 text-xs text-zinc-500">시행일: {effective} · 한국어 원문이 우선합니다.</p>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-zinc-300 [&_h2]:mt-8 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-white [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_a]:text-brand-gold [&_a]:underline">
          {children}
        </div>
        <div className="mt-14 pt-6 border-t border-white/10 text-[11px] leading-relaxed text-zinc-600">
          <p>상호: {COMPANY.name} · 대표자: {COMPANY.ceo} · 사업자등록번호: {COMPANY.regNo}</p>
          <p>주소: {COMPANY.address}</p>
          <p>문의: {COMPANY.email} · {COMPANY.tel}</p>
          <p className="mt-3">
            <Link href="/terms" className="hover:text-zinc-300 underline underline-offset-2">이용약관</Link>
            <span className="mx-2">·</span>
            <Link href="/privacy" className="hover:text-zinc-300 underline underline-offset-2">개인정보처리방침</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
