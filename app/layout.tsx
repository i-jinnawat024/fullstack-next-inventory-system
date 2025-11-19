import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { NotificationProvider } from "@/lib/contexts/notification-context";
import { ConditionalLayout } from "@/components/layout/conditional-layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ระบบเบิกสินค้า",
  description: "ระบบจัดการคำขอเบิกสินค้าและคลังสินค้า",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider defaultTheme="dark">
          <NotificationProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
