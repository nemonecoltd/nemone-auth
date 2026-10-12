// 이 계정 하나로 쓸 수 있는 서비스들 — 로그인/가입 화면 하단에 공통으로 노출.
// 서비스가 늘어날 때마다 화면마다 따로 고치지 않도록 한 곳에 모아둔다.
// MSM은 2026-08-28에는 통합 인증 대상이 아니라 제외했으나, LII로 리브랜딩되며 통합 인증을 쓰므로 포함(2026-10-12).
// 산타칭찬카드(santa.nemoneai.com)도 같은 계정으로 로그인하므로 포함(2026-10-12).
const SERVICES = [
  { name: 'NEMONE AIM', dot: 'bg-brand-gold', glow: '#D4AF37' },
  { name: 'NEMONE PACE', dot: 'bg-brand-emerald', glow: '#10b981' },
  { name: 'NEMONE PLANTS', dot: 'bg-brand-leaf', glow: '#6FBF57' },
  { name: 'NEMONE LII', dot: 'bg-brand-lii', glow: '#5B8DEF' },
  { name: '산타칭찬카드', dot: 'bg-brand-santa', glow: '#E5484D' },
];

export default function BrandBridge({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap justify-center gap-x-6 gap-y-4 ${className}`}>
      {SERVICES.map((s) => (
        <div key={s.name} className="text-center">
          <div
            className={`w-1.5 h-1.5 rounded-full ${s.dot} mx-auto mb-2`}
            style={{ boxShadow: `0 0 8px ${s.glow}` }}
          />
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 whitespace-nowrap">
            {s.name}
          </span>
        </div>
      ))}
    </div>
  );
}
