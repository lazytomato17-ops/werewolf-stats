import type { Metadata } from "next";
import { Orbitron } from "next/font/google"; // ←ここを変えた
import "./globals.css";

// ゲーミングフォントの設定
const orbitron = Orbitron({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Werewolf Stats",
  description: "人狼戦績ランキング",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      {/* classNameにフォントを適用 */}
      <body className={`${orbitron.className} bg-black text-white`}>{children}</body>
    </html>
  );
}