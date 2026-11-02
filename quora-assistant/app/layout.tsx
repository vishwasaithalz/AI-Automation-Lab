import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quora Answer Studio',
  description: 'Private research and drafting workspace for thoughtful Quora answers.',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
