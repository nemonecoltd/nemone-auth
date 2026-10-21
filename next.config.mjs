/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
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
