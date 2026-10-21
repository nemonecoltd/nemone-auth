/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // 이 앱은 next/image를 쓰지 않는다 — 이미지 최적화 엔드포인트(/_next/image)를 꺼서 그쪽 취약점(서비스 거부·AVIF 처리 등)의 노출면을 없앤다.
  images: { unoptimized: true },
  // 보안 헤더 — 로그인 화면이 남의 사이트 iframe에 들어가 클릭재킹에 쓰이지 않게 한다(frame-ancestors/X-Frame-Options).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
