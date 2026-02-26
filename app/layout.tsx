import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/shared/lib/utils";
import { ThemeProvider } from "@/shared/components/theme-provider";
import { Toaster } from "@/shared/components/ui/sonner";
import { ColorThemeProvider } from "@/shared/components/color-theme-provider";
import { client } from "@/shared/sanity/lib/client";
import { GLOBAL_SEO_QUERY } from "@/shared/sanity/queries/seo";
import { urlFor } from "@/shared/sanity/lib/image";

const isProduction = process.env.NEXT_PUBLIC_SITE_ENV === "production";

export async function generateMetadata() {
  const seo = await client.fetch(GLOBAL_SEO_QUERY);
  return {
    title: seo?.title || "Brainive",
    description: seo?.description || "Brainive.",
    keywords: seo?.keywords || [
      "Next.js",
      "Sanity",
      "Schema UI Starter",
      "Sito web",
      "SEO",
      "React",
      "Template",
    ],
    openGraph: {
      title: seo?.title || "Brainive",
      description: seo?.description || "Brainive",
      images: [
        seo?.image?.asset?.url
          ? {
              url: urlFor(seo.image).quality(100).url(),
              width: seo?.image?.asset?.metadata?.dimensions?.width || 1200,
              height: seo?.image?.asset?.metadata?.dimensions?.height || 630,
            }
          : {
              url: `${process.env.NEXT_PUBLIC_SITE_URL}/images/og-image.jpg`,
              width: 1200,
              height: 630,
            },
      ],
      locale: "en_US",
      type: "website",
      siteName: "Schema UI Starter",
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.title || "Brainive",
      description: seo?.description || "Brainive",
      images: [
        seo?.image?.asset?.url
          ? urlFor(seo.image).quality(100).url()
          : `${process.env.NEXT_PUBLIC_SITE_URL}/images/brainive_og.jpg`,
      ],
      creator: "@tuotwitter", // Sostituisci con il tuo handle Twitter
    },
    robots:
      seo?.robots || (!isProduction ? "noindex, nofollow" : "index, follow"),
    authors: [{ name: "Brainive", url: process.env.NEXT_PUBLIC_SITE_URL }],
  };
}

const fontSans = FontSans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <link rel="icon" href="/favicon.ico" />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased overscroll-none",
          fontSans.variable
        )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <ColorThemeProvider>{children}</ColorThemeProvider>
        </ThemeProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
