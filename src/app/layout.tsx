import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://openhouse.it.kmitl.ac.th/'),
  title: {
    default: 'DSView',
    template: '%s | DSView',
  },
  description: 'DSView Webapplication for learn data structure',
  openGraph: {
    title: 'DSView',
    description: 'DSView Webapplication for learn data structure',
    url: 'https://openhouse.it.kmitl.ac.th',
    siteName: 'dsview.it.kmitl.ac.th',
    images: ['/opengraph.webp'],
    locale: 'en-US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
