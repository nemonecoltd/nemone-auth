// 이 계정 하나로 쓸 수 있는 서비스 — 로그인/가입 화면 하단, 약관·방침 본문, 계정 삭제 안내가 모두 이 목록을 쓴다.
// 서비스가 늘거나 이름이 바뀔 때 한 곳만 고친다(예전엔 화면마다 이름이 달랐다: 삭제 안내는 matmatch, 하단은 AIM).
export const SERVICES = [
  { key: 'aim', name: 'NEMONE AIM', url: 'https://nemoneai.com', dot: 'bg-brand-gold', glow: '#D4AF37' },
  { key: 'pace', name: 'NEMONE PACE', url: 'https://now.nemoneai.com', dot: 'bg-brand-emerald', glow: '#10b981' },
  { key: 'plants', name: 'NEMONE PLANTS', url: 'https://plants.nemoneai.com', dot: 'bg-brand-leaf', glow: '#6FBF57' },
  { key: 'lii', name: 'NEMONE LII', url: 'https://msm.nemoneai.com', dot: 'bg-brand-lii', glow: '#5B8DEF' },
  { key: 'santa', name: '산타의 칭찬 카드', url: 'https://santa.nemoneai.com', dot: 'bg-brand-santa', glow: '#E5484D' },
] as const;

export const SERVICE_NAMES = SERVICES.map((s) => s.name).join(', ');

export const COMPANY = {
  name: '네모네 주식회사',
  ceo: '정환석',
  regNo: '116-86-03188',
  address: '제주특별자치도 제주시 한경면 낙조길 196-18',
  email: 'contact@nemoneai.com',
  tel: '02-6417-7328',
};

// 약관·방침을 바꾸면 이 값도 같이 올린다 — 가입 시 동의한 버전이 계정 정보(user_metadata)에 기록된다.
export const TERMS_VERSION = '2026-10-21';

/** '2026-10-21' → '2026년 10월 21일' */
export function formatKoDate(v: string): string {
  const [y, m, d] = v.split('-').map(Number);
  return `${y}년 ${m}월 ${d}일`;
}
