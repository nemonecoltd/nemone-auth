import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// 서비스 롤 키를 쓰는 관리자 클라이언트 — auth.admin.* 같은 관리 API 호출 전용.
// 절대 브라우저로 내려가면 안 되므로 서버 코드(API 라우트)에서만 import할 것.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
