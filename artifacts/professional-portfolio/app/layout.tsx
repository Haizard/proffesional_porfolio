import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "haithammisape — AI Agency & Custom Tech",
    template: "%s | haithammisape",
  },
  description:
    "haithammisape transforms businesses with AI automation, custom software, forex bots, and purpose-built computers. Your competitive edge, engineered.",
  keywords: [
    "AI agency",
    "AI automation",
    "custom computers",
    "forex bots",
    "n8n",
    "business automation",
    "SaaS development",
    "server setup",
  ],
  openGraph: {
    title: "haithammisape — AI Agency & Custom Tech",
    description: "Transform your business with AI agents, custom software, and purpose-built machines.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
