import { NextResponse } from 'next/server';

// Supabase Custom Provider(custom:naver)의 UserInfo URL로 사용.
// 네이버 /v1/nid/me는 { resultcode, message, response: { id, email, name, profile_image } }로
// 한 번 감싸서 응답하는데, Supabase는 표준 OIDC 클레임이 최상위에 있길 기대해서 그대로 붙이면
// sub/email을 못 찾을 수 있음 — 여기서 response를 풀어서 평평하게 재포장.
export async function GET(request: Request) {
  const authorization = request.headers.get('authorization');
  if (!authorization) {
    return NextResponse.json({ error: 'missing authorization header' }, { status: 401 });
  }

  const res = await fetch('https://openapi.naver.com/v1/nid/me', {
    headers: { Authorization: authorization },
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'naver userinfo request failed' }, { status: res.status });
  }

  const data = await res.json();
  const profile = data?.response;
  if (!profile?.id) {
    return NextResponse.json({ error: 'invalid naver userinfo response' }, { status: 502 });
  }

  return NextResponse.json({
    sub: profile.id,
    email: profile.email,
    name: profile.name || profile.nickname,
    picture: profile.profile_image,
    email_verified: true,
  });
}
