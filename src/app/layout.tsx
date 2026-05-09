import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#070b0a",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://atlascore.io"),
  title: {
    default: "Atlas Core — Centro de Comando Banking & Web3",
    template: "%s | Atlas Core",
  },
  description:
    "Atlas Core Banking — Plataforma institucional Web3 para gestão de wallets multi-moeda (EUR, BRL, USDT), settlement automatizado, swap e operações cross-border. A ponte entre o sistema financeiro tradicional e a economia digital.",
  keywords: [
    "Atlas Core",
    "Core Banking",
    "Fintech",
    "Web3",
    "Crypto",
    "Wallet",
    "Multi-moeda",
    "USDT",
    "EUR",
    "BRL",
    "Settlement",
    "Swap",
    "Cross-border",
    "Pagamentos",
    "Blockchain",
  ],
  authors: [{ name: "Atlas Core" }],
  creator: "Atlas Core Banking",
  publisher: "Atlas Core Banking",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_PT",
    url: "https://atlascore.io",
    siteName: "Atlas Core",
    title: "Atlas Core — Centro de Comando Banking & Web3",
    description:
      "Plataforma institucional Web3 para gestão de wallets multi-moeda, settlement automatizado e operações cross-border.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Atlas Core Banking",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atlas Core — Centro de Comando Banking & Web3",
    description:
      "Plataforma institucional Web3 para gestão de wallets multi-moeda, settlement automatizado e operações cross-border.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
