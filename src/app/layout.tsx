import './globals.css';
import type { Metadata, Viewport } from 'next';
import { AppProvider } from '@/lib/AppProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import SwipeNav from '@/components/SwipeNav';
import NowPlayingBar from '@/components/NowPlayingBar';
import AdGate from '@/components/AdGate';

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
    { media: '(prefers-color-scheme: light)', color: '#F1E6CC' },
    { media: '(prefers-color-scheme: dark)',  color: '#0A1330' },
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
            <AdGate />
          </ErrorBoundary>
        </AppProvider>
      </body>
    </html>
  );
}
