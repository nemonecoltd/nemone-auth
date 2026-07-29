# nemone-auth — 인증 서버 프로젝트 문서

## 개요

네모네 생태계 전체에서 사용하는 **통합 SSO 인증 서버**.  
Supabase Auth를 기반으로 Google OAuth 및 이메일 회원가입을 지원하며,  
`.nemoneai.com` 도메인 전체에서 세션 쿠키를 공유하는 방식으로 동작한다.

- **URL**: `https://auth.nemoneai.com`
- **포트**: 3003 (VM 내 PM2 프로세스명: `auth`)
- **레포**: `https://github.com/nemonecoltd/nemone-auth`
- **프레임워크**: Next.js 14 (App Router) + TypeScript + Tailwind CSS

---

## 인증 플로우

```
유저 → 서비스(nemoneai.com 등)
  → 로그인 필요 시 auth.nemoneai.com/login?next=<원래URL>
  → Google OAuth 또는 이메일 회원가입
  → Supabase 인증 후 /auth/callback 으로 리다이렉트
  → 온보딩 미완료 → /onboarding
  → 온보딩 완료 → next 파라미터 URL 또는 기본 서비스로 이동
```

### 핵심 원리: 공유 쿠키

- Supabase 세션 쿠키를 `domain: '.nemoneai.com'`으로 설정
- `auth.nemoneai.com`에서 로그인하면 `nemoneai.com`, `now.nemoneai.com` 등 모든 서브도메인에서 세션 자동 인식
- 각 서비스는 `@supabase/ssr`로 쿠키를 읽어 서버사이드에서 유저 확인

---

## 파일 구조

```
nemone-auth/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # 전체 레이아웃 (Pretendard, Space Grotesk 폰트)
│   │   ├── globals.css             # 전역 스타일
│   │   ├── login/
│   │   │   └── page.tsx            # 로그인 페이지 (Google OAuth + 이메일)
│   │   ├── signup/
│   │   │   └── page.tsx            # 이메일 회원가입 페이지
│   │   ├── onboarding/
│   │   │   └── page.tsx            # 최초 로그인 후 취향 선택
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts        # OAuth 콜백 처리 (SSO 핵심)
│   └── utils/
│       └── supabase/
│           ├── client.ts           # 브라우저용 Supabase 클라이언트
│           └── server.ts           # 서버용 Supabase 클라이언트 (쿠키 기반)
├── ecosystem.config.cjs            # PM2 실행 설정
├── deploy.sh                       # VM 배포 스크립트
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions CI/CD
├── next.config.mjs                 # Next.js 설정 (표준 빌드)
└── .gitignore                      # .env*, node_modules/, .next/ 제외
```

---

## 주요 페이지

### `/login`
- Google 계정으로 로그인 (OAuth)
- 이메일로 회원가입 링크 (`/signup`으로 이동)
- URL에 `?next=<URL>` 파라미터가 있으면 로그인 후 해당 URL로 리다이렉트
- 디자인: 다크 테마 (`#0c0c0c`), brand-gold / brand-emerald 포인트

### `/signup`
- 이름, 이메일, 비밀번호 입력
- `supabase.auth.signUp()` 호출 후 이메일 인증 안내
- 이메일 인증 링크 클릭 → `/auth/callback?next=/onboarding` 경유

### `/onboarding`
- 최초 로그인 유저 대상 취향 선택 (미식, 아티스트, 공간, 패션, 프로덕트)
- 선택 완료 시 `user_metadata`에 `{ interests, onboarding_completed: true }` 저장
- 완료 후 `https://nemoneai.com` 으로 이동

### `/auth/callback` (Route Handler)
- Google OAuth 후 Supabase가 이 URL로 code를 전달
- `exchangeCodeForSession(code)` 로 세션 생성
- `onboarding_completed` 여부에 따라:
  - 미완료 → `/onboarding`
  - 완료 + `next`가 외부 URL → 해당 URL로 이동 (SSO)
  - 완료 + `next`가 상대 경로 → auth 서버 내 경로로 이동

---

## Supabase 설정

### 클라이언트 (`src/utils/supabase/client.ts`)
```typescript
createBrowserClient(URL, ANON_KEY, {
  cookieOptions: {
    domain: '.nemoneai.com',   // 서브도메인 전체 공유
    secure: true,
    sameSite: 'lax',
  }
})
```

### 서버 (`src/utils/supabase/server.ts`)
```typescript
createServerClient(URL, ANON_KEY, {
  cookies: {
    get/set/remove  // Next.js cookies() API 사용
    // set/remove 시 domain: '.nemoneai.com' 강제 지정
  }
})
```

### 환경변수 (`.env.local`, 절대 커밋 금지)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=https://auth.nemoneai.com
```

---

## CI/CD 파이프라인

### 흐름
```
로컬 git push → GitHub (main 브랜치)
  → GitHub Actions 트리거
  → VM SSH 접속
  → git pull (reset --hard)
  → npm ci + npm run build (VM에서 빌드)
  → pm2 restart auth --update-env
  → pm2 save
```

### `.github/workflows/deploy.yml`
- 트리거: `main` 브랜치 push
- `concurrency: auth-deploy` — 동시 배포 방지
- `appleboy/ssh-action@v1.0.3` 사용
- VM 접속 후 `deploy.sh` 실행
- `export HOME=/home/nemonecoltd` 필수 (npm global 경로)

### `deploy.sh`
```bash
npm ci --production=false   # devDependencies 포함 (빌드에 필요)
npm run build
pm2 restart auth --update-env
pm2 save
```

### GitHub Secrets (레포 Settings → Secrets)
| Secret | 내용 |
|--------|------|
| `VM_HOST` | VM 외부 IP |
| `VM_USER` | VM 접속 계정명 (`nemonecoltd`) |
| `VM_SSH_KEY` | SSH 개인키 전체 내용 (passphrase 없는 키) |

---

## PM2 설정 (`ecosystem.config.cjs`)

```javascript
module.exports = {
  apps: [{
    name: 'auth',
    script: 'node_modules/.bin/next',
    args: 'start -p 3003',      // 포트 3003 고정
    cwd: '/var/www/auth',
    env: {
      NODE_ENV: 'production',
      HOSTNAME: '0.0.0.0'
    }
  }]
};
```

> `npm start` 대신 `next` 바이너리를 직접 실행해야 포트 인수가 정상 적용됨

---

## VM 서버 현황

| PM2 프로세스 | 포트 | 경로 |
|-------------|------|------|
| admin | - | /var/www/admin |
| backend | - | /var/www/backend |
| frontend | - | /var/www/frontend |
| now_backend | - | /var/www/now_back |
| now_frontend | - | /var/www/now_front |
| **auth** | **3003** | **/var/www/auth** |

**주의**: 배포 스크립트는 `pm2 restart auth`만 실행. 다른 프로세스에 절대 영향 없음.

---

## 2026-05-29 작업 내역

### 배경
기존에 로컬에서 빌드 후 standalone 바이너리를 서버로 전송하는 방식을 시도했다가 실패.  
그 흔적이 코드에 남아 있어서 이를 정리하고, VM에서 직접 빌드하는 방식으로 CI/CD를 재구성.

### 작업 목록

#### 1. standalone 방식 제거
- `next.config.mjs`에서 `output: 'standalone'` 제거 → 표준 Next.js 빌드로 전환
- VM에서 `npm run build` 후 `pm2`로 직접 실행하는 방식 채택

#### 2. PM2 설정 수정 (`ecosystem.config.cjs`)
- 기존 `npm start`는 PORT 환경변수를 무시하고 3000번으로 기동됨
- `script: 'node_modules/.bin/next'`, `args: 'start -p 3003'`으로 포트 고정

#### 3. 배포 스크립트 작성 (`deploy.sh`)
- `npm ci --production=false` (빌드용 devDependencies 포함)
- `npm run build` → `pm2 restart auth --update-env` → `pm2 save`

#### 4. GitHub Actions 워크플로 작성 (`.github/workflows/deploy.yml`)
- main 브랜치 push 시 자동 배포
- SSH로 VM 접속 후 `git reset --hard origin/main && bash deploy.sh` 실행
- `export HOME=/home/nemonecoltd` 설정으로 npm 경로 문제 해결

#### 5. SSH 키 설정 트러블슈팅
- 기존 `auth_ci` 키에 passphrase가 설정되어 있어 GitHub Actions에서 사용 불가
- `ssh-keygen -t ed25519 -f ~/.ssh/auth_ci` 로 passphrase 없는 키 재생성
- 공개키 → VM `~/.ssh/authorized_keys` 등록
- 개인키 전체 내용 → GitHub Secret `VM_SSH_KEY` 등록

#### 6. .gitignore 정비
- `node_modules/`, `.next/`, `.env*`, `*.tar.gz` 제외

#### 7. GitHub 레포 연결 및 첫 push
- `git remote add origin https://github.com/nemonecoltd/nemone-auth.git`
- main 브랜치 push → GitHub Actions 자동 실행 → 배포 성공 확인

### 해결한 문제들

| 문제 | 원인 | 해결 |
|------|------|------|
| 포트 3000 충돌로 auth 프로세스 사망 | `npm start`가 PORT 무시 | next 바이너리 직접 실행 + `-p 3003` 인수 |
| PM2 재시작 후도 3000으로 기동 | PM2가 이전 설정 캐시 | `pm2 delete auth && pm2 start ecosystem.config.cjs` |
| `HOME` 경로 오류 | deploy.yml에 `HOME=/home/ubuntu` 잘못 설정 | `/home/nemonecoltd`로 수정 |
| GitHub Actions SSH 인증 실패 | 기존 키에 passphrase 존재 | passphrase 없는 키로 재생성 |
| `VM_HOST` 미설정 | GitHub Secret 누락 | VM 외부 IP 입력 |

---

## 2026-07-29 작업 내역 — 네이버 로그인(Custom Provider) 추가

> 위 "VM 서버 현황"/CI-CD 섹션은 구 서버(`nemonecoltd@`, `/var/www/*`) 기준으로 이미 stale — 실제로는 msm VM(`ubuntu@34.64.111.65`, `~/apps/auth`, 포트 3003)에서 운영 중. 이번 작업은 msm VM에 직접 배포(scp+ssh, GitHub Actions 미사용)로 진행함.

### 배경
Supabase는 Google/Kakao와 달리 네이버를 기본 제공 프로바이더로 지원하지 않음. Supabase의 **Custom Provider(Manual configuration)** 기능으로 연동 — 식별자는 반드시 `custom:` 접두사 필요(`custom:naver`), 단순 `naver`는 동작 안 함.

### 구현
- `src/app/api/naver-userinfo/route.ts` 신설 — 네이버 `/v1/nid/me`는 `{ response: { id, email, ... } }`로 한 번 감싸 응답하는데, Supabase Custom Provider는 표준 클레임이 최상위에 있길 기대해서 그대로 못 씀. 이 프록시가 Bearer 토큰을 그대로 전달해 네이버 응답을 받은 뒤 `{ sub, email, name, picture }`로 평탄화해서 반환 — Supabase UserInfo URL을 이 프록시로 지정.
- `src/app/login/page.tsx` — "네이버로 계속하기" 버튼 추가, `signInWithOAuth({ provider: 'custom:naver' })` 호출(타입상 `as any` 캐스팅 필요 — SDK의 `Provider` 유니온에 커스텀 프로바이더가 없음).
- `src/app/page.tsx` 신설 — 루트 경로에 페이지가 없어서 OAuth 콜백이 `next` 파라미터 없이 완료되면(예: auth 도메인 직접 방문 테스트) 기본값으로 루트로 리다이렉트되다 404가 뜨던 문제 — `/login`으로 리다이렉트하도록 수정.
- now_front/matmatch `AuthContext.tsx`에도 `signInWithNaver` 추가(일관성 목적 — 실제 버튼은 이 auth 서버에만 있고 각 서비스는 여기로 리다이렉트만 함).

### 트러블슈팅 기록
- **"네이버 인증 후 404"**: 원인 파악 결과 실제 OAuth 자체는 정상 성공(Supabase Auth Logs에서 `POST /auth/v1/token?grant_type=pkce` 200 확인) — `auth.nemoneai.com`을 `next` 파라미터 없이 직접 방문해 테스트하면 콜백이 기본값(루트)으로 떨어지다 404였을 뿐, 네이버 연동 자체의 문제가 아니었음. 위 루트 리다이렉트 추가로 증상 해결, 실제 로그인은 서비스(now/matmatch)의 로그인 버튼을 거쳐야 `next`가 채워져 정상 복귀함.
- **"로그인 폼 없이 바로 통과/거부됨"**: 브라우저에 이미 네이버 로그인 세션이 남아있으면 네이버가 폼을 건너뛰고 그 세션 계정으로 바로 진행 — 그 계정이 검수 전 [멤버 관리] 미등록 계정이면 네이버 측에서 즉시 거부. 버그 아님.
- **동일 이메일로 여러 프로바이더 로그인 시 같은 계정으로 연결됨**: Supabase의 기본 identity linking 동작(이메일 일치 시 자동 병합) — 통합인증 설계 목적에 정확히 부합, 의도된 동작.

### 남은 작업 (사용자 진행)
- 네이버 개발자센터에서 [검수요청] 진행 필요 — 승인 전까지는 [멤버 관리] 등록 계정만 로그인 가능
