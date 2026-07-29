import { redirect } from 'next/navigation';

// 루트 경로 자체는 페이지가 없음 — OAuth 흐름 중 예상치 못하게 여기로 떨어지는 경우
// 404 대신 로그인 화면으로 보내서 사용자가 최소한 다시 시도할 수 있게 함.
export default function RootPage() {
  redirect('/login');
}
