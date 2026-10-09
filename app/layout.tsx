import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider, themeScript } from "@/lib/theme";
import { CompareTray, FloatingTabBar, Footer, Header } from "@/components/Shell";
import { CityBackdrop, GlassPointer } from "@/components/CityBackdrop";
import { IconDefs } from "@/components/icons";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets: ["latin", "cyrillic"], variable: "--font-manrope", weight: ["600", "700", "800"], display: "swap" });

export const metadata: Metadata = {
  title: "SAYOXATCHI AI — dam olish maskanlarini AI bilan tekshiring",
  description: "Reklama, sharhlar va real mijoz tajribasini bitta AI bahoga birlashtiruvchi platforma.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#03110d" },
    { media: "(prefers-color-scheme: light)", color: "#eef7f2" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" data-theme="dark" className={`${inter.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preload" as="image" href="/bg/toshkent.webp" />
      </head>
      <body className="min-h-dvh font-sans text-[16px] antialiased">
        <ThemeProvider>
          <I18nProvider>
            <IconDefs />
            <CityBackdrop />
            <GlassPointer />
            <Header />
            <main className="mx-auto max-w-[1280px] px-4 pt-8 md:px-6">{children}</main>
            <Footer />
            <CompareTray />
            <FloatingTabBar />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
