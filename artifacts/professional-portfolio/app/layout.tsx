import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen antialiased bg-background text-foreground font-sans selection:bg-primary/30 selection:text-primary">
        {children}
        <Toaster 
          position="bottom-right" 
          toastOptions={{
            style: {
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid #1e293b',
              borderRadius: '2px',
              fontFamily: 'var(--font-geist-mono)'
            },
            success: {
              iconTheme: { primary: '#00f0ff', secondary: '#000000' }
            }
          }} 
        />
      </body>
    </html>
  );
}
