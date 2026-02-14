import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from '@/contexts/LanguageContext'
import { ProductProvider } from "@/contexts/productContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin Panel | Bichil Globus",
  description: "Bichil Globus вэбсайтын удирдлагын самбар",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn">
      <body className={`${inter.variable} antialiased bg-gray-50`}>
        <ProductProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ProductProvider>

      </body>
    </html>
  );
}
