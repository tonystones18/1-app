import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Providers from '@/components/providers/Providers';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'VisioneSoft Admin', template: '%s | VisioneSoft' },
  description: 'VisioneSoft Enterprise iGaming Platform — Admin Portal',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
