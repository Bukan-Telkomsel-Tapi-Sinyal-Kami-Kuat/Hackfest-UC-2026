import type { Metadata } from "next";
import { Nunito, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AuthModalProvider } from "@/context/AuthModalContext";
import { BiometricProvider } from "@/context/BiometricContext";
import { PiPProvider } from "@/context/PiPContext";
import { SessionProvider } from "@/context/SessionContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { PiPMonitor } from "@/components/monitoring/PiPMonitor";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-nunito-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VISEA — Belajar Adaptif untuk Anak Berkebutuhan Khusus",
  description:
    "Platform pendidikan inklusif berbasis Computer Vision dan AI untuk mendampingi orang tua mengajar anak di rumah.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${nunito.variable} ${nunitoSans.variable}`}>
      <body>
        <AuthProvider>
          <AuthModalProvider>
            <BiometricProvider>
              <PiPProvider>
                <SessionProvider>
                  {children}
                </SessionProvider>
                <AuthModal />
                <PiPMonitor />
              </PiPProvider>
            </BiometricProvider>
          </AuthModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
