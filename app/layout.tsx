import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Frame — Photography Portfolio",
  description: "Photography storytelling portfolio. Analog, film, street. Based in Padang, West Sumatra.",
  keywords: ["photography", "analog", "film", "portrait", "street", "Padang", "West Sumatra"],
  openGraph: {
    title: "Frame — Photography Portfolio",
    description: "Analog storytelling through film photography.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
