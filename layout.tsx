import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VPN Тёма — свобода в сети без границ",
  description:
    "Тёма помогает безопасно выходить в интернет из любой точки мира — без слежки и лишних данных. Privacy-first, no-logs."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
