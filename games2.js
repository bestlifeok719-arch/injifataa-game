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
function horseGame(api){
 const root=api.root;root.innerHTML="";
 const CW=360,CH=640,dpr=Math.min(2,W.devicePixelRatio||1);
 const TXT={
en:{title:"Horse racing",how:"Race 4 riders. Swipe left/right to change lane, tap to jump. Red arrows: obstacles to avoid. Green arrows: things to collect. Ride behind rivals to charge 🔥, then tap 🔥 to sprint!",start:"Start",lvl:"Level",slow:"Slow",mid:"Medium",fast:"Fast",jump:"Jump",go2:"Go!",win1:"🏆 Winner!",place:"Place",up:"Uphill",dn:"Downhill",slip:"💨 In their draft!",th:["Plains","Lake","Forest","Mountains"]},
om:{title:"Fardaan Gulufuu",how:"Fardeen dorgomtootaa 4 waliin dorgomi. Gara bitaa/mirgaatti harkisi: daandii jijjiiri. Tuqi: utaali. Xiyyaa diimaa: waan irraa goruu qabdu. Xiyyaa magariisa: waan fudhatu. Duuba dorgomtootaa fiiguun 🔥 guuti, achiin booda 🔥 tuqi!",start:"Jalqabi",lvl:"Sadarkaa",slow:"Suuta",mid:"Gidduu",fast:"Saffisaan",jump:"Utaali",go2:"Jalqabi!",win1:"🏆 Injifattee!",place:"Sadarkaa",up:"Godda",dn:"Gadi",slip:"💨 Duuba isaanii!",th:["Gammoojjii","Laga","Bosona","Tulluu"]},
am:{title:"ፈረስ ግልቢያ",how:"ከ4 ፈረሰኞች ጋር ተወዳደር። ወደ ግራ/ቀኝ ጎትት፦ መስመር ቀይር። ንካ፦ ዝለል። ቀይ ቀስት፦ ማምለጥ ያለብህ። አረንጓዴ ቀስት፦ ሰብስብ። ከተወዳዳሪዎች ኋላ ሩጥ 🔥 ሙላ፣ ከዚያ 🔥 ንካ!",start:"ጀምር",lvl:"ደረጃ",slow:"ቀስ",mid:"መካከለኛ",fast:"ፈጣን",jump:"ዝለል",go2:"ጀምር!",win1:"🏆 አሸነፍክ!",place:"ደረጃ",up:"ዳገት",dn:"ቁልቁለት",slip:"💨 ከኋላቸው!",th:["ሜዳ","ሐይቅ","ጫካ","ተራራ"]},
ar:{title:"سباق الخيل",how:"تسابق مع 4 فرسان. اسحب يسارًا/يمينًا لتغيير المسار، اضغط للقفز. السهم الأحمر: عائق يجب تجنبه. السهم الأخضر: شيء يُجمع. اركض خلف المنافسين لتعبئة 🔥 ثم اضغط 🔥 للانطلاق!",start:"ابدأ",lvl:"المستوى",slow:"بطيء",mid:"متوسط",fast:"سريع",jump:"اقفز",go2:"انطلق!",win1:"🏆 فزت!",place:"المركز",up:"صعود",dn:"هبوط",slip:"💨 خلفهم!",th:["سهل","بحيرة","غابة","جبل"]}};
 const tx=TXT[api.lang()]||TXT.en;
 let raf=0,alive=true;
 const wrap=mkdiv(root,"position:absolute;left:0;top:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:6px;box-sizing:border-box;gap:6px");
 const cvw=mkdiv(wrap,"position:relative;line-height:0");
 const cv=D.createElement("canvas");cv.width=CW*dpr;cv.height=CH*dpr;cv.style.cssText="display:block;border-radius:14px;touch-action:none;background:#7FB8E6";cvw.appendChild(cv);
 const cx=cv.getContext("2d");if(!cx.roundRect)cx.roundRect=function(x,y,w,h){this.rect(x,y,w,h)};
 const row=mkdiv(wrap,"display:flex;gap:6px");
 const mk=(t,css,fn)=>{const b=D.createElement("button");b.textContent=t;b.style.cssText="flex:1;height:52px;border:0;border-radius:14px;font:700 17px sans-serif;background:#3A5A52;color:#FFF4DC;padding:0;white-space:nowrap;cursor:pointer;"+css;b.onclick=fn;row.appendChild(b);return b};
 const bl=mk("◀","",()=>lane(-1)),bs=mk("","font-size:14px",()=>{SP=(SP+1)%3;lab();chips()}),bj=mk("⤴ "+tx.jump,"background:#F4B63D;color:#2A1B00;flex:1.6",()=>jump()),br=mk("▶","",()=>lane(1));
 const SPN=[tx.slow,tx.mid,tx.fast];
 function fit(){const aw=root.clientWidth-12,ah=root.clientHeight-12-58,s=Math.max(.3,Math.min(aw/CW,ah/CH));cv.style.width=CW*s+"px";cv.style.height=CH*s+"px";row.style.width=CW*s+"px"}
 W.addEventListener("resize",fit);fit();setTimeout(fit,60);
 const ov=mkdiv(cvw,"position:absolute;left:0;top:0;right:0;bottom:0;border-radius:14px;background:rgba(10,30,26,.84);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:22px;text-align:center;line-height:1.4;color:#FFF4DC;font-family:sans-serif");
 const h2=D.createElement("h2");h2.style.cssText="margin:0;color:#F4B63D;font-size:26px";h2.textContent=tx.title;
 const pp=D.createElement("p");pp.style.cssText="margin:0;font-size:15px";pp.textContent=tx.how;
 const spd=mkdiv(ov,"display:flex;gap:8px");
 const goB=D.createElement("button");goB.textContent=tx.start;goB.style.cssText="border:0;border-radius:16px;padding:14px 34px;font:700 18px sans-serif;background:#F4B63D;color:#2A1B00;cursor:pointer";
 ov.insertBefore(h2,spd);ov.insertBefore(pp,spd);ov.appendChild(goB);
const HY=210,GY=565,LW=72,PS=.62,G=1500,NL=5,SM=[.7,1,1.5],CM=[1,1,2];let SP=1;
const TH=[{n:"Gammoojjii",s:["#7FB8E6","#F6E2B8"],g:["#6FA84A","#8CC15E"],t:"#B9A06A",h:"#8FB59A",b:"#4F8B35"},
{n:"Laga",s:["#86C3E8","#E6F1F4"],g:["#5F9E6A","#7DBB86"],t:"#C4B78C",h:"#7FA7B5",b:"#3E7D4F"},
{n:"Bosona",s:["#6C9A7B","#D6E6B0"],g:["#2E6A31","#478A45"],t:"#8E7A52",h:"#2F5E3E",b:"#1F4E2B"},
{n:"Tulluu",s:["#9DB4D8","#EEE4D2"],g:["#9C8F60","#B5A878"],t:"#C9BC96",h:"#7C8796",b:"#7C7350"}];
const PAL={me:{b:"#84431F",h:"#B96A3C",s:"#4A2210",l:"#6B3519",m:"#1A110C",g:"#B83224",j:"#F4B63D",hm:"#1F8A4C",sk:"#6B4226"},
r1:{b:"#6A6A72",h:"#9A9AA2",s:"#34343A",l:"#505058",m:"#1E1E22",g:"#2F6DB5",j:"#2F6DB5",hm:"#1B3A66",sk:"#E0B48A"},
r2:{b:"#C9A06A",h:"#E3C493",s:"#8A6A3C",l:"#A98050",m:"#F2E6CF",g:"#2F9E6B",j:"#2F9E6B",hm:"#E8E4DC",sk:"#8A5A36"},
r3:{b:"#2B2B30",h:"#52525A",s:"#141418",l:"#1E1E22",m:"#0E0E10",g:"#C79A2B",j:"#C0392B",hm:"#161616",sk:"#4A2E1B"},
r4:{b:"#E8E4DC",h:"#FFFFFF",s:"#A8A29A",l:"#CFC9BF",m:"#8A8478",g:"#7A3FB5",j:"#7A3FB5",hm:"#F4B63D",sk:"#F0CBA0"}};
const T2=(f,d,ty,v,sl,at)=>api.sfx.tone(f,d,ty,v,sl,at);
const SFX={jump(){T2(280,.3,"sine",.18,760)},land(){T2(150,.15,"sine",.22,50)},lane(){T2(900,.08,"triangle",.07,500)},coin(){api.sfx.coin()},boost(){T2(200,.45,"sawtooth",.09,1500)},hit(){api.sfx.hit()},bump(){T2(160,.14,"triangle",.2,90)},pick(){[523,659,784].forEach((f,i)=>T2(f,.12,"triangle",.14,0,i*.07))},star(){[660,880,1100,1320].forEach((f,i)=>T2(f,.14,"sine",.14,0,i*.06))},win(){api.sfx.win()},lose(){api.sfx.lose()},step(){T2(120,.1,"sine",.3,55)}};
const K=dz=>1/(1+Math.max(dz,-150)/260),E=z=>100*Math.sin(z/1500)+60*Math.sin(z/620),el=dz=>S?E(S.off+Math.max(dz,-150))-E(S.off):0,proj=(l,dz)=>{const k=K(dz);return[180+(l-2)*LW*k,HY+(GY-HY)*k-el(dz)*k,k]};
function ell(x,y,rx,ry,c,a){cx.globalAlpha=a||1;cx.fillStyle=c;cx.beginPath();cx.ellipse(x,y,Math.max(0,rx),Math.max(0,ry),0,0,7);cx.fill();cx.globalAlpha=1}
function horse(x,gy,s,ph,p,air,lift,glow){
 lift=lift||0;ell(x,gy+2,74*s*(1-Math.min(.6,lift/300)),13*s*(1-Math.min(.6,lift/300)),"#000",.28*(1-Math.min(.7,lift/250)));
 cx.save();cx.translate(x+Math.sin(ph)*1.5*s,gy-lift-(air?0:Math.abs(Math.sin(ph))*3*s));const sc=s*(1+lift/650);cx.scale(sc,sc);
 if(glow){ell(0,-130,90,150,"#FFE066",.28+.12*Math.sin(ph*4))}
 const la=air?34:Math.max(0,Math.sin(ph))*18,ra=air?34:Math.max(0,-Math.sin(ph))*18;
 cx.lineCap="round";cx.strokeStyle=p.l;cx.lineWidth=22;
 [[-27,la],[27,ra]].forEach(q=>{cx.beginPath();cx.moveTo(q[0],-72);cx.lineTo(q[0],-8-q[1]);cx.stroke();ell(q[0],-7-q[1],12,7,"#161616")});
 cx.fillStyle=p.b;cx.beginPath();cx.moveTo(-21,-158);cx.lineTo(-15,-232);cx.lineTo(15,-232);cx.lineTo(21,-158);cx.fill();
 ell(10,-196,6,34,p.s,.25);cx.fillStyle=p.m;cx.fillRect(-5,-234,10,76);
 cx.strokeStyle=p.m;cx.lineWidth=3;for(let i=0;i<7;i++){cx.beginPath();cx.moveTo(-5,-230+i*10);cx.lineTo(-10,-225+i*10);cx.moveTo(5,-230+i*10);cx.lineTo(10,-225+i*10);cx.stroke()}
 ell(0,-240,16,13,p.b);cx.fillStyle=p.b;[-1,1].forEach(d=>{cx.beginPath();cx.moveTo(d*14,-246);cx.lineTo(d*13,-268);cx.lineTo(d*3,-251);cx.fill()});
 ell(0,-246,6,5,p.m);
 ell(0,-150,44,29,p.b);cx.fillStyle=p.g;cx.beginPath();cx.roundRect(-23,-164,46,25,7);cx.fill();cx.fillStyle="#E8B84A";cx.fillRect(-23,-158,46,3);
 cx.strokeStyle="#D8CBB0";cx.lineWidth=15;[-1,1].forEach(d=>{cx.beginPath();cx.moveTo(d*17,-152);cx.lineTo(d*40,-122);cx.stroke();ell(d*42,-116,8,6,"#111")});
 cx.fillStyle=p.j;cx.beginPath();cx.moveTo(-14,-152);cx.lineTo(-22,-203);cx.quadraticCurveTo(0,-214,22,-203);cx.lineTo(14,-152);cx.fill();
 cx.fillStyle="rgba(255,255,255,.35)";cx.fillRect(-2,-208,4,56);
 cx.strokeStyle=p.j;cx.lineWidth=9;[-1,1].forEach(d=>{cx.beginPath();cx.moveTo(d*21,-202);cx.lineTo(d*31,-190);cx.lineTo(d*17,-214);cx.stroke();ell(d*16,-217,4.5,4.5,p.sk)});
 ell(0,-209,6,5,p.sk);ell(0,-222,11,12,p.sk);ell(0,-227,13,10,p.hm);ell(0,-219,13.5,3,p.hm);
 ell(0,-100,58,50,p.b);ell(0,-68,50,20,p.s,.5);ell(-25,-98,30,40,p.h,.3);ell(25,-98,30,40,p.h,.3);
 cx.strokeStyle=p.s;cx.globalAlpha=.55;cx.lineWidth=2;cx.beginPath();cx.moveTo(0,-135);cx.lineTo(0,-72);cx.stroke();cx.globalAlpha=1;
 const sw=Math.sin(ph*2)*7;cx.fillStyle=p.m;cx.beginPath();cx.moveTo(-11,-132);cx.bezierCurveTo(-20,-100,-16+sw,-60,-10+sw*1.6,-24);cx.lineTo(10+sw*1.6,-24);cx.bezierCurveTo(16+sw,-60,20,-100,11,-132);cx.fill();
 cx.restore();
}
function obst(o,x,y,k,now){const s=k*.72,w=o.span||1;
 if(o.t==="stone"){ell(x,y-14*s,30*s,20*s,"#7B7B80");ell(x-8*s,y-20*s,13*s,8*s,"#9C9CA2")}
 else if(o.t==="log"){const a=48*s*w;cx.fillStyle="#6B3E1E";cx.fillRect(x-a,y-24*s,2*a,24*s);ell(x-a,y-12*s,6*s,12*s,"#C99A5E");ell(x+a,y-12*s,6*s,12*s,"#8A5A2E")}
 else if(o.t==="water"){ell(x,y-4*s,52*s*w,12*s,"#3C86C7");cx.strokeStyle="#BFE3F7";cx.lineWidth=2*s;cx.beginPath();cx.moveTo(x-24*s,y-5*s);cx.lineTo(x-6*s,y-5*s);cx.moveTo(x+6*s,y-2*s);cx.lineTo(x+22*s,y-2*s);cx.stroke()}
 else if(o.t==="fence"){const a=48*s*w;cx.fillStyle="#8A8F98";cx.fillRect(x-a,y-48*s,7*s,48*s);cx.fillRect(x+a-7*s,y-48*s,7*s,48*s);cx.fillRect(x-a,y-42*s,2*a,6*s);cx.fillRect(x-a,y-22*s,2*a,6*s)}
 else if(o.t==="pit"){ell(x,y-4*s,44*s,12*s,"#8A6A3C");ell(x,y-5*s,36*s,9*s,"#1E120A")}
 else if(o.t==="thorn"){ell(x,y-20*s,28*s,22*s,"#2F6B2F");cx.strokeStyle="#CFE8B0";cx.lineWidth=2*s;for(let i=-3;i<=3;i++){cx.beginPath();cx.moveTo(x+i*8*s,y-18*s);cx.lineTo(x+i*10*s,y-42*s+Math.abs(i)*5*s);cx.stroke()}}
 else if(o.t==="mud"){ell(x,y-3*s,50*s,11*s,"#6B4A2A");ell(x-8*s,y-5*s,22*s,5*s,"#8A6540")}
 else if(o.t==="pad"){cx.fillStyle="#38C172";cx.beginPath();cx.ellipse(x,y-4*s,36*s,10*s,0,0,7);cx.fill();cx.fillStyle="#fff";cx.beginPath();cx.moveTo(x,y-12*s);cx.lineTo(x+14*s,y-2*s);cx.lineTo(x-14*s,y-2*s);cx.fill()}
 else if(o.t==="boulder"){ell(x,y-30*s,34*s,34*s,"#6E6A64");ell(x-9*s,y-40*s,12*s,10*s,"#8F8A82");cx.strokeStyle="#4C4944";cx.lineWidth=2*s;cx.beginPath();cx.arc(x,y-30*s,24*s,o.rot||0,(o.rot||0)+1.3);cx.stroke()}
 else if(o.t==="heart"||o.t==="star"){const b=Math.sin(now/200)*3*s,yy=y-(o.t==="star"?44:26)*s+b;ell(x,yy,20*s,20*s,"#fff",.3);cx.font="bold "+Math.round(34*s)+"px system-ui";cx.textAlign="center";cx.textBaseline="middle";cx.fillStyle=o.t==="star"?"#FFC93C":"#E63946";cx.fillText(o.t==="star"?"★":"♥",x,yy);cx.textAlign="left"}
 else{const d=o.dir||1;cx.fillStyle="#2B2B2B";[-14,-5,5,14].forEach(i=>cx.fillRect(x+i*s-2*s,y-14*s,4*s,14*s));ell(x,y-28*s,26*s,18*s,"#F4F1EA");ell(x+d*24*s,y-34*s,9*s,8*s,"#3A3A3A")}}
let st="ready",S,last=0,lvPrev=0;
function reset(){S={lane:2,cl:2,jy:0,vy:0,ph:0,pp:0,off:0,dist:0,hp:5,coin:0,inv:0,slow:0,mud:0,boost:0,star:0,cd:3.4,ng:40,nit:0,slp:0,t:0,lv:0,ban:null,fx:[],obs:[],coins:[],nx:700,
 riv:[[0,150,"r1",1],[1,110,"r2",1.02],[3,70,"r3",1.01],[4,130,"r4",.99]].map((a,i)=>({l:a[0],tl:a[0],dz:a[1],p:a[2],f:a[3],c:[-30,110,250,390][i],i,pe:Math.random()*6,ph:Math.random()*6,tt:2+Math.random()*2,jy:0,vy:0}))}}reset();
function nitro(){if(st==="play"&&S.cd<=0&&S.ng>=100&&S.nit<=0){S.ng=0;S.nit=1.8;SFX.boost()}}
function jump(){if(st==="play"&&S.cd<=0&&S.jy<=.01){S.vy=620;S.jy=.01;SFX.jump()}}
function lane(d){if(st==="play"){const n=Math.max(0,Math.min(NL-1,S.lane+d));if(n!==S.lane){S.lane=n;SFX.lane()}}}
const POOL=[["stone","log","water","pad","mud"],["stone","log","water","fence","thorn","pad","mud","boulder"],["stone","log","water","fence","thorn","pit","sheep","pad","mud","boulder"]];
const HT={stone:30,log:26,water:8,fence:46,pit:8,thorn:36,mud:0,pad:0,sheep:150,boulder:150,heart:0,star:0};
function spawn(lv,off){
 const dz=1100+(off||0),q=Math.random();
 if(q<.24){const hh=Math.random()<.5?0:55,l=Math.floor(Math.random()*NL),zig=Math.random()<.5;for(let i=0;i<6;i++)S.coins.push({dz:dz+i*55,lane:zig?Math.max(0,Math.min(NL-1,l+Math.round(Math.sin(i))) ):l,h:hh,first:i===0})}
 else if(q<.3){const t=(S.hp<5&&Math.random()<.6)?"heart":"star";S.obs.push({dz,lane:Math.floor(Math.random()*NL),t,h:0,span:1})}
 else{const pl=POOL[Math.min(2,lv)],t=pl[Math.floor(Math.random()*pl.length)];let span=1;if(t==="log"||t==="water"||t==="fence")span=1+Math.floor(Math.random()*(lv>0?3:2));
  const l=Math.floor(Math.random()*(NL-span+1)),mv=t==="sheep"||t==="boulder",ln=mv?(Math.random()<.5?0:NL-1):l;
  const o={dz,lane:ln,t,h:HT[t],span,dir:mv?(ln===0?1:-1):0,vl:0,rot:0};if(mv)o.vl=(t==="sheep"?.9:1.4)*o.dir*(1+Math.min(.8,lv*.06));S.obs.push(o);
  if(lv>0&&span===1&&!mv&&t!=="pad"&&t!=="mud"&&Math.random()<Math.min(.8,.25+lv*.05))S.obs.push({dz,lane:(l+2+Math.floor(Math.random()*3))%NL,t:"stone",h:30,span:1,dir:0,vl:0})}
 S.nx=Math.max(130,400-lv*22)+Math.random()*Math.max(40,140-lv*5);if(!off&&Math.random()<Math.min(.5,lv*.04))spawn(lv,160+Math.random()*120);
}
function rank(){return 1+S.riv.filter(r=>r.dz>0).length}
function end(){finish()}
function hurt(){S.hp--;S.inv=2.2;S.slow=1.2;SFX.hit();if(S.hp<=0)end()}
const blocked=(dz,l)=>S.obs.some(o=>!["pad","mud","heart","star"].includes(o.t)&&Math.abs(o.dz-dz)<90&&l>=Math.round(o.lane)&&l<Math.round(o.lane)+(o.span||1));
function badge(x,y,k,txt,col,now){const r=8+14*k,b=Math.sin(now/130)*4*k;cx.fillStyle=col;cx.beginPath();cx.arc(x,y+b,r,0,7);cx.fill();cx.strokeStyle="#fff";cx.lineWidth=2;cx.stroke();cx.fillStyle="#fff";cx.font="bold "+(8+16*k)+"px system-ui";cx.textAlign="center";cx.textBaseline="middle";cx.fillText(txt,x,y+b+1);cx.textAlign="left"}
function arrowDown(x,y,k,now){const r=6+10*k,b=Math.sin(now/130)*4*k;cx.fillStyle="#2ECC71";cx.strokeStyle="#fff";cx.lineWidth=2;cx.beginPath();cx.moveTo(x-r,y-r+b);cx.lineTo(x+r,y-r+b);cx.lineTo(x,y+r+b);cx.closePath();cx.fill();cx.stroke()}
function hsh(n){const x=Math.sin(n*12.9898)*43758.5453;return x-Math.floor(x)}
function scen(T,th,r,x,y,s){
 const tri=(a,b,c,d,e,f,col)=>{cx.fillStyle=col;cx.beginPath();cx.moveTo(a,b);cx.lineTo(c,d);cx.lineTo(e,f);cx.fill()};
 const rock=()=>{ell(x,y-12*s,24*s,16*s,"#7B7B80");ell(x-6*s,y-16*s,10*s,7*s,"#9C9CA2")},bush=()=>{ell(x,y-10*s,22*s,15*s,T.b);ell(x-6*s,y-14*s,10*s,7*s,"#fff",.12)};
 if(th===0){if(r<.45){cx.fillStyle="#5A3A22";cx.fillRect(x-4*s,y-46*s,8*s,46*s);ell(x,y-52*s,36*s,13*s,"#4F8B35");ell(x-10*s,y-58*s,18*s,8*s,"#6FA84A",.9)}else if(r<.7)bush();else if(r<.85){cx.fillStyle="#C9A06A";cx.fillRect(x-22*s,y-28*s,44*s,28*s);tri(x-32*s,y-26*s,x+32*s,y-26*s,x,y-64*s,"#8A6A3C");cx.fillStyle="#4A2E1B";cx.fillRect(x-5*s,y-18*s,10*s,18*s)}else rock()}
 else if(th===1){if(r<.35){cx.strokeStyle="#6B4A2A";cx.lineWidth=6*s;cx.beginPath();cx.moveTo(x,y);cx.lineTo(x+8*s,y-62*s);cx.stroke();cx.strokeStyle="#2F8F4A";cx.lineWidth=4*s;for(let i=0;i<6;i++){cx.beginPath();cx.moveTo(x+8*s,y-62*s);cx.lineTo(x+8*s+Math.cos(i)*26*s,y-62*s+Math.sin(i)*14*s+8*s);cx.stroke()}}else if(r<.6){cx.strokeStyle="#6FA84A";cx.lineWidth=3*s;for(let i=-2;i<=2;i++){cx.beginPath();cx.moveTo(x+i*5*s,y);cx.lineTo(x+i*6*s,y-34*s);cx.stroke()}}else if(r<.8)ell(x,y-4*s,44*s,11*s,"#3C86C7");else rock()}
 else if(th===2){if(r<.6){cx.fillStyle="#4A2E1B";cx.fillRect(x-3*s,y-10*s,6*s,10*s);tri(x-24*s,y-8*s,x+24*s,y-8*s,x,y-44*s,"#1F5A2B");tri(x-19*s,y-30*s,x+19*s,y-30*s,x,y-62*s,"#2A7038");tri(x-13*s,y-50*s,x+13*s,y-50*s,x,y-78*s,"#348546")}else if(r<.8)bush();else rock()}
 else{if(r<.5)rock();else if(r<.8)ell(x,y-14*s,64*s,32*s,T.h);else{cx.strokeStyle="#5A4630";cx.lineWidth=5*s;cx.beginPath();cx.moveTo(x,y);cx.lineTo(x,y-50*s);cx.moveTo(x,y-30*s);cx.lineTo(x+16*s,y-48*s);cx.moveTo(x,y-38*s);cx.lineTo(x-14*s,y-54*s);cx.stroke()}}}
function frame(now){if(!alive)return;
 const dt=Math.min(.04,(now-last)/1000||0);last=now;const lv=Math.floor(S.dist/300),T=TH[lv%4];
 if(st==="play"){
  let v=0;S.t+=dt;
  if(S.cd>0){S.cd-=dt;S.ph+=dt*2;S.riv.forEach(r=>r.ph+=dt*2)}
  else{
   S.cd-=dt;S.slow=Math.max(0,S.slow-dt);S.mud=Math.max(0,S.mud-dt);S.boost=Math.max(0,S.boost-dt);S.star=Math.max(0,S.star-dt);
   const base=150+80*Math.log2(1+S.dist/250),nom=base*SM[SP],sl=(E(S.off+30)-E(S.off))/30;S.nit=Math.max(0,S.nit-dt);S.slp=S.riv.some(r=>Math.abs(r.l-S.cl)<.8&&r.dz>40&&r.dz<260)?1:0;if(S.slp)S.ng=Math.min(100,S.ng+dt*18);
   v=nom*(S.slow>0?.6:1)*(S.mud>0?.55:1)*(S.boost>0?1.4:1)*(S.nit>0?1.6:1)*(S.slp?1.1:1)*Math.max(.8,Math.min(1.2,1-sl*1.2));S.sl=sl;
   S.off+=v*dt;S.dist=S.off/30;S.ph+=dt*v*.05;
   if(Math.floor(S.ph/Math.PI)!==S.pp){S.pp=Math.floor(S.ph/Math.PI);if(S.jy<=0)SFX.step()}
   if(S.jy>0){S.vy-=G*dt;S.jy+=S.vy*dt;if(S.jy<=0){S.jy=0;S.vy=0;SFX.land();for(let i=0;i<6;i++)S.fx.push({x:180+(S.cl-2)*LW+(Math.random()-.5)*60,y:GY-4,vx:(Math.random()-.5)*80,vy:-30-Math.random()*40,t:.5})}}
   S.inv=Math.max(0,S.inv-dt);S.nx-=v*dt;if(S.nx<=0)spawn(lv);
   const ln=Math.round(S.cl),pw=S.inv<=0&&S.star<=0;
   S.obs.forEach(o=>{o.dz-=v*dt;if(o.vl){o.lane+=o.vl*dt;o.rot=(o.rot||0)+dt*5}
    if(o.hit||Math.abs(o.dz)>=34)return;const a=Math.round(o.lane),on=ln>=a&&ln<a+(o.span||1);if(!on)return;
    if(o.t==="pad"){if(S.jy<10){o.hit=1;S.boost=2;SFX.boost()}}
    else if(o.t==="mud"){if(S.jy<10){o.hit=1;S.mud=1.4}}
    else if(o.t==="heart"){if(Math.abs(S.jy-25)<55){o.hit=1;S.hp=Math.min(5,S.hp+1);SFX.pick()}}
    else if(o.t==="star"){if(Math.abs(S.jy-25)<60){o.hit=1;S.star=5;SFX.star()}}
    else if(S.jy<o.h&&pw){o.hit=1;hurt()}});
   S.riv.forEach(r=>{
    const eq=r.c+90*Math.sin(S.t*(.2+r.i*.06)+r.pe),vr=nom*Math.max(.75,Math.min(1.3,1+(eq-r.dz)/900))*r.f*(1+Math.min(.1,lv*.008))*(1-api.ease*.3);r.dz+=(vr-v)*dt;r.ph+=dt*vr*.05;
    r.tt-=dt;if(r.tt<=0){r.tt=1.5+Math.random()*2;const want=Math.random()<.3?S.lane:Math.floor(Math.random()*NL),ok=S.riv.every(o=>o===r||Math.abs(o.tl-want)>=1||Math.abs(o.dz-r.dz)>140);if(ok)r.tl=want}
    S.obs.forEach(o=>{const g=o.dz-r.dz,a=Math.round(o.lane);if(!["pad","mud","heart","star"].includes(o.t)&&g>10&&g<170&&Math.round(r.l)>=a&&Math.round(r.l)<a+(o.span||1)&&r.jy<=0){if(o.h<=46&&Math.random()<.5){r.vy=620;r.jy=.01}else{for(let d=1;d<NL;d++){const c=[Math.round(r.l)-d,Math.round(r.l)+d].find(l=>l>=0&&l<NL&&!blocked(o.dz,l));if(c!==undefined){r.tl=c;r.tt=1;break}}}}});
    if(r.jy>0){r.vy-=G*dt;r.jy+=r.vy*dt;if(r.jy<=0){r.jy=0;r.vy=0}}
    r.l+=(r.tl-r.l)*Math.min(1,dt*2.5);S.riv.forEach(o=>{if(o===r||Math.abs(o.dz-r.dz)>=90||Math.abs(o.l-r.l)>=1)return;const sd=r.l<o.l||(r.l===o.l&&r.i<o.i)?-1:1;r.l=Math.max(0,Math.min(NL-1,r.l+sd*dt*2.2));r.tl=Math.max(0,Math.min(NL-1,Math.round(r.l)+sd));if(r.dz<o.dz)r.dz-=70*dt;else r.dz+=40*dt});
    if(Math.abs(r.l-S.cl)<.7&&Math.abs(r.dz)<50&&S.inv<=.9){S.slow=.6;r.dz+=70;SFX.bump()}});
   S.coins.forEach(c=>{c.dz-=v*dt;if(!c.got&&c.lane===ln&&Math.abs(c.dz)<30&&Math.abs(S.jy-c.h)<40){c.got=1;S.coin+=CM[SP];S.ng=Math.min(100,S.ng+8);SFX.coin()}});
   S.obs=S.obs.filter(o=>o.dz>-120&&o.lane>-2&&o.lane<NL+1&&!(o.hit&&(o.t==="heart"||o.t==="star")));S.coins=S.coins.filter(c=>c.dz>-100&&!c.got);
   if(lv>S.lv){S.lv=lv;const rk=rank(),bn=[60,40,25,15,0][rk-1];S.coin+=bn;S.ban={t:2.6,a:rk===1?tx.win1:tx.place+" "+rk+"/5",b:bn?"+"+bn+" 🪙":""};rk<=3?SFX.win():SFX.lose()}
  }
  S.cl+=(S.lane-S.cl)*Math.min(1,dt*9);
  if(S.ban){S.ban.t-=dt;if(S.ban.t<=0)S.ban=null}
  S.fx.forEach(f=>{f.t-=dt;f.x+=f.vx*dt;f.y+=f.vy*dt});S.fx=S.fx.filter(f=>f.t>0);
 }
 cx.setTransform(dpr,0,0,dpr,0,0);
 let g=cx.createLinearGradient(0,0,0,HY);g.addColorStop(0,T.s[0]);g.addColorStop(1,T.s[1]);cx.fillStyle=g;cx.fillRect(0,0,CW,HY+2);
 [[T.h,.5,70,52,.004,30],[T.h,.85,40,30,.012,17]].forEach(m=>{cx.fillStyle=m[0];cx.globalAlpha=m[1];cx.beginPath();cx.moveTo(0,HY+10);for(let x=0;x<=CW;x+=6)cx.lineTo(x,HY-m[2]*.4-m[3]*Math.abs(Math.sin((x+S.off*m[4]*10)/m[5]*.5+1))-8*Math.sin((x+S.off*m[4]*10)/9));cx.lineTo(CW,HY+10);cx.fill()});cx.globalAlpha=1;
 cx.fillStyle=T.g[0];cx.fillRect(0,HY+8,CW,CH-HY);
 for(let d=9000;d>-150;){const nd=Math.max(-150,d-Math.max(60,d*.07)),ya=HY+(GY-HY)*K(d)-el(d)*K(d),yb=HY+(GY-HY)*K(nd)-el(nd)*K(nd),wa=180*K(d),wb=180*K(nd);
  if(yb>ya){const id=d<1900?Math.round((S.off+d)/120)%2:0;cx.fillStyle=id?T.g[1]:T.g[0];cx.fillRect(0,ya,CW,yb-ya+1);cx.fillStyle=T.t;cx.beginPath();cx.moveTo(180-wa,ya);cx.lineTo(180+wa,ya);cx.lineTo(180+wb,yb+1);cx.lineTo(180-wb,yb+1);cx.fill();if(id){cx.fillStyle="rgba(255,255,255,.06)";cx.fill()}}
  d=nd}
 cx.strokeStyle="rgba(255,255,255,.4)";const d0=-(S.off%90);
 for(let d=d0-90;d<1800;d+=90)[.5,1.5,2.5,3.5].forEach(l=>{const a=proj(l,Math.max(-120,d)),b=proj(l,d+40);cx.lineWidth=1+3*a[2];cx.beginPath();cx.moveTo(a[0],a[1]);cx.lineTo(b[0],b[1]);cx.stroke()});
 const it=[],th=lv%4;
 for(let zi=Math.floor((S.off-150)/140)*140;zi<S.off+1800;zi+=140)[0,1].forEach(sd=>{const r1=hsh(zi+sd*7.1),r3=hsh(zi*.7+sd*11.3),l=sd?5.4+r1*4.5:-1.4-r1*4.5,dz=zi-S.off;it.push({dz,f:()=>{const q=proj(l,dz);scen(T,th,r3,q[0],q[1],q[2]*1.25)}})});
 for(let zi=Math.floor((S.off-150)/560)*560;zi<S.off+1800;zi+=560)[0,1].forEach(sd=>{const r1=hsh(zi*2.1+sd*5.3),l=sd?8+r1*3:-4-r1*3,dz=zi-S.off;it.push({dz,f:()=>{const q=proj(l,dz),k=q[2];ell(q[0],q[1]-30*k,170*k,90*k,T.h,.9);ell(q[0]-30*k,q[1]-60*k,80*k,40*k,"#fff",.08)}})});
 const fz=9000*(S.lv+1)-S.off;if(fz>-120&&fz<1100)it.push({dz:fz,f:()=>{for(let i=0;i<10;i++){const a=proj(-.5+i*.5,fz),b=proj(i*.5,fz),c=proj(i*.5,fz+36),d=proj(-.5+i*.5,fz+36);cx.fillStyle=i%2?"#fff":"#111";cx.beginPath();cx.moveTo(a[0],a[1]);cx.lineTo(b[0],b[1]);cx.lineTo(c[0],c[1]);cx.lineTo(d[0],d[1]);cx.fill()}}});
 S.obs.forEach(o=>it.push({dz:o.dz,f:()=>{const q=proj(o.lane+((o.span||1)-1)/2,o.dz);obst(o,q[0],q[1],q[2],now);
  if(st==="play"&&S.cd<=0&&o.dz>110&&o.dz<720&&!o.hit){const a=Math.round(o.lane),sp=o.span||1,hy=q[1]-((o.h||0)*.9+34)*q[2];
   if(["pad","heart","star"].includes(o.t)){if(Math.abs(o.lane-S.lane)<2.6)arrowDown(q[0],q[1]-(o.t==="star"?70:56)*q[2],q[2],now)}
   else if(o.t!=="mud"&&S.lane>=a&&S.lane<a+sp){let txt="⬆";if(o.h>=100||blocked(o.dz,S.lane)&&o.h>60){let best=-1,bd2=9;for(let l=0;l<NL;l++)if(!blocked(o.dz,l)&&Math.abs(l-S.lane)<bd2){bd2=Math.abs(l-S.lane);best=l}txt=best<S.lane?"◀":"▶"}badge(q[0],Math.min(hy,q[1]-60*q[2]),q[2],txt,"#E63946",now)}}}}));
 S.riv.forEach(o=>{if(o.dz>-150&&o.dz<1100)it.push({dz:o.dz,f:()=>{const q=proj(o.l,o.dz);horse(q[0],q[1],PS*q[2],o.ph,PAL[o.p],o.jy>0,o.jy*.9,false)}})});
 S.coins.forEach(c=>it.push({dz:c.dz,f:()=>{const q=proj(c.lane,c.dz),r=9*q[2],y=q[1]-14*q[2]-c.h*q[2];ell(q[0],y,r,r,"#F4B63D");cx.strokeStyle="#B07A12";cx.lineWidth=2*q[2];cx.stroke();if(c.first&&c.dz>110&&c.dz<720&&Math.abs(c.lane-S.lane)<2.6)arrowDown(q[0],y-22*q[2],q[2],now)}}));
 it.push({dz:0,f:()=>{const x=180+(S.cl-2)*LW,fl=S.inv>0&&Math.floor(now/90)%2;cx.globalAlpha=fl?.35:1;horse(x,GY,PS,S.ph,PAL.me,S.jy>0,S.jy*.9,S.star>0);cx.globalAlpha=1}});
 it.sort((a,b)=>b.dz-a.dz).forEach(i=>i.f());
 S.fx.forEach(f=>{ell(f.x,f.y,6+(.5-f.t)*14,4+(.5-f.t)*8,"#D8C08A",f.t*1.2)});
 cx.fillStyle="rgba(0,0,0,.38)";cx.fillRect(0,0,CW,38);cx.fillStyle="#FFF4DC";cx.font="bold 16px system-ui";cx.textBaseline="middle";
 cx.fillText("♥".repeat(Math.max(0,S.hp)),10,19);cx.fillText("🪙 "+S.coin,100,19);cx.fillText(Math.floor(S.dist)+" m",160,19);cx.textAlign="right";cx.fillText(tx.lvl+" "+(lv+1),CW-10,19);
 cx.textAlign="left";cx.fillStyle="rgba(0,0,0,.55)";cx.font="bold 15px system-ui";cx.fillText("🏁 "+rank()+"/5"+(S.star>0?"  ★ "+Math.ceil(S.star):""),10,54);cx.textAlign="right";cx.fillText(tx.th[lv%4],CW-10,54);cx.textAlign="left";
 if(st==="play"&&S.cd>0){cx.lineJoin="round";cx.lineWidth=8;cx.strokeStyle="rgba(0,0,0,.55)";cx.font="bold 72px system-ui";cx.textAlign="center";const cn=Math.ceil(S.cd)>3?"":String(Math.ceil(S.cd));cx.strokeText(cn,CW/2,130);cx.fillStyle="#F4B63D";cx.fillText(cn,CW/2,130);cx.textAlign="left"}
 else if(st==="play"&&S.cd>-.8){cx.lineJoin="round";cx.lineWidth=7;cx.strokeStyle="rgba(0,0,0,.55)";cx.font="bold 54px system-ui";cx.textAlign="center";cx.strokeText(tx.go2,CW/2,125);cx.fillStyle="#F4B63D";cx.fillText(tx.go2,CW/2,125);cx.textAlign="left"}
 if(st==="play"||st==="pause"){if(S.nit>0){cx.strokeStyle="rgba(255,255,255,.55)";cx.lineWidth=2;for(let i=0;i<14;i++){const x=(i*53+now*.9)%CW,y=60+(i*97)%420;cx.beginPath();cx.moveTo(x,y);cx.lineTo(x,y+40+i%3*14);cx.stroke()}}
  const rdy=S.ng>=100;cx.fillStyle=rdy?"rgba(255,120,30,.85)":"rgba(0,0,0,.5)";cx.beginPath();cx.arc(306,596,32,0,7);cx.fill();cx.strokeStyle=rdy?"#FFE066":"#F4B63D";cx.lineWidth=5;cx.beginPath();cx.arc(306,596,30,-Math.PI/2,-Math.PI/2+Math.PI*2*S.ng/100);cx.stroke();cx.font="26px system-ui";cx.textAlign="center";cx.fillStyle="#fff";cx.fillText("🔥",306,597);cx.textAlign="left";
  if(S.slp){cx.fillStyle="rgba(255,255,255,.85)";cx.font="bold 15px system-ui";cx.textAlign="center";cx.fillText(tx.slip,CW/2,70);cx.textAlign="left"}
  if(S.sl>.06||S.sl<-.06){cx.fillStyle="rgba(0,0,0,.55)";cx.font="bold 14px system-ui";cx.fillText(S.sl>0?"⬆ "+tx.up:"⬇ "+tx.dn,10,74)}}
 if(S.ban){cx.textAlign="center";cx.lineJoin="round";cx.lineWidth=6;cx.strokeStyle="rgba(0,0,0,.6)";cx.font="bold 40px system-ui";cx.strokeText(S.ban.a,CW/2,112);cx.fillStyle="#F4B63D";cx.fillText(S.ban.a,CW/2,112);cx.font="bold 28px system-ui";cx.strokeText(S.ban.b,CW/2,150);cx.fillStyle="#fff";cx.fillText(S.ban.b,CW/2,150);cx.textAlign="left"}
 raf=requestAnimationFrame(frame);
}

 function chips(){spd.innerHTML="";SPN.forEach((n,i)=>{const b=D.createElement("button");b.textContent=n;b.style.cssText="border:0;border-radius:12px;padding:10px 12px;font:700 15px sans-serif;cursor:pointer;background:"+(i===SP?"#F4B63D;color:#2A1B00":"#3A5A52;color:#FFF4DC");b.onclick=()=>{SP=i;chips();lab()};spd.appendChild(b)})}
 function lab(){bs.textContent="⚡ "+SPN[SP]}
 function start(){reset();st="play";ov.style.display="none";api.music.start("drive")}
 goB.onclick=start;chips();lab();
 let sx=0,sy=0,nt=false;
 cv.addEventListener("pointerdown",e=>{sx=e.clientX;sy=e.clientY;const r=cv.getBoundingClientRect(),lx=(e.clientX-r.left)*CW/r.width,ly=(e.clientY-r.top)*CH/r.height;nt=Math.hypot(lx-306,ly-596)<42});
 cv.addEventListener("pointerup",e=>{if(nt){nt=false;nitro();return}const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)>26&&Math.abs(dx)>Math.abs(dy))lane(dx<0?-1:1);else if(dy>26&&S.jy>0)S.vy=-700;else jump()});
 const kd=e=>{if(e.key==="ArrowLeft")lane(-1);if(e.key==="ArrowRight")lane(1);if(e.key==="ArrowUp"||e.key===" ")jump()};
 D.addEventListener("keydown",kd);
 function cleanup(){alive=false;cancelAnimationFrame(raf);D.removeEventListener("keydown",kd);W.removeEventListener("resize",fit);api.music.stop();cleanH=null}
 function finish(){if(!alive)return;const coins=S.coin,dist=S.dist;cleanup();if(dist>=300||coins>=10)api.win(coins);else{if(coins)api.rewards.add(coins);api.lose()}}
 raf=requestAnimationFrame(frame);
 return cleanup;
}
G.register({id:"horse",
 title:{en:"Horse racing",om:"Fardaan Gulufuu",am:"ፈረስ ግልቢያ",ar:"سباق الخيل"},
 howto:{en:"Race 4 riders. Swipe left/right to change lane, tap to jump. Red arrows: obstacles to avoid. Green arrows: things to collect. Ride behind rivals to charge 🔥, then tap 🔥 to sprint! The race never ends: every level is harder.",
  om:"Fardeen dorgomtootaa 4 waliin dorgomi. Gara bitaa/mirgaatti harkisi: daandii jijjiiri. Tuqi: utaali. Xiyyaa diimaa: waan irraa goruu qabdu. Xiyyaa magariisa: waan fudhatu. Duuba dorgomtootaa fiiguun 🔥 guuti, achiin booda 🔥 tuqi! Taphni hin xumuramu: sadarkaan hundi ulfaataa dha.",
  am:"ከ4 ፈረሰኞች ጋር ተወዳደር። ወደ ግራ/ቀኝ ጎትት፦ መስመር ቀይር። ንካ፦ ዝለል። ቀይ ቀስት፦ ማምለጥ ያለብህ። አረንጓዴ ቀስት፦ ሰብስብ። ከተወዳዳሪዎች ኋላ ሩጥ 🔥 ሙላ፣ ከዚያ 🔥 ንካ! ውድድሩ አያልቅም፤ ደረጃ በደረጃ ይከብዳል።",
  ar:"تسابق مع 4 فرسان. اسحب يسارًا/يمينًا لتغيير المسار، اضغط للقفز. السهم الأحمر: عائق يجب تجنبه. السهم الأخضر: شيء يُجمع. اركض خلف المنافسين لتعبئة 🔥 ثم اضغط 🔥 للانطلاق! السباق لا ينتهي وكل مستوى أصعب."},
 stop(){if(cleanH)cleanH()},
 start(api){if(cleanH)cleanH();cleanH=horseGame(api)}});
})(window);
