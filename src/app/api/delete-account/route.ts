import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

// 계정 삭제는 항상 "지금 로그인된 본인"만 지울 수 있어야 하므로, 클라이언트가
// 보낸 id는 절대 신뢰하지 않고 쿠키 세션(server.ts, anon key)으로 서버에서
// 직접 유저를 확인한 뒤 그 id로만 admin 삭제(admin.ts, service role)를 호출한다.
// 각 서비스(PACE/Plants/matmatch)별 DB에 남는 user_id는 이번 범위에 포함하지 않음 —
// 우선 공유 계정(auth.users) 자체 삭제부터 처리(2026-08-31).
export async function POST() {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'not authenticated' }, { status: 401 });
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
