import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto-sans-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ศาลพระภูมิศักดิ์สิทธิ์ Gacha",
  description: "Merit Gacha - Thai-inspired prayer gacha experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="dark">
      <body
        className={`${notoSansThai.variable} font-sans antialiased bg-gradient-to-b from-gray-900 via-gray-800 to-black text-gray-100 min-h-screen`}
      >
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  );
}
