import type { Metadata } from 'next';
import './globals.css';
import { ReactQueryProvider } from '@/providers';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  metadataBase: new URL('https://dsview.it.kmitl.ac.th/'),
  title: {
    default: 'DSView',
    template: '%s | DSView',
  },
  description: 'DSView Webapplication for learn data structure',
  openGraph: {
    title: 'DSView',
    description: 'DSView Webapplication for learn data structure',
    url: 'https://dsview.it.kmitl.ac.th',
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
      <body className={`font-sans antialiased`}>
        <main>
          <ReactQueryProvider>{children}</ReactQueryProvider>
          <Toaster position="top-center" />
        </main>
      </body>
    </html>
  );
}
