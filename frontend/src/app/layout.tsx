import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import AuthProvider from "../components/AuthProvider";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";
import PageLoader from "../components/PageLoader";
import QueryProvider from "../components/QueryProvider";
import SmoothScroll from "../components/SmoothScroll";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata = {
  title: "StageWay - Where Events Come Alive",
  description:
    "Create, manage, and experience extraordinary events. Professional event management with QR check-in, real-time analytics, and seamless registration.",
  keywords: ["events", "event management", "tickets", "registration", "StageWay"],
  openGraph: {
    title: "StageWay - Where Events Come Alive",
    description: "Professional event management platform",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${plusJakarta.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-[#060810] text-foreground antialiased font-sans">
        <QueryProvider>
          <AuthProvider>
            <PageLoader />
            <SmoothScroll>
              <div className="app-shell">
                <NavBar />
                <div className="app-main">{children}</div>
                <Footer />
              </div>
            </SmoothScroll>
          </AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#141720",
                border: "1px solid rgba(124,90,245,0.18)",
                color: "#eef0f7",
                borderRadius: "12px",
                fontSize: "0.875rem",
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
