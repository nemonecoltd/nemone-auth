import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

 // origin을 request.url 대신 고정값 사용
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://auth.nemoneai.com'

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // 온보딩 완료 여부 확인
      const onboardingCompleted = data.user.user_metadata?.onboarding_completed;
      
      // 1. 온보딩이 안 된 경우 무조건 auth 서버의 온보딩 페이지로
      if (!onboardingCompleted) {
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      // 2. 온보딩이 완료된 경우
      // 만약 next가 'http'로 시작하는 외부 URL이면 해당 URL로 바로 리다이렉트 (SSO 핵심)
      if (next.startsWith('http')) {
        return NextResponse.redirect(next)
      }
      
      // 그 외에는 auth 서버 내의 상대 경로로 리다이렉트
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // 에러 발생 시 로그인 페이지로
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
}