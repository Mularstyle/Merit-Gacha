import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kanit",
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
    <html lang="th" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Charm:wght@400;700&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme');
                if (theme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${kanit.variable} font-sans antialiased min-h-screen`}
      >
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  );
}
