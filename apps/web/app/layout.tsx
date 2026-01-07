import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { ImpersonationBanner } from '@/components/auth/impersonation-banner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DBSnap - Simple Database Backups',
  description: 'Automated snapshots for PostgreSQL and MongoDB',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <ImpersonationBanner />
          {children}
        </Providers>
      </body>
    </html>
  );
}
