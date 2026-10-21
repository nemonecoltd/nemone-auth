// 로그인/가입 후 되돌아갈 주소(next)를 검증한다. 검증 없이 외부 주소로 보내면, 로그인 링크에 남의 사이트를 심어
// 로그인 직후 피싱 페이지로 보내는 "오픈 리다이렉트"가 된다(2026-10-21 점검에서 발견).
// 허용: 같은 사이트 안의 경로(/profile) 또는 nemoneai.com·*.nemoneai.com의 https 주소, 개발 중 localhost.
export function safeNext(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const v = raw.trim();
  if (v.startsWith('/') && !v.startsWith('//') && !v.startsWith('/\\')) return v;
  try {
    const u = new URL(v);
    if (u.username || u.password) return null;   // user@host 형태로 속이는 주소는 허용하지 않는다
    const host = u.hostname.toLowerCase();
    const isNemone = host === 'nemoneai.com' || host.endsWith('.nemoneai.com');
    if (u.protocol === 'https:' && isNemone) return u.toString();
    if (process.env.NODE_ENV !== 'production' && (host === 'localhost' || host === '127.0.0.1') && u.protocol === 'http:') return u.toString();
  } catch {
    // 파싱 불가한 값은 허용하지 않는다
  }
  return null;
}

/** 외부 서비스로 보내는 절대 주소만(경로는 제외) — 온보딩·프로필의 "서비스로 돌아가기"용 */
export function safeExternalNext(raw: string | null | undefined): string | null {
  const v = safeNext(raw);
  return v && /^https?:\/\//.test(v) ? v : null;
}
