import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Thai } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "MyShop - ร้านค้าออนไลน์",
    template: "%s | MyShop",
  },
  description: "ร้านค้าออนไลน์ครบครัน สินค้าคุณภาพ ราคาคุ้มค่า ชำระเงินง่ายด้วย PromptPay QR Code",
  keywords: ["ecommerce", "online shopping", "promptpay", "thailand", "ร้านค้าออนไลน์", "พร้อมเพย์"],
  authors: [{ name: "MyShop" }],
  creator: "MyShop",
  publisher: "MyShop",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: "https://myshop.com",
    siteName: "MyShop",
    title: "MyShop - ร้านค้าออนไลน์",
    description: "ร้านค้าออนไลน์ครบครัน สินค้าคุณภาพ ราคาคุ้มค่า ชำระเงินง่ายด้วย PromptPay QR Code",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MyShop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MyShop - ร้านค้าออนไลน์",
    description: "ร้านค้าออนไลน์ครบครัน สินค้าคุณภาพ ราคาคุ้มค่า ชำระเงินง่ายด้วย PromptPay QR Code",
    images: ["/og-image.jpg"],
  },
  verification: {
    google: "google-site-verification-code",
  },
};

export const viewport: Viewport = {
  themeColor: "#dc2626",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${inter.variable} ${notoSansThai.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}