import './globals.css';
import type { Metadata, Viewport } from 'next';
import { AppProvider } from '@/lib/AppProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import SwipeNav from '@/components/SwipeNav';
import NowPlayingBar from '@/components/NowPlayingBar';

export const metadata: Metadata = {
  title: 'سەڵاتی · نوێژەکانم',
  description: 'نوێژەکانم — Prayer times, Qibla, Adhkar and habit tracking',
  manifest: '/manifest.json',
  icons: { icon: '/icon.svg' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5EFE0' },
    { media: '(prefers-color-scheme: dark)',  color: '#0E2421' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ckb" dir="rtl" suppressHydrationWarning>
      <body>
        <AppProvider>
          <ErrorBoundary>
            <div className="phone-frame">{children}</div>
            <SwipeNav />
            <NowPlayingBar />
          </ErrorBoundary>
        </AppProvider>
      </body>
    </html>
  );
}
