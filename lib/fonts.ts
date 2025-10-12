import { Roboto, Geist, Geist_Mono } from "next/font/google";

export const roboto = Roboto({ subsets: ["latin"], weight: "500" });

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
