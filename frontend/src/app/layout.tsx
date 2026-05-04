import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Ritey AI | Presentations from the Future",
  description: "Generate structured, high-quality presentation decks in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Safe font loading via link tags to avoid CSS @import issues */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen relative font-dm-sans bg-background text-on-background">
        {/* Global Dot Grid Background */}
        <div className="fixed inset-0 z-[-1] dot-grid opacity-50 pointer-events-none" />
        
        {/* Global Ambient Blobs */}
        <div className="ambient-blob w-[500px] h-[500px] bg-violet-600/10 top-[-10%] left-[-10%]" style={{ animation: 'drift 15s infinite ease-in-out' }} />
        <div className="ambient-blob w-[400px] h-[400px] bg-blue-600/10 bottom-[-10%] right-[-10%]" style={{ animation: 'drift 12s infinite ease-in-out reverse' }} />
        
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

