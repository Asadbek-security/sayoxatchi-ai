import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { I18nProvider } from "@/lib/i18n";
import { BottomNav, Footer, Header } from "@/components/Shell";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SAYOXATCHI AI — dam olish maskanlarini AI bilan tekshiring",
  description: "Reklama, sharhlar va real mijoz tajribasini bitta AI bahoga birlashtiruvchi platforma.",
};

export const viewport: Viewport = { themeColor: "#167d54" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={inter.variable}>
      <body className="min-h-dvh font-sans antialiased">
        <I18nProvider>
          <Header />
          <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:pb-10">{children}</main>
          <Footer />
          <BottomNav />
        </I18nProvider>
      </body>
    </html>
  );
}
