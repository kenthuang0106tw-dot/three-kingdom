import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "吞食天地・Phaser 戰鬥原型",
  description: "使用 Phaser 3 建立的三國街機橫向動作遊戲原型。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="zh-Hant"><body>{children}</body></html>;
}
