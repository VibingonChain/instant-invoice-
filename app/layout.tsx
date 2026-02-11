import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Instant Invoice — Crypto Invoices in 2 Clicks',
  description:
    'Generate shareable USDC invoice links with QR codes. No accounts, no backend. Settlement in seconds on Base & Arbitrum.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-brand-dark text-white antialiased`}>
        <Providers>
          <main className="mx-auto max-w-lg px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
