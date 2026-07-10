import type { Metadata } from "next";
import "./globals.css";
import "./game-extra.css";

export const metadata: Metadata = { title:"龍焰戰紀｜原創街機動作遊戲", description:"重返群雄並起的年代，在虎牢關展開熱血橫向清版戰鬥。" };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-Hant"><body>{children}</body></html>}
