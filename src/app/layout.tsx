import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// 动态生成标题的函数
function generateMetadata(phase: number): Metadata {
  const phaseText = phase === 2 ? 'Second' : 'Third';
  
  return {
    title: `DPR ${phaseText} Halving Countdown | Deeper Network`,
    description: `Track the countdown to DPR ${phaseText.toLowerCase()} halving event on Deeper Network`,
    keywords: "DPR, Deeper Network, Halving, Countdown, Crypto",
    openGraph: {
      title: `DPR ${phaseText} Halving Countdown | Deeper Network`,
      description: `Track the countdown to DPR ${phaseText.toLowerCase()} halving event on Deeper Network`,
      type: "website",
    }
  };
}

export const metadata = generateMetadata(2); // 默认显示第二次减半

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
