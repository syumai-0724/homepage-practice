import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: '整体室 余白｜整えることを、日常に。',
  description: '仕事帰りにも、休日にも。働く世代のための、上質で気軽に通える整体院のデザインサンプル。架空店舗のプレビューです。',
  robots: { index: false, follow: false },
  icons: { icon: '/favicon.svg' },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}
