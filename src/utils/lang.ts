export type Lang = 'ko' | 'en' | 'zh' | 'ja';

const LANGS: Lang[] = ['ko', 'en', 'zh', 'ja'];
const STORAGE_KEY = 'nemone_auth_lang';

function isLang(v: string | null): v is Lang {
  return !!v && (LANGS as string[]).includes(v);
}

// OAuth 리다이렉트(로그인→구글/카카오/네이버→콜백→온보딩)를 거치는 동안 lang을 URL로 계속
// 끌고 다니기 번거로워 localStorage에 고정 — 페이지가 새로 뜰 때마다 이걸 우선 읽는다.
// 최초 진입 시엔 localStorage가 비어있으니 현재 URL의 ?lang= 이나, next(원래 서비스 URL)에
// 실려온 ?lang=을 한 번 더 살펴본다.
export function detectLang(search: string): Lang {
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLang(stored)) return stored;
  }

  const params = new URLSearchParams(search);
  const direct = params.get('lang');
  if (isLang(direct)) return direct;

  const nextUrl = params.get('next');
  if (nextUrl) {
    try {
      const nested = new URL(nextUrl, 'https://dummy.nemoneai.com').searchParams.get('lang');
      if (isLang(nested)) return nested;
    } catch {
      // next가 파싱 불가한 값이면 무시하고 기본값으로
    }
  }

  return 'ko';
}

export function saveLang(lang: Lang): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // 시크릿 모드 등 localStorage 차단 시 조용히 무시 — 이번 세션 동안만 상태로 유지됨
  }
}

export function tr(lang: Lang, ko: string, en: string, zh: string, ja: string): string {
  return lang === 'en' ? en : lang === 'zh' ? zh : lang === 'ja' ? ja : ko;
}
