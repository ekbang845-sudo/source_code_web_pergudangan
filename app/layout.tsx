import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GlobalToast from "@/components/GlobalToast";
import NextTopLoader from 'nextjs-toploader';
import Providers from "@/components/Providers";
import GlobalLoading from "@/components/GlobalLoading";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gudang Kelurahan",
  description: "Gudang Kelurahan Gedong",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense fallback={null}> 
          <NextTopLoader
            color="#1E88E5"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #2299DD,0 0 5px #2299DD"
            zIndex={1600}
          />
          <GlobalToast/>
          <GlobalLoading />
        </Suspense>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}