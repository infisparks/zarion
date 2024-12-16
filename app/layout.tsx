import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navigation from './components/Navigation';
import Footer from './components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LUXE - Premium Fashion',
  description: 'Premium fashion destination offering curated collections',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <main className="min-h-screen pt-16 md:pt-0 pb-16 md:pb-0">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}