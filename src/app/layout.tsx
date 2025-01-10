import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DPR Second Halving Countdown | Deeper Network",
  description: "Track the countdown to DPR second halving event on Deeper Network",
  keywords: "DPR, Deeper Network, Halving, Countdown, Crypto",
  openGraph: {
    title: "DPR Second Halving Countdown | Deeper Network",
    description: "Track the countdown to DPR second halving event on Deeper Network",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
