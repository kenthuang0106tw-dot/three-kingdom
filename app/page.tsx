import PhaserGame from "./game/PhaserGame";

export default function Home() {
  return (
    <main className="arcade-shell" aria-label="三國街機動作遊戲">
      <aside className="side-art side-left" aria-hidden="true">
        <img src="/art/zhaoyun/zhaoyun-master.png" alt="" />
        <img src="/art/guanyu/guanyu-master.png" alt="" />
      </aside>

      <section className="phaser-stage" aria-label="Phaser 遊戲畫面">
        <PhaserGame />
        <div className="crt-lines" aria-hidden="true" />
      </section>

      <aside className="side-art side-right" aria-hidden="true">
        <img src="/art/zhangfei/zhangfei-master.png" alt="" />
        <img src="/art/guanyu/guanyu-master.png" alt="" />
      </aside>
    </main>
  );
}
