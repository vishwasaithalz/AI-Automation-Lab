import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quora Answer Studio',
  description: 'Research, draft, queue and track thoughtful Quora answers.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
