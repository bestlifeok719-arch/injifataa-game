"use strict";
/* Injifataa Game - Stage 3: Running + Boxing (fully player-controlled) */
(function(W){
const D=W.document,G=W.Game;
const btn=(root,label,css,down,up)=>{
 const b=D.createElement("button");b.textContent=label;
 b.style.cssText="border:0;border-radius:18px;font:700 22px sans-serif;color:#FFF4DC;background:#1C5148;min-width:56px;height:64px;flex:1;touch-action:none;"+(css||"");
 b.addEventListener("pointerdown",e=>{e.preventDefault();down()});
 if(up){["pointerup","pointerleave","pointercancel"].forEach(n=>b.addEventListener(n,up))}
 return b};
const bar=(root)=>{const d=D.createElement("div");d.style.cssText="position:absolute;left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom,0px));display:flex;gap:8px";root.appendChild(d);return d};
const canvas=root=>{const c=D.createElement("canvas");c.style.cssText="width:100%;height:100%;display:block;touch-action:none";root.appendChild(c);
 const r=root.getBoundingClientRect();c.width=Math.max(300,r.width|0);c.height=Math.max(400,r.height|0);return c};
const rr=(x,c,a,b,w,h,r,f)=>{x.fillStyle=f;x.beginPath();x.roundRect?x.roundRect(a,b,w,h,r):x.rect(a,b,w,h);x.fill()};

/* ================= RUNNING ================= */
let cleanR=null;
G.register({id:"running",
 title:{en:"Running",om:"Fiigicha",am:"ሩጫ",ar:"الجري"},
 howto:{en:"Run 600 m. ◀ ▶ change lane, ⬆ jump over low hurdles, ⬇ slide under high bars. Crates: change lane. You have hearts. Collect coins!",
  om:"Meetira 600 fiigi. ◀ ▶ karaa jijjiiruuf, ⬆ gufuu gadi aanaa utaaluuf, ⬇ gufuu ol aanaa jalaa darbuuf. Waan guddaa irraa karaa jijjiiri. Onnee qabda. Coins walitti qabi!",
  am:"600 ሜትር ሩጥ። ◀ ▶ መስመር ለመቀየር፣ ⬆ ዝቅተኛ እንቅፋት ለመዝለል፣ ⬇ ከፍተኛ እንቅፋት ስር ለመንሸራተት። ሳጥን ሲመጣ መስመር ቀይር። ልቦች አሉህ። ሳንቲም ሰብስብ!",
  ar:"اركض 600 متر. ◀ ▶ لتغيير المسار، ⬆ للقفز فوق الحواجز المنخفضة، ⬇ للانزلاق تحت الحواجز العالية. الصناديق: غيّر المسار. لديك قلوب. اجمع العملات!"},
 stop(){if(cleanR)cleanR()},
 start(api){
  if(cleanR)cleanR();
  const root=api.root,cv=canvas(root),x=cv.getContext("2d"),W0=cv.width,H0=cv.height;
  const hy=H0*.25,by=H0*.8;
  const px=(l,p)=>W0/2+(l-1)*W0*(.07+.24*p), py=p=>hy+(by-hy)*p*p, sz=p=>W0*(.05+.17*p);
  const S={lane:1,lx:1,jump:0,slide:0,lives:api.ease>=.3?4:3,dist:0,coins:0,inv:0,next:1,obs:[],stripe:0,shake:0,over:false,last:0,raf:0};
  const act={
   left(){S.lane=Math.max(0,S.lane-1);api.sfx.whoosh()},right(){S.lane=Math.min(2,S.lane+1);api.sfx.whoosh()},
   up(){if(S.jump<=0&&S.slide<=0){S.jump=.7;api.sfx.tap()}},down(){if(S.jump<=0&&S.slide<=0){S.slide=.7;api.sfx.tap()}}};
  const b=bar(root);
  [["◀","left"],["⬆","up"],["⬇","down"],["▶","right"]].forEach(a=>b.appendChild(btn(root,a[0],"",act[a[1]])));
  const kd=e=>{const m={ArrowLeft:"left",ArrowRight:"right",ArrowUp:"up",ArrowDown:"down"}[e.key];if(m)act[m]()};
  D.addEventListener("keydown",kd);
  let sx=0,sy=0;
  cv.addEventListener("pointerdown",e=>{sx=e.clientX;sy=e.clientY});
  cv.addEventListener("pointerup",e=>{const dx=e.clientX-sx,dy=e.clientY-sy;
   if(Math.abs(dx)>30&&Math.abs(dx)>Math.abs(dy))act[dx<0?"left":"right"]();else if(dy<-30)act.up();else if(dy>30)act.down()});
  api.music.start("drive");api.sfx.crowd(true);
  cleanR=()=>{S.over=true;cancelAnimationFrame(S.raf);D.removeEventListener("keydown",kd);api.music.stop();api.sfx.crowd(false);cleanR=null};
  const spawn=()=>{const lane=Math.floor(Math.random()*3),r=Math.random();
   if(r<.2){for(let i=0;i<3;i++)S.obs.push({k:"coin",lane,p:-i*.09})}
   else S.obs.push({k:r<.5?"low":r<.8?"high":"block",lane,p:0})};
  const finish=won=>{if(S.over)return;const c=S.coins;cleanR();if(won)api.win(20+c*2);else{api.rewards.add(c);api.lose()}};
  const resolve=o=>{
   if(o.lane!==Math.round(S.lx))return;
   if(o.k==="coin"){S.coins++;api.sfx.coin();return}
   if((o.k==="low"&&S.jump>.1)||(o.k==="high"&&S.slide>.1))return;
   if(S.inv>0)return;
   S.lives--;S.inv=1.3;S.shake=.3;api.sfx.hit();if(S.lives<=0)finish(false)};
  function update(dt){
   S.dist+=(8+S.dist/80)*dt;S.jump=Math.max(0,S.jump-dt);S.slide=Math.max(0,S.slide-dt);S.inv=Math.max(0,S.inv-dt);S.shake=Math.max(0,S.shake-dt);
   S.lx+=(S.lane-S.lx)*Math.min(1,dt*14);
   const v=(.34+S.dist/600*.22)*(1-api.ease*.8);S.stripe=(S.stripe+v*dt)%1;
   S.next-=dt;if(S.next<=0){spawn();S.next=Math.max(.75,1.25-S.dist/600*.5)+api.ease*.3}
   S.obs.forEach(o=>{o.p+=v*dt;if(!o.done&&o.p>=.9){o.done=1;resolve(o)}});
   S.obs=S.obs.filter(o=>o.p<1.15);
   if(S.dist>=600)finish(true);
  }
  function draw(){
   x.save();if(S.shake>0)x.translate((Math.random()-.5)*10,(Math.random()-.5)*10);
   const g=x.createLinearGradient(0,0,0,hy);g.addColorStop(0,"#1B6F8C");g.addColorStop(1,"#F4B63D");x.fillStyle=g;x.fillRect(0,0,W0,hy);
   x.fillStyle="#2F7A45";x.fillRect(0,hy,W0,H0-hy);
   x.fillStyle="#4B4B55";x.beginPath();x.moveTo(px(0,0)-W0*.07,hy);x.lineTo(px(2,0)+W0*.07,hy);x.lineTo(px(2,1.1)+W0*.15,py(1.1));x.lineTo(px(0,1.1)-W0*.15,py(1.1));x.fill();
   x.strokeStyle="#FFF4DC";x.lineWidth=3;
   for(let i=0;i<8;i++){const p=(i+S.stripe)/8,q=p+.05;[.5,1.5].forEach(l=>{x.beginPath();x.moveTo(px(l,p),py(p));x.lineTo(px(l,q),py(q));x.stroke()})}
   S.obs.filter(o=>o.p>=0).sort((a,b)=>a.p-b.p).forEach(o=>{
    const X=px(o.lane,o.p),Y=py(o.p),s=sz(o.p);
    if(o.k==="coin"){x.fillStyle="#F4B63D";x.beginPath();x.arc(X,Y-s*.4,s*.3,0,7);x.fill()}
    else if(o.k==="block"){rr(x,0,X-s*.55,Y-s*1.1,s*1.1,s*1.1,4,"#8B5A2B");x.strokeStyle="#5A3A1B";x.strokeRect(X-s*.55,Y-s*1.1,s*1.1,s*1.1)}
    else if(o.k==="low"){rr(x,0,X-s*.8,Y-s*.4,s*.12,s*.4,2,"#fff");rr(x,0,X+s*.68,Y-s*.4,s*.12,s*.4,2,"#fff");rr(x,0,X-s*.8,Y-s*.4,s*1.6,s*.2,3,"#F4B63D")}
    else{rr(x,0,X-s*.8,Y-s*1.6,s*.12,s*1.6,2,"#fff");rr(x,0,X+s*.68,Y-s*1.6,s*.12,s*1.6,2,"#fff");rr(x,0,X-s*.8,Y-s*1.6,s*1.6,s*.3,3,"#E8553D")}
   });
   const X=px(S.lx,.9),Y=py(.9),s=sz(.9),up=S.jump>0?Math.sin(S.jump/.7*Math.PI)*s*1.1:0,sl=S.slide>0;
   if(!(S.inv>0&&Math.floor(S.inv*10)%2)){
    rr(x,0,X-s*.3,Y-up-(sl?s*.55:s*1.1),s*.6,sl?s*.5:s*.85,8,"#E8553D");
    x.fillStyle="#F2C9A0";x.beginPath();x.arc(X,Y-up-(sl?s*.6:s*1.25),s*.22,0,7);x.fill()}
   x.restore();
   x.font="700 22px sans-serif";x.fillStyle="#FFF4DC";x.textAlign="left";x.fillText("❤".repeat(S.lives),12,32);
   x.textAlign="right";x.fillText("🪙 "+S.coins,W0-12,32);
   x.fillStyle="#0006";x.fillRect(12,44,W0-24,8);x.fillStyle="#F4B63D";x.fillRect(12,44,(W0-24)*Math.min(1,S.dist/600),8);
  }
  function loop(ts){if(S.over)return;const dt=Math.min(.05,((ts||0)-(S.last||ts||0))/1000);S.last=ts;update(dt);if(!S.over)draw();if(!S.over)S.raf=requestAnimationFrame(loop)}
  S.raf=requestAnimationFrame(loop);
 }});

/* ================= BOXING ================= */
let cleanB=null;
G.register({id:"boxing",
 title:{en:"Boxing",om:"Boksii",am:"ቦክስ",ar:"الملاكمة"},
 howto:{en:"When the opponent winds up, a big arrow shows where to dodge: ◀ or ▶. If you see 🛡, hold Block. Counter-punch 👊 / 💥 when he is open. Empty his health bar!",
  om:"Morkataan yeroo rukutuuf qophaa'u xiyyeeffannoon guddaan gara ati jalaa miliquu qabdu agarsiisa: ◀ ykn ▶. 🛡 yoo argite Block qabi. Yeroo isaan banaa ta'e 👊 / 💥 rukuti. Health isaa duwwaa godhi!",
  am:"ተቃዋሚው ሲዘጋጅ ትልቅ ቀስት የት መሸሽ እንዳለብህ ያሳያል፡ ◀ ወይም ▶። 🛡 ካየህ Block ያዝ። ክፍት ሲሆን 👊 / 💥 ምታ። ጤናውን አጥፋ!",
  ar:"عندما يستعد الخصم يظهر سهم كبير يبيّن أين تتفادى: ◀ أو ▶. إذا رأيت 🛡 اضغط Block. اضرب 👊 / 💥 عندما يكون مكشوفاً. أفرغ شريط صحته!"},
 stop(){if(cleanB)cleanB()},
 start(api){
  if(cleanB)cleanB();
  const root=api.root,cv=canvas(root),x=cv.getContext("2d"),W0=cv.width,H0=cv.height;
  const P={hp:100,st:100,dodge:0,dir:0,cd:0,block:false,pc:0,swing:0},O={hp:100,state:"idle",t:1,dir:"L",flash:0},S={over:false,last:0,raf:0,shake:0,msg:"",mt:0};
  const say=(m)=>{S.msg=m;S.mt=.8};
  const dodge=d=>{if(P.cd<=0){P.dodge=.4;P.dir=d;P.cd=.55;api.sfx.whoosh()}};
  const punch=hook=>{const cost=hook?35:15;if(P.pc>0||P.st<cost)return;P.st-=cost;P.pc=hook?.7:.25;P.swing=.2;api.sfx.tap();
   const open=O.state==="recover"?1:O.state==="idle"?.4:.15;const d=(hook?12:5)*open;O.hp=Math.max(0,O.hp-d);O.flash=.15;
   if(open>=.5)api.sfx.hit();if(open<.3)say("🛡");if(O.hp<=0)finish(true)};
  const b=bar(root);
  b.appendChild(btn(root,"◀","",()=>dodge(-1)));b.appendChild(btn(root,"▶","",()=>dodge(1)));
  b.appendChild(btn(root,"🛡","background:#2F6F9F",()=>{P.block=true},()=>{P.block=false}));
  b.appendChild(btn(root,"👊","background:#C9831C",()=>punch(false)));b.appendChild(btn(root,"💥","background:#B8402F",()=>punch(true)));
  const kd=e=>{const k=e.key;if(k==="ArrowLeft")dodge(-1);else if(k==="ArrowRight")dodge(1);else if(k==="a")punch(false);else if(k==="s")punch(true);else if(k==="b")P.block=true};
  const ku=e=>{if(e.key==="b")P.block=false};
  D.addEventListener("keydown",kd);D.addEventListener("keyup",ku);
  api.music.start("drive");api.sfx.crowd(true);
  cleanB=()=>{S.over=true;cancelAnimationFrame(S.raf);D.removeEventListener("keydown",kd);D.removeEventListener("keyup",ku);api.music.stop();api.sfx.crowd(false);cleanB=null};
  const finish=won=>{if(S.over)return;cleanB();if(won){api.sfx.cheer();api.win(25)}else api.lose()};
  const strike=()=>{
   const dodged=(O.dir==="L"&&P.dodge>0&&P.dir===1)||(O.dir==="R"&&P.dodge>0&&P.dir===-1);
   if(dodged){say("✔");api.sfx.coin();return}
   const dmg=16*(1-api.ease);
   if(P.block){P.hp-=dmg*.25;P.st=Math.max(0,P.st-10);say("🛡");api.sfx.tap()}
   else{P.hp-=dmg;S.shake=.3;api.sfx.hit()}
   if(P.hp<=0)finish(false);
  };
  function update(dt){
   P.st=Math.min(100,P.st+22*dt);P.dodge=Math.max(0,P.dodge-dt);P.cd=Math.max(0,P.cd-dt);P.pc=Math.max(0,P.pc-dt);P.swing=Math.max(0,P.swing-dt);
   O.flash=Math.max(0,O.flash-dt);S.shake=Math.max(0,S.shake-dt);S.mt=Math.max(0,S.mt-dt);
   const hurt=1-O.hp/100;O.t-=dt;
   if(O.t<=0){
    if(O.state==="idle"){O.state="windup";const r=Math.random();O.dir=r<.35?"L":r<.7?"R":"H";O.t=Math.max(.55,.8+api.ease*.6-hurt*.2);api.sfx.whoosh()}
    else if(O.state==="windup"){strike();O.state="recover";O.t=.9}
    else{O.state="idle";O.t=Math.max(.4,.9-hurt*.3)+api.ease*.5+Math.random()*.4}
   }
  }
  function draw(){
   x.save();if(S.shake>0)x.translate((Math.random()-.5)*12,(Math.random()-.5)*12);
   const g=x.createLinearGradient(0,0,0,H0);g.addColorStop(0,"#1A2B3A");g.addColorStop(1,"#3A2A4A");x.fillStyle=g;x.fillRect(0,0,W0,H0);
   x.fillStyle="#6B3B2B";x.fillRect(0,H0*.62,W0,H0*.38);x.strokeStyle="#E8553D";x.lineWidth=5;
   [.2,.3,.4].forEach(f=>{x.beginPath();x.moveTo(0,H0*f);x.lineTo(W0,H0*f);x.stroke()});
   const cx=W0/2+(O.state==="windup"?Math.sin(Date.now()/60)*3:0),by=H0*.58,u=W0*.1,w=O.state==="windup";
   rr(x,0,cx-u*1.2,by-u*3,u*2.4,u*3,18,O.flash>0?"#fff":"#3A8F6A");
   x.fillStyle="#C98F5F";x.beginPath();x.arc(cx,by-u*3.4,u*.9,0,7);x.fill();
   const raise=d=>w&&(O.dir===d||O.dir==="H");
   [["L",-1],["R",1]].forEach(a=>{x.fillStyle=raise(a[0])?"#E8553D":"#B8402F";x.beginPath();x.arc(cx+a[1]*u*1.8,by-(raise(a[0])?u*3.2:u*1.4),u*.65,0,7);x.fill()});
   if(w){x.font="800 "+u*1.8+"px sans-serif";x.textAlign="center";x.fillStyle="#6BE3FF";x.fillText(O.dir==="L"?"▶":O.dir==="R"?"◀":"🛡",W0/2,H0*.2)}
   const px=W0/2+(P.dodge>0?P.dir*W0*.18:0);
   x.fillStyle=P.block?"#2F6F9F":"#E8553D";x.beginPath();x.arc(px-u*1.1,H0*.84-(P.swing>0?u*1.4:0),u*.6,0,7);x.arc(px+u*1.1,H0*.84-(P.swing>0?u*1.4:0),u*.6,0,7);x.fill();
   x.restore();
   const hb=(y,v,c)=>{x.fillStyle="#0007";x.fillRect(12,y,W0-24,12);x.fillStyle=c;x.fillRect(12,y,(W0-24)*Math.max(0,v)/100,12)};
   hb(12,O.hp,"#E8553D");hb(H0*.7,P.hp,"#6BE36B");hb(H0*.7+16,P.st,"#F4B63D");
   x.font="700 18px sans-serif";x.textAlign="center";x.fillStyle="#FFF4DC";if(S.mt>0)x.fillText(S.msg,W0/2,H0*.45);
  }
  function loop(ts){if(S.over)return;const dt=Math.min(.05,((ts||0)-(S.last||ts||0))/1000);S.last=ts;update(dt);if(!S.over)draw();if(!S.over)S.raf=requestAnimationFrame(loop)}
  S.raf=requestAnimationFrame(loop);
 }});
W.IJ.ui={btn,bar,canvas,rr};
})(window);
