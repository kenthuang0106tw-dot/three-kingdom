/// <reference types="vite/client" />

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import PhaserGame from "../app/game/PhaserGame";
import "../app/globals.css";

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;

function GitHubPagesGame() {
  return (
    <main className="arcade-shell" aria-label="龍焰戰紀街機遊戲">
      <aside className="side-art side-left" aria-hidden="true">
        <img src={assetUrl("art/zhaoyun/zhaoyun-master.png")} alt="" />
        <img src={assetUrl("art/guanyu/guanyu-master.png")} alt="" />
      </aside>

      <section className="phaser-stage" aria-label="Phaser 遊戲畫面">
        <PhaserGame />
        <div className="crt-lines" aria-hidden="true" />
      </section>

      <aside className="side-art side-right" aria-hidden="true">
        <img src={assetUrl("art/zhangfei/zhangfei-master.png")} alt="" />
        <img src={assetUrl("art/guanyu/guanyu-master.png")} alt="" />
      </aside>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GitHubPagesGame />
  </StrictMode>,
);
