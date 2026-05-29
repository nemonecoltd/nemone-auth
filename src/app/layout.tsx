import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEMONE 통합 인증 센터",
  description: "네모네 생태계를 연결하는 단 하나의 계정",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" as="style" crossOrigin="" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#0c0c0c] text-white overflow-x-hidden antialiased">
        {children}
      </body>
    </html>
  );
}
