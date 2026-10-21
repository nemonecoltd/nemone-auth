import { SERVICES } from '@/utils/services';

// 이 계정 하나로 쓸 수 있는 서비스들 — 로그인/가입 화면 하단에 공통으로 노출. 목록은 utils/services.ts 한 곳에서 관리한다.
export default function BrandBridge({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap justify-center gap-x-6 gap-y-4 ${className}`}>
      {SERVICES.map((s) => (
        <div key={s.key} className="text-center">
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
