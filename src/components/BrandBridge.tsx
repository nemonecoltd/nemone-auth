// 이 계정 하나로 쓸 수 있는 서비스들 — 로그인/가입 화면 하단에 공통으로 노출.
// 서비스가 늘어날 때마다 화면마다 따로 고치지 않도록 한 곳에 모아둔다.
// MSM은 아직 통합 인증 대상이 아니라 제외(2026-08-28).
const SERVICES = [
  { name: 'NEMONE AIM', dot: 'bg-brand-gold', glow: '#D4AF37' },
  { name: 'NEMONE PACE', dot: 'bg-brand-emerald', glow: '#10b981' },
  { name: 'NEMONE PLANTS', dot: 'bg-brand-leaf', glow: '#6FBF57' },
];

export default function BrandBridge({ className = '' }: { className?: string }) {
  return (
    <div className={`flex justify-center gap-6 ${className}`}>
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
