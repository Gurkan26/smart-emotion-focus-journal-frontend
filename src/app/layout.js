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

export const metadata = {
  title: "Prompt Optimizer — AI Prompt Engineering Platform",
  description: "Akıllı Prompt Optimizasyon Platformu — Ollama, Gemma & Cloudflare AI Entegrasyonu",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-slate-900 dark:text-slate-100 selection:bg-sky-500/30 selection:text-sky-200 transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
