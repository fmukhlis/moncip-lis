import "./globals.css";

import type { Metadata } from "next";

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { geistMono, geistSans } from "@/lib/fonts";

export const metadata: Metadata = {
  title: {
    default: process.env.APP_NAME ?? "Moncip LIS",
    template: `%s | ${process.env.APP_NAME ?? "Moncip LIS"}`,
  },
  description: "Laboratory Information System Software",
  openGraph: {
    title: {
      default: process.env.APP_NAME ?? "Moncip LIS",
      template: `%s | ${process.env.APP_NAME ?? "Moncip LIS"}`,
    },
    description: "Laboratory Information System Software",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
