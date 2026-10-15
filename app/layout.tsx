import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import SyncProvider from "@/components/SyncProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });

export const metadata: Metadata = {
  title: "Inkwell",
  description: "A daily writing habit. One prompt, a few words, every day.",
};

// Runs before the page paints, so there's no flash of the wrong theme.
// Uses the saved choice, or falls back to the system setting.
const themeScript = `(function(){try{var t=localStorage.getItem('inkwell:theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen antialiased">
        <SyncProvider>
          <Suspense fallback={<div className="h-[57px] border-b border-line" />}>
            <Header />
          </Suspense>
          {children}
        </SyncProvider>
      </body>
    </html>
  );
}