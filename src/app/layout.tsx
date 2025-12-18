import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '古籍智能阅读平台',
  description: 'AI 赋能的古籍扫描、阅读与诗词创作平台',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
