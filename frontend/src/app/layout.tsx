import "./globals.css";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import AuthProvider from "../components/AuthProvider";

const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

export const metadata = {
  title: "StageWay - Event Management Platform",
  description: "Discover and manage amazing events",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AuthProvider>
          <div className="app-shell">
            <NavBar />
            <div className="app-main">{children}</div>
            <Footer />
          </div>
        </AuthProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
