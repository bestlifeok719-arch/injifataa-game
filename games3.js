"use strict";
/* Injifataa Game - Stage 5: Pour Bloom (6 rounds, each a different challenge) */
(function(W){
const D=W.document,G=W.Game,ui=W.IJ.ui,btn=ui.btn,bar=ui.bar,canvas=ui.canvas;
const TX={
 en:{pour:"Hold 💧 and release in the green zone",speed:"Water the thirsty flower fast!",mem:"Watch, then repeat the pattern",hold:"💧 Hold to pour"},
 om:{pour:"💧 qabadhu, naannoo magariisaa keessatti dhiisi",speed:"Daraaraa dheebotu ariifadhuun bishaan naqi!",mem:"Ilaali, achiin booda akkaataa sana irra deebi'i",hold:"💧 Qabadhu, naqi"},
 am:{pour:"💧 ይዘህ በአረንጓዴ ዞን ልቀቅ",speed:"የተጠማውን አበባ በፍጥነት አጠጣ!",mem:"ተመልከት፣ ከዚያ ቅደም ተከተሉን ድገም",hold:"💧 ይዘህ አፍስስ"},
 ar:{pour:"اضغط 💧 وأفلت في المنطقة الخضراء",speed:"اسقِ الزهرة العطشى بسرعة!",mem:"شاهد ثم كرّر النمط",hold:"💧 اضغط للصب"}
};
const COLS=["#E8553D","#F4B63D","#6BE3FF","#C77DFF","#6BE36B","#FF8FB3"],TONE=[392,494,587,698];
let clean=null;
G.register({id:"bloom",
 title:{en:"Pour Bloom",om:"Pour Bloom",am:"Pour Bloom",ar:"Pour Bloom"},
 howto:{en:"6 rounds, each a new challenge: pour precisely, water fast, remember the pattern. Too many mistakes cost a heart. Bloom them all!",
  om:"Marsaa 6, tokkoon tokkoon isaa ulfina haaraa: sirriitti naquu, ariifadhuun bishaan naquu, akkaataa yaadachuu. Dogoggora baay'ee yoo hojjatte onnee tokko dhabda. Hundaa daraarsi!",
  am:"6 ዙሮች፣ እያንዳንዳቸው አዲስ ፈተና፡ በትክክል ማፍሰስ፣ በፍጥነት ማጠጣት፣ ቅደም ተከተል ማስታወስ። ብዙ ስህተት ልብ ያስከፍላል። ሁሉንም አብብ!",
  ar:"6 جولات، كل منها تحدٍّ جديد: صبّ دقيق، سقي سريع، تذكّر النمط. الأخطاء الكثيرة تكلّفك قلباً. أزهِر الجميع!"},
 stop(){if(clean)clean()},
 start(api){
  if(clean)clean();
  const root=api.root,cv=canvas(root),x=cv.getContext("2d"),Wd=cv.width,Hd=cv.height,TT=k=>(TX[api.lang()]||TX.en)[k];
  const S={r:0,lives:api.ease>=.3?4:3,over:false,last:0,raf:0,miss:0,done:0,pour:false,msg:"",mt:0,wait:0,after:null};
  const rk=()=>["pour","speed","mem"][S.r%3],kind=()=>R.k,lvl=()=>Math.floor(S.r/3),budget=()=>3+Math.round(api.ease*10);
  let R={};
  const pb=btn(root,TT("hold"),"background:#2F6F9F;height:80px;font-size:24px",()=>{S.pour=true},()=>{if(S.pour){S.pour=false;release()}});
  bar(root).appendChild(pb);
  const say=m=>{S.msg=m;S.mt=.9};
  function init(){
   S.miss=0;S.done=0;S.pour=false;const k=rk(),l=lvl();R={k:k};
   if(k==="pour"){R.L=0;R.goal=3;R.w=Math.max(.07,.2-l*.05)+api.ease*.2;R.c=.3+Math.random()*.5}
   else if(k==="speed"){R.goal=6+l*4;R.win=1.8-l*.5+api.ease*1.2;R.cur=-1;R.prev=-1;R.tm=0;R.gap=.6;R.bl=Array(6).fill(0)}
   else{R.len=3+l*2;R.seq=[];for(let i=0;i<R.len;i++)R.seq.push(Math.floor(Math.random()*4));R.ph="show";R.t=0;R.n=0;R.lit=-1;R.bl=Array(4).fill(0)}
   pb.style.display=k==="pour"?"":"none";
  }
  const finish=won=>{if(S.over)return;clean();if(won)api.win(30+S.lives*5);else{api.rewards.add(S.r*3);api.lose()}};
  const lifeLost=()=>{S.lives--;if(S.lives<=0)finish(false);else{say("💔");S.wait=.9;S.after=init}};
  const mistake=()=>{S.miss++;api.sfx.hit();say("✖");if(S.miss>=budget())lifeLost()};
  const next=()=>{S.r++;api.sfx.win();say("🌸");if(S.r>=6)finish(true);else{S.wait=1.1;S.after=init}};
  function release(){
   if(S.wait>0||kind()!=="pour")return;
   const ok=Math.abs(R.L-R.c)<=R.w/2;
   if(ok){S.done++;api.sfx.coin();say("🌸");if(S.done>=R.goal)return next()}else mistake();
   if(S.over||S.wait>0)return;
   S.wait=.6;S.after=()=>{R.L=0;R.c=.3+Math.random()*.5}
  }
  const pots=()=>{const k=kind();
   if(k==="speed")return [0,1,2,3,4,5].map(i=>({x:Wd*[.2,.5,.8][i%3],y:Hd*(.34+.2*Math.floor(i/3)),r:Wd*.11}));
   return [0,1,2,3].map(i=>({x:Wd*[.32,.68][i%2],y:Hd*(.34+.2*Math.floor(i/2)),r:Wd*.15}))};
  const tap=e=>{
   if(S.wait>0||kind()==="pour")return;const b=cv.getBoundingClientRect(),X=(e.clientX-b.left)*Wd/b.width,Y=(e.clientY-b.top)*Hd/b.height;
   const P=pots();let hit=-1;P.forEach((p,i)=>{if(Math.hypot(X-p.x,Y-p.y)<p.r*1.2)hit=i});if(hit<0)return;
   if(kind()==="speed"){
    if(hit===R.cur){R.bl[hit]=1;S.done++;api.sfx.coin();R.cur=-1;R.gap=.4;if(S.done>=R.goal)next()}else mistake();
   }else if(R.ph==="in"){
    api.sfx.tone(TONE[hit],.25,"triangle",.2);R.bl[hit]=1;
    if(hit===R.seq[R.n]){R.n++;if(R.n>=R.len)next()}else{mistake();R.n=0;R.ph="show";R.t=0}
   }
  };
  cv.addEventListener("pointerdown",tap);
  const kd=e=>{if(e.key===" "&&kind()==="pour")S.pour=true};const ku=e=>{if(e.key===" "&&S.pour){S.pour=false;release()}};
  D.addEventListener("keydown",kd);D.addEventListener("keyup",ku);
  api.music.start("calm");
  clean=()=>{S.over=true;cancelAnimationFrame(S.raf);D.removeEventListener("keydown",kd);D.removeEventListener("keyup",ku);api.music.stop();clean=null};
  init();
  function update(dt){
   S.mt=Math.max(0,S.mt-dt);
   if(R.bl)R.bl=R.bl.map(v=>Math.max(0,v-dt*.8));
   if(S.wait>0){S.wait-=dt;if(S.wait<=0&&S.after){const f=S.after;S.after=null;f()}return}
   const k=kind();
   if(k==="pour"){if(S.pour){R.L+=dt*.4;if(R.L>=1){R.L=1;S.pour=false;release()}}}
   else if(k==="speed"){
    if(R.cur<0){R.gap-=dt;if(R.gap<=0){const i=(R.prev+1+Math.floor(Math.random()*5))%6;R.cur=R.prev=i;R.tm=R.win}}
    else{R.tm-=dt;if(R.tm<=0){R.cur=-1;R.gap=.5;mistake()}}
   }else if(R.ph==="show"){
    R.t+=dt;const idx=Math.floor(R.t/.7),on=idx<R.len&&(R.t%.7)<.45?R.seq[idx]:-1;
    if(on>=0&&on!==R.lit)api.sfx.tone(TONE[on],.3,"triangle",.2);R.lit=on;
    if(R.t>=R.len*.7+.3){R.ph="in";R.n=0;R.lit=-1}
   }
  }
  function flower(cx,cy,r,col,g){
   x.fillStyle="#3E8F55";x.fillRect(cx-2,cy,4,r*1.2);
   x.fillStyle=col;for(let i=0;i<5;i++){const a=i/5*6.283;x.beginPath();x.arc(cx+Math.cos(a)*r*.5*g,cy+Math.sin(a)*r*.5*g,r*.42*g,0,7);x.fill()}
   x.fillStyle="#FFF4DC";x.beginPath();x.arc(cx,cy,r*.28*g,0,7);x.fill()
  }
  function draw(){
   const g=x.createLinearGradient(0,0,0,Hd);g.addColorStop(0,"#16403A");g.addColorStop(1,"#0E2F2A");x.fillStyle=g;x.fillRect(0,0,Wd,Hd);
   x.font="700 20px sans-serif";x.textAlign="left";x.fillStyle="#FFF4DC";x.fillText("❤".repeat(S.lives),12,30);
   x.textAlign="right";x.fillText((Math.min(6,S.r+1))+"/6  ✖ "+S.miss+"/"+budget(),Wd-12,30);
   x.textAlign="center";x.font="700 18px sans-serif";x.fillText(TT(kind()),Wd/2,64);
   const k=kind();
   if(k==="pour"){
    const gx=Wd/2-60,gy=Hd*.3,gh=Hd*.4;
    x.fillStyle="#ffffff14";x.fillRect(gx,gy,120,gh);
    x.fillStyle="#6BE3FF";x.fillRect(gx,gy+gh*(1-R.L),120,gh*R.L);
    x.fillStyle="#6BE36B66";x.fillRect(gx-8,gy+gh*(1-R.c-R.w/2),136,gh*R.w);
    x.strokeStyle="#FFF4DC";x.lineWidth=3;x.strokeRect(gx,gy,120,gh);
    for(let i=0;i<R.goal;i++){if(i<S.done)flower(Wd*(.25+.25*i),Hd*.2,18,COLS[i],1);else{x.fillStyle="#ffffff22";x.beginPath();x.arc(Wd*(.25+.25*i),Hd*.2,8,0,7);x.fill()}}
   }else{
    pots().forEach((p,i)=>{
     const lit=k==="mem"&&R.lit===i,th=k==="speed"&&R.cur===i;
     x.fillStyle=lit?"#fff":"#8B5A2B";x.beginPath();x.arc(p.x,p.y+p.r*.4,p.r,0,3.15);x.fill();
     flower(p.x,p.y-p.r*.2,p.r*.7,COLS[i%6],th?.4:.5+R.bl[i]*.7+(lit?.6:0));
     if(th){x.strokeStyle="#6BE3FF";x.lineWidth=5;x.beginPath();x.arc(p.x,p.y,p.r*1.15,-1.57,-1.57+6.28*Math.max(0,R.tm/R.win));x.stroke();x.font="28px sans-serif";x.fillText("💧",p.x,p.y-p.r*1.2)}
    });
    if(k==="speed"){x.font="700 18px sans-serif";x.fillStyle="#FFF4DC";x.fillText("🌸 "+S.done+"/"+R.goal,Wd/2,Hd*.78)}
    else{x.font="700 18px sans-serif";x.fillStyle="#FFF4DC";x.fillText(R.ph==="show"?"👀":"👆 "+R.n+"/"+R.len,Wd/2,Hd*.78)}
   }
   if(S.mt>0){x.font="800 44px sans-serif";x.fillStyle="#F4B63D";x.fillText(S.msg,Wd/2,Hd*.18+60)}
  }
  function loop(ts){if(S.over)return;const dt=Math.min(.05,((ts||0)-(S.last||ts||0))/1000);S.last=ts;update(dt);if(!S.over)draw();if(!S.over)S.raf=requestAnimationFrame(loop)}
  S.raf=requestAnimationFrame(loop);
 }});
})(window);
