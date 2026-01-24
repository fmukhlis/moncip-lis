import "./globals.css";

import StoreProvider from "@/store-provider";

import type { Metadata } from "next";

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
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
        <StoreProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster />
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
