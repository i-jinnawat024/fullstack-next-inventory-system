import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { NotificationProvider } from "@/lib/contexts/notification-context";
import { AppHeader } from "@/components/layout/app-header";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "�,��,��,s�,s�1?�,s�,'�,?�,��,'�,T�,,�1%�,��,,�,��,�,؅,��,'�,T�,,�1%�,�",
  description:
    "�,��,��,s�,s�,^�,�,\"�,?�,��,��,?�,��,��1?�,s�,'�,?�,��,'�,T�,,�1%�,��1?�,��,��,,�,��,�,؅,��,'�,T�,,�1%�,�",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentYear = new Date().getFullYear();

  return (
    <html lang="th">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider defaultTheme="light">
          <NotificationProvider>
            <div
              className="flex min-h-screen flex-col"
              style={{
                backgroundColor: "var(--color-bg)",
                color: "var(--color-text)",
              }}
            >
            <AppHeader />

            <main className="w-full flex-1">
              <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                {children}
              </div>
            </main>

            <footer
              className="border-t"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
              }}
            >
              <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm sm:px-6 lg:px-8 lg:flex-row lg:items-center lg:justify-between">
                <span style={{ color: "var(--color-text-muted)" }}>
                  Ac {currentYear} �,��,��,s�,s�,,�,��,�,؅,�,�,��,"�,, A� �,��,؅,�,T�,��,'�,,�,��,'�,-�,~�,'�1O
                </span>
                <span style={{ color: "var(--color-text-secondary)" }}>
                  �,��,��1%�,��,؅,,�,�1%�,T�1?�,z�,��1^�,-�,��,T�,�,s�,��,T�,,�,T�,?�,��,��,-�,3�,؅,��,T�,,�,-�,؅,-�,�,��,z�,�,��,"�,,
                </span>
              </div>
            </footer>

            <ThemeToggle />
            </div>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
