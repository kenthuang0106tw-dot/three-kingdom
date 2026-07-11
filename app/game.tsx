"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Enemy = { id:number; x:number; y:number; hp:number; maxHp:number; vx:number; hit:number; attack:number; dead:boolean; kind:0|1|2 };
type Game = {
  player:{x:number;y:number;z:number;vz:number;hp:number;maxHp:number;face:number;attack:number;combo:number;special:number;hurt:number;fighter:number;speed:number;power:number};
  enemies:Enemy[]; particles:{x:number;y:number;vx:number;vy:number;life:number;color:string}[];
  camera:number; score:number; wave:number; time:number; shake:number; status:"ready"|"playing"|"paused"|"won"|"lost";
};

const W=1280,H=720,FLOOR_TOP=378,FLOOR_BOTTOM=625,WORLD=3300,WAVE_X=[0,720,1550,2400];
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const FIGHTERS=[
  {name:"關羽",role:"長拳 · 均衡",main:"#147b82",accent:"#e8bc48",hp:110,speed:5.1,power:1.05,glyph:"關"},
  {name:"張飛",role:"重裝 · 投技",main:"#9c432b",accent:"#d8b54e",hp:135,speed:4.2,power:1.28,glyph:"張"},
  {name:"趙雲",role:"劍士 · 神速",main:"#315f9e",accent:"#d8e1e3",hp:92,speed:5.9,power:.92,glyph:"趙"},
  {name:"黃忠",role:"弓手 · 遠攻",main:"#66518c",accent:"#e5cb73",hp:82,speed:5.0,power:1.12,glyph:"黃"},
  {name:"魏延",role:"刀腿 · 全能",main:"#4b7955",accent:"#d8d2bd",hp:100,speed:5.3,power:1,glyph:"魏"},
];

function initialGame(fighter=0):Game {
  const f=FIGHTERS[fighter];
  return {player:{x:260,y:520,z:0,vz:0,hp:f.hp,maxHp:f.hp,face:1,attack:0,combo:0,special:0,hurt:0,fighter,speed:f.speed,power:f.power},enemies:[],particles:[],camera:0,score:0,wave:0,time:99,shake:0,status:"ready"};
}

function spawnWave(g:Game){
  g.wave++;
  const count=3+g.wave;
  const base=WAVE_X[g.wave];
  for(let i=0;i<count;i++) g.enemies.push({id:g.wave*20+i,x:base+i*125+Math.random()*55,y:420+Math.random()*170,hp:34+g.wave*8,maxHp:34+g.wave*8,vx:0,hit:0,attack:50+Math.random()*80,dead:false,kind:(i%3) as 0|1|2});
}

function drawBackground(ctx:CanvasRenderingContext2D,cam:number){
  const sky=ctx.createLinearGradient(0,0,0,430); sky.addColorStop(0,"#061d28");sky.addColorStop(.5,"#0b5160");sky.addColorStop(1,"#f09b4a");ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  ctx.fillStyle="#e6b95c";ctx.beginPath();ctx.arc(1010-cam*.06,105,57,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=.23;ctx.fillStyle="#08191d";for(let i=-1;i<8;i++){const x=i*330-(cam*.12%330);ctx.beginPath();ctx.moveTo(x,330);ctx.lineTo(x+170,105+(i%2)*45);ctx.lineTo(x+350,330);ctx.fill()}ctx.globalAlpha=1;
  ctx.fillStyle="#0a3438";ctx.fillRect(0,300,W,100);ctx.fillStyle="#0d5d5f";for(let i=-1;i<14;i++){let x=i*110-(cam*.32%110);ctx.beginPath();ctx.ellipse(x,345+(i%3)*13,92,15,0,0,Math.PI*2);ctx.fill()}
  ctx.fillStyle="#071e24";ctx.fillRect(0,392,W,18);ctx.fillStyle="#d49443";ctx.fillRect(0,399,W,5);
  for(let i=-1;i<7;i++){const x=i*270-(cam*.7%270);ctx.fillStyle="#621f24";ctx.fillRect(x+18,90,45,335);ctx.fillStyle="#9d3b2d";ctx.fillRect(x+26,90,14,335);ctx.fillStyle="#d0863d";ctx.fillRect(x+12,410,57,18);ctx.fillRect(x+8,76,64,17)}
  const floor=ctx.createLinearGradient(0,FLOOR_TOP,0,H);floor.addColorStop(0,"#384d58");floor.addColorStop(1,"#14212d");ctx.fillStyle=floor;ctx.fillRect(0,FLOOR_TOP,W,H-FLOOR_TOP);
  ctx.strokeStyle="rgba(184,150,91,.24)";ctx.lineWidth=2;for(let y=420;y<720;y+=62){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}for(let x=-100;x<W+100;x+=155){ctx.beginPath();ctx.moveTo(x,378);ctx.lineTo(x+80,720);ctx.stroke()}
  ctx.fillStyle="#091116";ctx.fillRect(0,648,W,72);ctx.fillStyle="#b77931";ctx.fillRect(0,648,W,7);
}

function body(ctx:CanvasRenderingContext2D,x:number,y:number,z:number,face:number,main:string,accent:string,pose:number,enemy=false,kind=0,hurt=0){
  ctx.save();ctx.translate(x,y-z);ctx.scale(face,1);if(hurt>0&&Math.floor(hurt/3)%2===0)ctx.globalAlpha=.45;
  ctx.fillStyle="rgba(0,0,0,.42)";ctx.beginPath();ctx.ellipse(0,z+7,37,11,0,0,Math.PI*2);ctx.fill();
  const bob=Math.sin(pose*.18)*2;
  ctx.strokeStyle="#120e12";ctx.lineWidth=9;ctx.lineCap="round";
  ctx.beginPath();ctx.moveTo(-13,-35+bob);ctx.lineTo(-18,-3);ctx.moveTo(13,-35+bob);ctx.lineTo(21,-2);ctx.stroke();
  ctx.strokeStyle=accent;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-13,-35+bob);ctx.lineTo(-18,-3);ctx.moveTo(13,-35+bob);ctx.lineTo(21,-2);ctx.stroke();
  ctx.fillStyle=main;ctx.beginPath();ctx.moveTo(-27,-91+bob);ctx.lineTo(25,-91+bob);ctx.lineTo(31,-37+bob);ctx.lineTo(-29,-37+bob);ctx.fill();
  ctx.fillStyle=accent;ctx.fillRect(-31,-69+bob,62,13);
  ctx.strokeStyle="#120e12";ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(-22,-78+bob);ctx.lineTo(-44,-51+bob);ctx.moveTo(21,-77+bob);ctx.lineTo(40+(pose>0?20:0),-56-(pose>0?11:0)+bob);ctx.stroke();
  ctx.strokeStyle=main;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-22,-78+bob);ctx.lineTo(-44,-51+bob);ctx.moveTo(21,-77+bob);ctx.lineTo(40+(pose>0?20:0),-56-(pose>0?11:0)+bob);ctx.stroke();
  ctx.fillStyle="#e6a66f";ctx.beginPath();ctx.arc(0,-112+bob,22,0,Math.PI*2);ctx.fill();ctx.fillStyle="#16141a";ctx.beginPath();ctx.arc(-2,-121+bob,23,Math.PI,Math.PI*2);ctx.fill();
  if(enemy){ctx.fillStyle=kind===2?"#e0b447":"#333";ctx.fillRect(-25,-129+bob,50,8);ctx.fillStyle="#f3e5ce";ctx.fillRect(8,-111+bob,4,3)}else{ctx.fillStyle="#d4a634";ctx.fillRect(-15,-141+bob,30,12);ctx.fillStyle="#f1d476";ctx.fillRect(-3,-155+bob,7,17);ctx.fillStyle="#fff0d2";ctx.fillRect(8,-112+bob,5,4)}
  ctx.restore();
}

function spriteFrame(ctx:CanvasRenderingContext2D,img:HTMLImageElement,frames:number,frame:number,x:number,y:number,z:number,face:number,drawH:number,feetRatio:number,hurt:number){
  if(!img.complete||!img.naturalWidth)return;const sw=img.naturalWidth/frames,sh=img.naturalHeight,dw=drawH*(sw/sh);
  ctx.save();ctx.translate(x,y-z);ctx.scale(face,1);if(hurt>0&&Math.floor(hurt/3)%2===0)ctx.globalAlpha=.4;
  ctx.fillStyle="rgba(0,0,0,.45)";ctx.beginPath();ctx.ellipse(0,z+5,42,11,0,0,Math.PI*2);ctx.fill();
  ctx.imageSmoothingEnabled=false;ctx.drawImage(img,sw*frame,0,sw,sh,-dw/2,-drawH*feetRatio,dw,drawH);ctx.restore();
}

function spriteGridFrame(ctx:CanvasRenderingContext2D,img:HTMLImageElement,cols:number,rows:number,frame:number,x:number,y:number,z:number,face:number,drawH:number,feetRatio:number,hurt:number){
  if(!img.complete||!img.naturalWidth)return;const sw=img.naturalWidth/cols,sh=img.naturalHeight/rows,sx=(frame%cols)*sw,sy=Math.floor(frame/cols)*sh,dw=drawH*(sw/sh);
  ctx.save();ctx.translate(x,y-z);ctx.scale(face,1);if(hurt>0&&Math.floor(hurt/3)%2===0)ctx.globalAlpha=.4;ctx.fillStyle="rgba(0,0,0,.45)";ctx.beginPath();ctx.ellipse(0,z+5,42,11,0,0,Math.PI*2);ctx.fill();ctx.imageSmoothingEnabled=false;ctx.drawImage(img,sx,sy,sw,sh,-dw/2,-drawH*feetRatio,dw,drawH);ctx.restore();
}

function hitParticles(g:Game,x:number,y:number,color="#ffd661"){for(let i=0;i<9;i++)g.particles.push({x,y,vx:(Math.random()-.5)*8,vy:(Math.random()-.7)*8,life:22+Math.random()*10,color})}

export default function DynastyBrawl(){
  const canvas=useRef<HTMLCanvasElement>(null);const game=useRef<Game>(initialGame());const keys=useRef(new Set<string>());const raf=useRef(0);const [ui,setUi]=useState({status:"ready",hp:100,maxHp:110,fighter:0,score:0,wave:0,time:99,enemies:0,special:0,advance:false,progress:0});
  const startFighter=useCallback((fighter:number)=>{game.current=initialGame(fighter);game.current.status="playing";spawnWave(game.current)},[]);
  const press=useCallback((key:string)=>{keys.current.add(key);const g=game.current;if(g.status==="won"||g.status==="lost"){game.current=initialGame(g.player.fighter);game.current.status="playing";spawnWave(game.current)}else if(g.status==="paused"&&(key==="p"||key==="enter")){g.status="playing"}else if(key==="p"&&g.status==="playing")g.status="paused"},[]);
  const release=useCallback((key:string)=>keys.current.delete(key),[]);
  useEffect(()=>{const down=(e:KeyboardEvent)=>{const k=e.key.toLowerCase();if(["arrowup","arrowdown","arrowleft","arrowright"," "].includes(k))e.preventDefault();press(k)};const up=(e:KeyboardEvent)=>release(e.key.toLowerCase());window.addEventListener("keydown",down);window.addEventListener("keyup",up);return()=>{window.removeEventListener("keydown",down);window.removeEventListener("keyup",up)}},[press,release]);
  useEffect(()=>{const ctx=canvas.current?.getContext("2d");if(!ctx)return;const guanyu={idle:new Image(),walk:new Image(),combo:new Image(),airHit:new Image()},zhangfei={idle:new Image(),walk:new Image(),combo:new Image()},zhaoyun={idle:new Image(),walk:new Image(),combo:new Image()};guanyu.idle.src="/art/guanyu/guanyu-master.png";guanyu.walk.src="/art/guanyu/guanyu-walk.png";guanyu.combo.src="/art/guanyu/guanyu-combo.png";guanyu.airHit.src="/art/guanyu/guanyu-air-hit.png";zhangfei.idle.src="/art/zhangfei/zhangfei-master.png";zhangfei.walk.src="/art/zhangfei/zhangfei-walk.png";zhangfei.combo.src="/art/zhangfei/zhangfei-combo.png";zhaoyun.idle.src="/art/zhaoyun/zhaoyun-master.png";zhaoyun.walk.src="/art/zhaoyun/zhaoyun-walk.png";zhaoyun.combo.src="/art/zhaoyun/zhaoyun-combo.png";let last=performance.now(),tick=0,uiClock=0;
    const loop=(now:number)=>{const dt=Math.min(2,(now-last)/16.67);last=now;const g=game.current,p=g.player;tick++;
      if(g.status==="playing"){
        const left=keys.current.has("a")||keys.current.has("arrowleft"),right=keys.current.has("d")||keys.current.has("arrowright"),up=keys.current.has("w")||keys.current.has("arrowup"),down=keys.current.has("s")||keys.current.has("arrowdown");
        if(p.hurt<=0){if(left){p.x-=p.speed*dt;p.face=-1}if(right){p.x+=p.speed*dt;p.face=1}if(up)p.y-=p.speed*.7*dt;if(down)p.y+=p.speed*.7*dt}
        const livingNow=g.enemies.filter(e=>!e.dead);p.x=clamp(p.x,60,livingNow.length?Math.min(WORLD-80,WAVE_X[g.wave]+790):WORLD-80);p.y=clamp(p.y,FLOOR_TOP+68,FLOOR_BOTTOM);
        if((keys.current.has("k")||keys.current.has(" "))&&p.z===0){p.vz=12.5;keys.current.delete("k");keys.current.delete(" ")}p.z+=p.vz*dt;p.vz-=.72*dt;if(p.z<0){p.z=0;p.vz=0}
        if(keys.current.has("j")&&p.attack<=0&&p.hurt<=0){p.combo=p.combo%3+1;p.attack=15;keys.current.delete("j")}
        if(keys.current.has("l")&&p.special<=0&&p.hurt<=0){p.special=260;p.attack=34;p.combo=4;g.shake=14;keys.current.delete("l");let connected=false;for(const e of g.enemies)if(!e.dead&&Math.hypot(e.x-p.x,(e.y-p.y)*1.5)<150){e.hp-=30*p.power;e.hit=22;connected=true;hitParticles(g,e.x,e.y-65,"#77f4ef")}if(connected)p.hp=Math.max(1,p.hp-8)}
        if(p.attack>0){p.attack-=dt;if(p.attack>7&&p.attack<10){for(const e of g.enemies)if(!e.dead&&e.hit<=0&&Math.abs(e.y-p.y)<55&&(e.x-p.x)*p.face>5&&(e.x-p.x)*p.face<(p.combo===4?160:105+(p.fighter===0?18:0))){e.hp-=(p.combo===3?22:13)*p.power;e.hit=18;e.vx=p.face*(p.combo===3?13:6);g.score+=100*p.combo;g.shake=7;hitParticles(g,e.x,e.y-70)}}}else p.combo=0;
        p.special=Math.max(0,p.special-dt);p.hurt=Math.max(0,p.hurt-dt);
        for(const e of g.enemies){if(e.dead)continue;e.hit=Math.max(0,e.hit-dt);e.attack-=dt;if(e.hp<=0){e.dead=true;g.score+=500;hitParticles(g,e.x,e.y-60,"#ff765c");continue}if(e.hit>0){e.x+=e.vx*dt;e.vx*=.88}else{const dx=p.x-e.x,dy=p.y-e.y,dist=Math.hypot(dx,dy*1.5);if(dist>62){e.x+=Math.sign(dx)*(1.25+e.kind*.22)*dt;e.y+=Math.sign(dy)*.75*dt}else if(e.attack<=0&&p.hurt<=0){p.hp-=7+e.kind*2;p.hurt=34;p.x+=Math.sign(dx)*22;g.shake=10;e.attack=75+Math.random()*45;hitParticles(g,p.x,p.y-72,"#ff6d55")}}}
        g.enemies=g.enemies.filter(e=>!e.dead||e.hit>0);if(g.enemies.every(e=>e.dead)&&g.wave<3)spawnWave(g);if(g.wave===3&&g.enemies.every(e=>e.dead))g.status="won";if(p.hp<=0)g.status="lost";
        g.camera=clamp(p.x-W*.38,0,WORLD-W);g.time=Math.max(0,g.time-dt/60);if(g.time===0)g.status="lost";
        for(const q of g.particles){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=.35*dt;q.life-=dt}g.particles=g.particles.filter(q=>q.life>0);g.shake=Math.max(0,g.shake-dt);
      }
      ctx.save();if(g.shake)ctx.translate((Math.random()-.5)*g.shake,(Math.random()-.5)*g.shake);drawBackground(ctx,g.camera);
      const sorted:[number,"p"|"e",Enemy?][]=[[p.y,"p",undefined],...g.enemies.filter(e=>!e.dead).map(e=>[e.y,"e",e] as [number,"p"|"e",Enemy?])].sort((a,b)=>a[0]-b[0]);
      const fighter=FIGHTERS[p.fighter],moving=["a","d","w","s","arrowleft","arrowright","arrowup","arrowdown"].some(k=>keys.current.has(k));for(const item of sorted){if(item[1]==="p"){const comboFrame=Math.min(5,(Math.max(1,p.combo)-1)*2+(p.attack<9?1:0));if(p.fighter===0){if(p.hp<=0)spriteFrame(ctx,guanyu.airHit,6,5,p.x-g.camera,p.y,0,p.face,300,.71,0);else if(p.hurt>0)spriteFrame(ctx,guanyu.airHit,6,3,p.x-g.camera,p.y,p.z,p.face,300,.73,p.hurt);else if(p.z>0)spriteFrame(ctx,guanyu.airHit,6,p.attack>0?2:1,p.x-g.camera,p.y,p.z,p.face,300,.71,0);else if(p.attack>0)spriteFrame(ctx,guanyu.combo,6,comboFrame,p.x-g.camera,p.y,p.z,p.face,300,.72,p.hurt);else if(moving)spriteFrame(ctx,guanyu.walk,4,Math.floor(tick/7)%4,p.x-g.camera,p.y,p.z,p.face,202,.91,p.hurt);else spriteFrame(ctx,guanyu.idle,1,0,p.x-g.camera,p.y,p.z,p.face,194,.91,p.hurt)}else if(p.fighter===1){if(p.attack>0)spriteFrame(ctx,zhangfei.combo,6,comboFrame,p.x-g.camera,p.y,p.z,p.face,300,.72,p.hurt);else if(moving)spriteFrame(ctx,zhangfei.walk,4,Math.floor(tick/8)%4,p.x-g.camera,p.y,p.z,p.face,210,.91,p.hurt);else spriteFrame(ctx,zhangfei.idle,1,0,p.x-g.camera,p.y,p.z,p.face,200,.9,p.hurt)}else if(p.fighter===2){if(p.attack>0)spriteGridFrame(ctx,zhaoyun.combo,3,2,comboFrame,p.x-g.camera,p.y,p.z,p.face,210,.9,p.hurt);else if(moving)spriteFrame(ctx,zhaoyun.walk,4,Math.floor(tick/6)%4,p.x-g.camera,p.y,p.z,p.face,202,.91,p.hurt);else spriteFrame(ctx,zhaoyun.idle,1,0,p.x-g.camera,p.y,p.z,p.face,194,.91,p.hurt)}else body(ctx,p.x-g.camera,p.y,p.z,p.face,fighter.main,fighter.accent,p.attack>0?p.combo:tick,false,0,p.hurt)}else{const e=item[2]!;body(ctx,e.x-g.camera,e.y,0,p.x>e.x?1:-1,e.kind===0?"#9b3330":e.kind===1?"#3c6295":"#78609b",e.kind===2?"#d5a632":"#d8d4c1",e.hit>0?2:tick,true,e.kind,e.hit);ctx.fillStyle="#160c0d";ctx.fillRect(e.x-g.camera-31,e.y-168,62,7);ctx.fillStyle="#db463c";ctx.fillRect(e.x-g.camera-29,e.y-166,58*(e.hp/e.maxHp),3)}}
      for(const q of g.particles){ctx.globalAlpha=Math.min(1,q.life/8);ctx.fillStyle=q.color;ctx.fillRect(q.x-g.camera,q.y,5,5)}ctx.globalAlpha=1;ctx.restore();
      if(++uiClock>8){uiClock=0;const living=g.enemies.filter(e=>!e.dead);setUi({status:g.status,hp:Math.max(0,p.hp),maxHp:p.maxHp,fighter:p.fighter,score:g.score,wave:g.wave,time:Math.ceil(g.time),enemies:living.length,special:p.special,advance:living.length>0&&Math.min(...living.map(e=>e.x-p.x))>480,progress:p.x/WORLD})}
      raf.current=requestAnimationFrame(loop)};raf.current=requestAnimationFrame(loop);return()=>cancelAnimationFrame(raf.current)},[]);
  const overlay=ui.status!=="playing";
  return <main className="shell">
    <header className="brand"><div><span className="seal">龍</span><h1>龍焰戰紀</h1><p>DYNASTY OF EMBERS</p></div><span className="stage">第一章 · 虎牢夜戰</span></header>
    <section className="cabinet" aria-label="龍焰戰紀遊戲畫面">
      <canvas ref={canvas} width={W} height={H}/>
      <div className="hud"><div className="portrait">{FIGHTERS[ui.fighter].glyph}</div><div className="player-info"><b>{FIGHTERS[ui.fighter].name}</b><div className="hp"><i style={{width:`${ui.hp/ui.maxHp*100}%`}}/></div><small>武將技 <span className={ui.special<=0?"ready":""}>{ui.special<=0?"READY":"CHARGING"}</span></small></div><div className="center-hud"><b>{String(ui.time).padStart(2,"0")}</b><span>WAVE {ui.wave}/3 · 敵軍 {ui.enemies}</span></div><div className="score"><small>SCORE</small><b>{String(ui.score).padStart(7,"0")}</b></div></div>
      <div className="route"><i style={{width:`${ui.progress*100}%`}}/><span>虎牢關</span></div>
      {ui.advance&&ui.status==="playing"&&<div className="advance">GO <b>→</b></div>}
      {ui.status==="ready"?<div className="select"><span>SELECT WARRIOR</span><h2>選擇武將</h2><div>{FIGHTERS.map((f,i)=><button key={f.name} onClick={()=>startFighter(i)} style={{"--fighter":f.main} as React.CSSProperties}><b>{f.glyph}</b><strong>{f.name}</strong><small>{f.role}</small><i>體 {f.hp} · 速 {Math.round(f.speed*10)}</i></button>)}</div></div>:overlay&&<button className="overlay" onClick={()=>press("enter")}><span className="crest">火</span><strong>{ui.status==="won"?"關隘已破":"烈士再起"}</strong><em>{ui.status==="paused"?"暫停中":ui.status==="won"?`總分 ${ui.score}`:"再戰一回"}</em><i>{ui.status==="paused"?"點擊繼續":"點擊再戰"}</i></button>}
      <div className="scanlines"/>
      <div className="mobile-controls"><div className="dpad"><button onPointerDown={()=>press("w")} onPointerUp={()=>release("w")}>▲</button><button onPointerDown={()=>press("a")} onPointerUp={()=>release("a")}>◀</button><button onPointerDown={()=>press("s")} onPointerUp={()=>release("s")}>▼</button><button onPointerDown={()=>press("d")} onPointerUp={()=>release("d")}>▶</button></div><div className="actions"><button className="jump" onPointerDown={()=>press("k")}>躍</button><button className="skill" onPointerDown={()=>press("l")}>技</button><button className="attack" onPointerDown={()=>press("j")}>斬</button></div></div>
    </section>
    <footer><div><kbd>WASD</kbd><span>移動</span><kbd>J</kbd><span>連斬</span><kbd>K</kbd><span>跳躍</span><kbd>L</kbd><span>武將技</span><kbd>P</kbd><span>暫停</span></div><p>戰鬥技術測試 · 非成品畫面</p></footer>
  </main>
}
