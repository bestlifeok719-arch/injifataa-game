"use strict";
/* Injifataa Game - Stage 4: Football (3-a-side match) + Horse racing */
(function(W){
const D=W.document,G=W.Game,U0=W.IJ.ui,btn=U0.btn,bar=U0.bar,canvas=U0.canvas,rr=U0.rr;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),hyp=Math.hypot;
const mkdiv=(root,css)=>{const d=D.createElement("div");d.style.cssText=css;root.appendChild(d);return d};

/* ================= FOOTBALL ================= */
let cleanF=null;
G.register({id:"football",
 title:{en:"Football",om:"Kubbaa Miilaa",am:"እግር ኳስ",ar:"كرة القدم"},
 howto:{en:"3-a-side match, 90 seconds. Drag the stick to run (you control the player nearest the ball). ⚽ SHOOT aims where you steer, ↗ PASS sends it to your teammate. Score more goals than the opponent!",
  om:"Taphni 3 vs 3, sekondii 90. Ejjeta harkaan harkisuun fiigi (taphataa kubbaatti dhiyaatu ati to'atta). ⚽ SHOOT gara ati qajeelchitu rukuta, ↗ PASS hiriyyaa kee kenna. Goolii morkataa caalaa galchi!",
  am:"3 ለ 3 ጨዋታ፣ 90 ሰከንድ። ለመሮጥ ዱላውን ጎትት (ለኳሱ ቅርብ የሆነውን ተጫዋች ትቆጣጠራለህ)። ⚽ SHOOT ወደምትመራበት ይመታል፣ ↗ PASS ለቡድን ጓደኛ ያቀብላል። ከተቃዋሚ በላይ ግብ አስቆጥር!",
  ar:"مباراة 3 ضد 3، مدتها 90 ثانية. اسحب العصا للجري (تتحكم باللاعب الأقرب للكرة). ⚽ SHOOT يسدد حيث توجّه، ↗ PASS يمرر لزميلك. سجّل أهدافاً أكثر من الخصم!"},
 stop(){if(cleanF)cleanF()},
 start(api){
  if(cleanF)cleanF();
  const root=api.root,cv=canvas(root),x=cv.getContext("2d"),Wd=cv.width,Hd=cv.height;
  const fx=10,fy=46,fw=Wd-20,fh=Hd-fy-150,cx=fx+fw/2,gw=fw*.34,R=14,sp=fw*.4;
  const mk=(a,b)=>({x:a,y:b,vx:0,vy:0,cd:0});
  const U=[mk(0,0),mk(0,0)],A=[mk(0,0),mk(0,0)],KU={x:cx},KA={x:cx},ball={x:0,y:0,vx:0,vy:0};
  const S={u:0,a:0,time:90,sd:false,over:false,last:0,raf:0,freeze:1,pend:false,msg:"",jx:0,jy:0,kcd:0,keys:{}};
  const reset=()=>{[[U[0],cx,.62],[U[1],cx-fw*.25,.75],[A[0],cx,.38],[A[1],cx+fw*.25,.25]].forEach(a=>{a[0].x=a[1];a[0].y=fy+fh*a[2];a[0].vx=a[0].vy=0});
   ball.x=cx;ball.y=fy+fh/2;ball.vx=ball.vy=0;KU.x=KA.x=cx};
  reset();
  /* controls */
  const js=mkdiv(root,"position:absolute;left:14px;bottom:calc(14px + env(safe-area-inset-bottom,0px));width:120px;height:120px;border-radius:50%;background:#ffffff22;touch-action:none");
  const knob=mkdiv(js,"position:absolute;left:40px;top:40px;width:40px;height:40px;border-radius:50%;background:#F4B63D");
  const mv=e=>{const r=js.getBoundingClientRect();let dx=e.clientX-(r.left+60),dy=e.clientY-(r.top+60);const m=hyp(dx,dy);if(m>50){dx=dx/m*50;dy=dy/m*50}S.jx=dx/50;S.jy=dy/50;knob.style.transform="translate("+dx+"px,"+dy+"px)"};
  js.addEventListener("pointerdown",e=>{if(js.setPointerCapture)js.setPointerCapture(e.pointerId);mv(e)});
  js.addEventListener("pointermove",e=>{if(e.buttons||e.pressure)mv(e)});
  ["pointerup","pointercancel"].forEach(n=>js.addEventListener(n,()=>{S.jx=S.jy=0;knob.style.transform=""}));
  const bb=mkdiv(root,"position:absolute;right:12px;bottom:calc(14px + env(safe-area-inset-bottom,0px));display:flex;gap:10px");
  const kick=type=>{
   const c=ctrl();if(S.freeze>0||S.kcd>0||hyp(c.x-ball.x,c.y-ball.y)>R+10)return;
   let tx,ty,v;if(type==="shoot"){tx=clamp(cx+S.jx*gw*.45,cx-gw*.45,cx+gw*.45);ty=fy-6;v=fw*1.8}else{const o=c===U[0]?U[1]:U[0];tx=o.x;ty=o.y;v=fw*1.15}
   const d=hyp(tx-ball.x,ty-ball.y)||1;ball.vx=(tx-ball.x)/d*v;ball.vy=(ty-ball.y)/d*v;S.kcd=.3;api.sfx.hit()};
  bb.appendChild(btn(root,"↗ PASS","background:#2F6F9F;min-width:90px;height:76px",()=>kick("pass")));
  bb.appendChild(btn(root,"⚽ SHOOT","background:#E8553D;min-width:110px;height:96px",()=>kick("shoot")));
  const kd=e=>{S.keys[e.key]=1;if(e.key===" ")kick("shoot");if(e.key==="z")kick("pass")};const ku=e=>{S.keys[e.key]=0};
  D.addEventListener("keydown",kd);D.addEventListener("keyup",ku);
  api.music.start("bright");api.sfx.crowd(true);
  cleanF=()=>{S.over=true;cancelAnimationFrame(S.raf);D.removeEventListener("keydown",kd);D.removeEventListener("keyup",ku);api.music.stop();api.sfx.crowd(false);cleanF=null};
  const finish=()=>{if(S.over)return;const u=S.u,a=S.a;cleanF();if(u>a)api.win(30);else{api.rewards.add(u*3);api.lose()}};
  function ctrl(){return hyp(U[1].x-ball.x,U[1].y-ball.y)<hyp(U[0].x-ball.x,U[0].y-ball.y)?U[1]:U[0]}
  const go=(p,tx,ty,s)=>{const d=hyp(tx-p.x,ty-p.y);if(d<4){p.vx=p.vy=0;return}p.vx=(tx-p.x)/d*s;p.vy=(ty-p.y)/d*s};
  const goal=u=>{if(u)S.u++;else S.a++;S.msg="GOAL!";S.freeze=1.5;S.pend=true;api.sfx.cheer();if(S.sd)finish()};
  function update(dt){
   S.kcd=Math.max(0,S.kcd-dt);
   if(S.freeze>0){S.freeze-=dt;if(S.freeze<=0){S.msg="";if(S.pend){S.pend=false;reset()}}return}
   if(!S.sd){S.time-=dt;if(S.time<=0){if(S.u!==S.a)return finish();S.sd=true;S.time=0;S.msg="⚡"}}
   const k=S.keys,kx=(k.ArrowRight?1:0)-(k.ArrowLeft?1:0),ky=(k.ArrowDown?1:0)-(k.ArrowUp?1:0);
   if(kx||ky){S.jx=kx;S.jy=ky;S.kb=true}else if(S.kb){S.jx=S.jy=0;S.kb=false}
   const c=ctrl(),o=c===U[0]?U[1]:U[0],m=hyp(S.jx,S.jy);
   if(m>.1){c.vx=S.jx/Math.max(1,m)*sp;c.vy=S.jy/Math.max(1,m)*sp}else{c.vx=c.vy=0}
   if(hyp(c.x-ball.x,c.y-ball.y)>fw*.3&&hyp(o.x-ball.x,o.y-ball.y)<fw*.3)go(o,ball.x,ball.y,sp*.8);else go(o,clamp(ball.x+(c.x>=ball.x?-1:1)*fw*.28,fx+20,fx+fw-20),clamp(ball.y+fh*.1,fy+fh*.2,fy+fh*.85),sp*.7);
   const ch=hyp(A[1].x-ball.x,A[1].y-ball.y)<hyp(A[0].x-ball.x,A[0].y-ball.y)?A[1]:A[0],ot=ch===A[0]?A[1]:A[0],as=sp*(.9-api.ease*.6);
   if(hyp(ch.x-ball.x,ch.y-ball.y)<R+6){
    go(ch,cx+Math.sin(S.time)*gw*.4,fy+fh,as*.85);
    if(ch.y>fy+fh*.6&&Math.random()<dt*2.5){const tx=cx+(Math.random()-.5)*gw*(.9+api.ease+.2),ty=fy+fh+6,d=hyp(tx-ball.x,ty-ball.y)||1;ball.vx=(tx-ball.x)/d*fw*1.6;ball.vy=(ty-ball.y)/d*fw*1.6;api.sfx.hit()}
   }else go(ch,ball.x+ball.vx*.2,ball.y+ball.vy*.2,as);
   go(ot,clamp(ball.x+(ch.x>=ball.x?-1:1)*fw*.28,fx+20,fx+fw-20),clamp(ball.y-fh*.12,fy+fh*.15,fy+fh*.8),as*.7);
   [U[0],U[1],A[0],A[1]].forEach(p=>{p.x=clamp(p.x+p.vx*dt,fx+8,fx+fw-8);p.y=clamp(p.y+p.vy*dt,fy+8,fy+fh-8);p.cd=Math.max(0,p.cd-dt);
    const d=hyp(p.x-ball.x,p.y-ball.y);if(d<R&&p.cd<=0){const nx=(ball.x-p.x)/(d||1),ny=(ball.y-p.y)/(d||1);ball.vx=p.vx*1.3+nx*40;ball.vy=p.vy*1.3+ny*40;p.cd=.12}});
   const all=[U[0],U[1],A[0],A[1]];
   for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){const a=all[i],b=all[j];let dx=b.x-a.x,dy=b.y-a.y,d=hyp(dx,dy);if(d<26){if(d<.01){dx=1;dy=0;d=1}const q=(26-d)/2/d;a.x-=dx*q;a.y-=dy*q;b.x+=dx*q;b.y+=dy*q}}
   all.forEach(p=>{p.x=clamp(p.x,fx+8,fx+fw-8);p.y=clamp(p.y,fy+8,fy+fh-8)});
   ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;const f=Math.pow(.4,dt);ball.vx*=f;ball.vy*=f;
   if(ball.x<fx){ball.x=fx;ball.vx*=-.8}if(ball.x>fx+fw){ball.x=fx+fw;ball.vx*=-.8}
   if(ball.y<fy){if(Math.abs(ball.x-cx)<gw/2)return goal(true);ball.y=fy;ball.vy*=-.7}
   if(ball.y>fy+fh){if(Math.abs(ball.x-cx)<gw/2)return goal(false);ball.y=fy+fh;ball.vy*=-.7}
   KA.x=clamp(KA.x+clamp(ball.x-KA.x,-1,1)*fw*(.4-api.ease*.3)*dt,cx-gw/2+8,cx+gw/2-8);KU.x=clamp(KU.x+clamp(ball.x-KU.x,-1,1)*fw*.5*dt,cx-gw/2+8,cx+gw/2-8);
   if(hyp(KA.x-ball.x,fy+10-ball.y)<R+4){ball.vy=Math.abs(ball.vy)*.8+30;ball.vx=(Math.random()-.5)*fw*.8;api.sfx.hit()}
   if(hyp(KU.x-ball.x,fy+fh-10-ball.y)<R+4){ball.vy=-Math.abs(ball.vy)*.8-30;ball.vx=(Math.random()-.5)*fw*.8;api.sfx.hit()}
  }
  function draw(){
   x.fillStyle="#1F6B3A";x.fillRect(0,0,Wd,Hd);
   for(let i=0;i<8;i++){x.fillStyle=i%2?"#237A42":"#1F6B3A";x.fillRect(fx,fy+fh/8*i,fw,fh/8+1)}
   x.strokeStyle="#ffffffcc";x.lineWidth=2;x.strokeRect(fx,fy,fw,fh);x.beginPath();x.moveTo(fx,fy+fh/2);x.lineTo(fx+fw,fy+fh/2);x.stroke();x.beginPath();x.arc(cx,fy+fh/2,fw*.14,0,7);x.stroke();
   x.fillStyle="#fff";x.fillRect(cx-gw/2,fy-5,gw,5);x.fillRect(cx-gw/2,fy+fh,gw,5);
   const dot=(p,c,r)=>{x.fillStyle=c;x.beginPath();x.arc(p.x,p.y,r,0,7);x.fill()};
   dot({x:KA.x,y:fy+10},"#8F3FBF",10);dot({x:KU.x,y:fy+fh-10},"#F4B63D",10);
   A.forEach(p=>dot(p,"#2F6F9F",11));U.forEach(p=>dot(p,"#E8553D",11));
   const c=ctrl();x.strokeStyle="#F4B63D";x.lineWidth=3;x.beginPath();x.arc(c.x,c.y,16,0,7);x.stroke();
   dot(ball,"#fff",6);
   x.font="700 22px sans-serif";x.textAlign="center";x.fillStyle="#FFF4DC";
   const t=S.sd?"⚡":Math.max(0,Math.ceil(S.time))+"s";x.fillText(S.u+" - "+S.a+"   "+t,Wd/2,32);
   if(S.msg){x.font="800 40px sans-serif";x.fillStyle="#F4B63D";x.fillText(S.msg,Wd/2,fy+fh/2-40)}
  }
  function loop(ts){if(S.over)return;const dt=Math.min(.05,((ts||0)-(S.last||ts||0))/1000);S.last=ts;update(dt);if(!S.over)draw();if(!S.over)S.raf=requestAnimationFrame(loop)}
  S.raf=requestAnimationFrame(loop);
 }});

/* ================= HORSE RACING ================= */
let cleanH=null;
const HURD=[150,280,420,560,690,820,930],LEN=1000;
G.register({id:"horse",
 title:{en:"Horse racing",om:"Fardaan Gulufuu",am:"ፈረስ ግልቢያ",ar:"سباق الخيل"},
 howto:{en:"Race 1000 m against 3 riders. Hold ⏩ GALLOP to go fast, but your energy drains: let go to rest. Tap ⤴ JUMP just before each hurdle. Finish first to win!",
  om:"Meetira 1000 fardoota 3 waliin dorgomi. ⏩ GALLOP qabuun saffisaan deema, garuu humni kee dhumata: dhiisuun boqodhu. Gufuu tokko tokko dura ⤴ JUMP tuqi. Dura xumuruun injifata!",
  am:"1000 ሜትር ከ3 ፈረሰኞች ጋር ተወዳደር። ⏩ GALLOP ይዘህ በፍጥነት ሂድ፣ ግን ጉልበትህ ይቀንሳል፤ ለማረፍ ልቀቅ። ከእያንዳንዱ መሰናክል በፊት ⤴ JUMP ንካ። መጀመሪያ ጨርስ!",
  ar:"سباق 1000 متر ضد 3 فرسان. اضغط مطولاً ⏩ GALLOP للسرعة لكن طاقتك تنفد: اترك للراحة. اضغط ⤴ JUMP قبل كل حاجز. أنهِ أولاً لتفوز!"},
 stop(){if(cleanH)cleanH()},
 start(api){
  if(cleanH)cleanH();
  const root=api.root,cv=canvas(root),x=cv.getContext("2d"),Wd=cv.width,Hd=cv.height;
  const ppm=6,ly=i=>Hd*.3+i*Hd*.1;
  const cols=["#E8553D","#2F6F9F","#8F3FBF","#C9831C"];
  const H=[0,1,2,3].map(i=>({pos:0,i,sk:i?[1,1.03,1.06][i-1]:1,jump:0,hit:0,fin:-1,burst:0,nj:1}));
  const P=H[0],S={g:false,ex:false,stam:100,over:false,last:0,raf:0,order:[],t:0,msg:"",mt:0};
  const b=bar(root);
  b.appendChild(btn(root,"⏩ GALLOP","background:#C9831C;flex:2",()=>{S.g=true},()=>{S.g=false}));
  b.appendChild(btn(root,"⤴ JUMP","background:#2F6F9F;flex:1",()=>jump()));
  const jump=()=>{if(P.jump<=0){P.jump=.6;api.sfx.tap()}};
  const kd=e=>{if(e.key==="ArrowRight")S.g=true;if(e.key===" "||e.key==="ArrowUp")jump()};const ku=e=>{if(e.key==="ArrowRight")S.g=false};
  D.addEventListener("keydown",kd);D.addEventListener("keyup",ku);
  api.music.start("bright");api.sfx.crowd(true);
  cleanH=()=>{S.over=true;cancelAnimationFrame(S.raf);D.removeEventListener("keydown",kd);D.removeEventListener("keyup",ku);api.music.stop();api.sfx.crowd(false);cleanH=null};
  const finish=()=>{if(S.over)return;const place=S.order.indexOf(0)+1;cleanH();if(place===1){api.sfx.cheer();api.win(30)}else{api.rewards.add(Math.max(0,(4-place)*5));api.lose()}};
  const say=m=>{S.msg=m;S.mt=.8};
  function update(dt){
   S.t+=dt;S.mt=Math.max(0,S.mt-dt);
   if(S.stam<=0)S.ex=true;if(S.ex&&S.stam>=30)S.ex=false;const gal=S.g&&!S.ex&&S.stam>0;
   if(gal)S.stam=Math.max(0,S.stam-16*dt);else S.stam=Math.min(100,S.stam+10*dt);
   H.forEach(h=>{
    const old=h.pos;h.jump=Math.max(0,h.jump-dt);h.hit=Math.max(0,h.hit-dt);
    let v;
    if(h.i===0){v=gal?18:12}
    else{if(h.burst>0)h.burst-=dt;else{h.nj-=dt;if(h.nj<=0){h.burst=1.5+Math.random()*1.5;h.nj=1.5+Math.random()*2}}v=(h.burst>0?18.5:11.8)*h.sk*(1-api.ease*.3)}
    if(h.hit>0)v*=.5;
    h.pos+=v*dt;
    HURD.forEach(p=>{if(old<p&&h.pos>=p){
     const ok=h.i===0?h.jump>.05:Math.random()<.88-api.ease*.5;
     if(!ok){h.hit=1;if(h.i===0){say("😬");api.sfx.hit()}}else if(h.i===0)api.sfx.coin()}});
    if(h.fin<0&&h.pos>=LEN){h.fin=S.t;S.order.push(h.i)}
   });
   if(P.fin>=0)finish();
  }
  function draw(){
   x.fillStyle="#87CEEB";x.fillRect(0,0,Wd,Hd*.28);x.fillStyle="#2F7A45";x.fillRect(0,Hd*.28,Wd,Hd*.72);
   x.fillStyle="#C9A46A";x.fillRect(0,Hd*.27,Wd,Hd*.44);
   const sx=p=>Wd*.3+(p-P.pos)*ppm;
   x.fillStyle="#fff";x.fillRect(sx(LEN),Hd*.27,6,Hd*.44);
   HURD.forEach(p=>{const X=sx(p);if(X>-30&&X<Wd+30){x.fillStyle="#fff";x.fillRect(X,Hd*.3,5,Hd*.38);x.fillStyle="#E8553D";x.fillRect(X-4,Hd*.3+Hd*.19,14,6)}});
   H.forEach(h=>{
    const X=clamp(sx(h.pos),24,Wd-24),Y=ly(h.i)+Hd*.06-(h.jump>0?Math.sin(h.jump/.6*Math.PI)*34:0),ph=Math.sin(h.pos*.9)*8;
    x.fillStyle=h.hit>0?"#7a5a3a":"#8B5A2B";x.beginPath();x.ellipse(X,Y-18,26,11,0,0,7);x.fill();
    x.beginPath();x.ellipse(X+26,Y-30,10,6,.5,0,7);x.fill();
    x.strokeStyle="#5A3A1B";x.lineWidth=4;[[-14,ph],[-8,-ph],[12,ph],[18,-ph]].forEach(l=>{x.beginPath();x.moveTo(X+l[0],Y-10);x.lineTo(X+l[0]+l[1],Y+6);x.stroke()});
    x.fillStyle=cols[h.i];x.beginPath();x.arc(X,Y-36,7,0,7);x.fill();
    if(h.i===0){x.strokeStyle="#F4B63D";x.lineWidth=2;x.strokeRect(X-34,Y-48,76,60)}
   });
   x.fillStyle="#0006";x.fillRect(12,12,Wd-24,10);H.forEach(h=>{x.fillStyle=cols[h.i];x.beginPath();x.arc(12+(Wd-24)*Math.min(1,h.pos/LEN),17,6,0,7);x.fill()});
   x.fillStyle="#0007";x.fillRect(12,Hd*.78,Wd-24,12);x.fillStyle=S.ex?"#E8553D":"#F4B63D";x.fillRect(12,Hd*.78,(Wd-24)*S.stam/100,12);
   x.font="800 36px sans-serif";x.textAlign="center";x.fillStyle="#FFF4DC";if(S.mt>0)x.fillText(S.msg,Wd/2,Hd*.2);
  }
  function loop(ts){if(S.over)return;const dt=Math.min(.05,((ts||0)-(S.last||ts||0))/1000);S.last=ts;update(dt);if(!S.over)draw();if(!S.over)S.raf=requestAnimationFrame(loop)}
  S.raf=requestAnimationFrame(loop);
 }});
})(window);
