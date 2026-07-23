import type { Metadata, Viewport } from "next";
import "./globals.css";

const title = "一夕典藏 · 图谱与典籍";
const description =
  "一夕典藏收录传承图谱与经典原文，包括《般若波罗蜜多心经》。";

function metadata(baseUrl: URL): Metadata {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const socialImage = new URL(`${basePath}/og.png`, baseUrl.origin).toString();

  return {
    metadataBase: baseUrl,
    title,
    description,
    applicationName: "一夕典藏",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "一夕典藏",
    },
    formatDetection: {
      telephone: false,
    },
    openGraph: {
      type: "website",
      title,
      description,
      images: [{ url: socialImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}

export async function generateMetadata(): Promise<Metadata> {
  if (process.env.DEPLOY_TARGET === "github-pages") {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      "https://noraligithub.github.io/yixi-chart/";
    return metadata(new URL(siteUrl));
  }

  const { headers } = await import("next/headers");
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = new URL(`${protocol}://${host}`);
  return metadata(baseUrl);
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#ece9e1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
