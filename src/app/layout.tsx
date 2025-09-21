import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/QueryProvider";
import SessionProvider from "@/components/SessionProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Toaster } from "react-hot-toast";
import RootLayoutClient from "./RootLayoutClient";
import { RouteLoadingProvider, RouteLoader } from '@/components/PageLoader';
import ReCaptchaProvider from '@/components/ReCaptchaProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LocalSpark - Find Trusted Local Service Providers",
  description: "Connect with verified local providers for home-cooked meals, mobile haircuts, cleaning, tutoring, and repairs in Tunisia and Hungary. Directory and messaging platform for trusted local services.",
  keywords: "local services, home cooking, mobile barber, cleaning, tutoring, repairs, Tunisia, Hungary, marketplace",
  openGraph: {
    title: "LocalSpark - Find Trusted Local Service Providers",
    description: "Connect with verified local providers for everyday services near you.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "LocalSpark - Find Trusted Local Service Providers",
    description: "Connect with verified local providers for everyday services near you.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <LanguageProvider>
          <RootLayoutClient>
            <SessionProvider>
              <QueryProvider>
                <ReCaptchaProvider>
                  <RouteLoadingProvider>
                    {children}
                    <RouteLoader />
                  </RouteLoadingProvider>
                </ReCaptchaProvider>
                <Toaster position="top-right" />
              </QueryProvider>
            </SessionProvider>
          </RootLayoutClient>
        </LanguageProvider>
      </body>
    </html>
  );
}
