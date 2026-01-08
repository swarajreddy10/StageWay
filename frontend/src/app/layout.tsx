import { Toaster } from "sonner";
import AuthProvider from "../components/AuthProvider";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";
import QueryProvider from "../components/QueryProvider";
import "./globals.css";

export const metadata = {
  title: "StageWay - Event Management Platform",
  description: "Discover and manage amazing events",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <QueryProvider>
          <AuthProvider>
            <div className="app-shell">
              <NavBar />
              <div className="app-main">{children}</div>
              <Footer />
            </div>
          </AuthProvider>
          <Toaster richColors position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
