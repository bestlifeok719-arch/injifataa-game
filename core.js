"use strict";
/* Injifataa Game - core: sound, music, rewards, ads bridge, game shell */
(function(W){
const CFG={bannerId:"ca-app-pub-3940256099942544/6300978111",rewardedId:"ca-app-pub-3940256099942544/5224354917"}; // Google TEST ids: replace with real ids before publishing
const L={
 en:{win:"You won!",lose:"So close! Try again, you're getting better",retry:"Play again",back:"Back",dbl:"🎬 Double coins",gift:"Daily gift",wait:"Come back tomorrow",bonus:"🎬 +50 🪙 (watch an ad)",howto:"How to play",go:"Let's go",adtxt:"Ad playing…",adok:"Done"},
 om:{win:"Injifatteetta!",lose:"Dhiyoo ture! Irra deebi'ii yaali",retry:"Irra deebi'ii taphadhu",back:"Duubatti",dbl:"🎬 Coins dachaa",gift:"Kennaa guyyaa",wait:"Boru deebi'i",bonus:"🎬 +50 🪙 (beeksisa ilaali)",howto:"Akkaataa taphaa",go:"Jalqabi",adtxt:"Beeksisni deemaa jira…",adok:"Xumurameera"},
 am:{win:"አሸነፍክ!",lose:"ትንሽ ቀርቶ ነበር! እንደገና ሞክር",retry:"እንደገና ተጫወት",back:"ተመለስ",dbl:"🎬 ሳንቲም በእጥፍ",gift:"የዕለቱ ስጦታ",wait:"ነገ ተመለስ",bonus:"🎬 +50 🪙 (ማስታወቂያ ተመልከት)",howto:"እንዴት እንደሚጫወት",go:"እንጀምር",adtxt:"ማስታወቂያ እየታየ ነው…",adok:"ተጠናቋል"},
 ar:{win:"فزت!",lose:"كدت تنجح! حاول مجدداً",retry:"العب مجدداً",back:"رجوع",dbl:"🎬 ضاعف العملات",gift:"هدية اليوم",wait:"عد غداً",bonus:"🎬 +50 🪙 (شاهد إعلاناً)",howto:"كيف تلعب",go:"هيا نبدأ",adtxt:"الإعلان قيد العرض…",adok:"تم"}
};
const lang=()=>(W.document&&W.document.documentElement.lang)||"en";
const t=k=>(L[lang()]||L.en)[k]||L.en[k]||k;
const store={get(k){try{return W.localStorage.getItem(k)}catch(e){return null}},set(k,v){try{W.localStorage.setItem(k,v)}catch(e){}}};

/* ---------- Sound + atmosphere ---------- */
const Sfx=(function(){
 let ctx=null,master=null,muted=false,crowdNode=null;
 const api={userMusic:false};
 function ac(){
  if(!ctx){const C=W.AudioContext||W.webkitAudioContext;if(!C)return null;ctx=new C();master=ctx.createGain();master.gain.value=muted?0:.7;master.connect(ctx.destination)}
  if(ctx.state==="suspended")ctx.resume();return ctx;
 }
 function tone(f,d,type,v,slide,at){
  const c=ac();if(!c)return;const s=c.currentTime+(at||0),o=c.createOscillator(),g=c.createGain();
  o.type=type||"sine";o.frequency.setValueAtTime(f,s);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,slide),s+d);
  g.gain.setValueAtTime(0,s);g.gain.linearRampToValueAtTime(v||.2,s+.01);g.gain.exponentialRampToValueAtTime(.001,s+d);
  o.connect(g);g.connect(master);o.start(s);o.stop(s+d+.05);
 }
 function noise(d,fr,v,at){
  const c=ac();if(!c)return null;const n=c.sampleRate*d,b=c.createBuffer(1,n,c.sampleRate),a=b.getChannelData(0);
  for(let i=0;i<n;i++)a[i]=Math.random()*2-1;
  const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=b;f.type="bandpass";f.frequency.value=fr;
  g.gain.value=v;s.connect(f);f.connect(g);g.connect(master);s.start(c.currentTime+(at||0));return {s,g};
 }
 api.tone=tone;
 api.setMuted=m=>{muted=!!m;if(master)master.gain.value=muted?0:.7};
 api.tap=()=>tone(520,.06,"triangle",.12);
 api.coin=()=>{tone(880,.1,"square",.08);tone(1320,.18,"square",.08,0,.09)};
 api.win=()=>[523,659,784,1047].forEach((f,i)=>tone(f,.25,"triangle",.16,0,i*.11));
 api.lose=()=>{tone(392,.3,"sine",.14,330);tone(330,.4,"sine",.12,260,.25)};
 api.whoosh=()=>{const n=noise(.35,900,.25);if(n)n.g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.35)};
 api.hit=()=>{tone(150,.12,"sawtooth",.2,60);noise(.1,400,.2)};
 api.cheer=()=>{const n=noise(1.4,1400,.0001);if(n){const c=ctx.currentTime;n.g.gain.exponentialRampToValueAtTime(.18,c+.4);n.g.gain.exponentialRampToValueAtTime(.001,c+1.4)}};
 api.crowd=on=>{ // stadium / nature atmosphere bed
  if(!on){if(crowdNode){try{crowdNode.s.stop()}catch(e){}crowdNode=null}return}
  if(crowdNode)return;const n=noise(4,700,.05);if(n){n.s.loop=true;crowdNode=n}
 };
 return api;
})();

/* ---------- Music (procedural, 3 moods; skipped when user music is chosen) ---------- */
const Music=(function(){
 const MOODS={bright:{sc:[0,2,4,7,9],bpm:118,root:262},calm:{sc:[0,2,4,7,9],bpm:84,root:220},drive:{sc:[0,3,5,7,10],bpm:132,root:196}};
 let timer=null,step=0,mood=MOODS.bright,next=0,idx=2;
 const freq=(r,s,o)=>r*Math.pow(2,(s+12*o)/12);
 const api={};
 api.start=m=>{
  api.stop();mood=MOODS[m]||MOODS.bright;step=0;
  const dur=60/mood.bpm/2;
  timer=setInterval(()=>{
   if(Sfx.userMusic)return;
   const sc=mood.sc;idx=Math.max(0,Math.min(sc.length*2-1,idx+[-1,0,1][Math.floor(Math.random()*3)]));
   const deg=sc[idx%sc.length],oct=Math.floor(idx/sc.length);
   Sfx.tone(freq(mood.root,deg,oct),dur*1.6,"triangle",.07);
   if(step%4===0)Sfx.tone(freq(mood.root,0,-1),dur*3,"sine",.1);
   step++;
  },dur*1000);
 };
 api.stop=()=>{if(timer){clearInterval(timer);timer=null}};
 return api;
})();

/* ---------- Rewards ---------- */
const Rewards={
 onChange:null,
 get(){return parseInt(store.get("ij_coins")||"0",10)||0},
 add(n){store.set("ij_coins",String(Math.max(0,this.get()+n)));if(this.onChange)this.onChange(this.get());return this.get()},
 canClaim(){return Date.now()-(parseInt(store.get("ij_gift")||"0",10)||0)>=864e5},
 claimDaily(){if(!this.canClaim())return 0;store.set("ij_gift",String(Date.now()));this.add(50);return 50}
};

/* ---------- Ads bridge (AdMob via Capacitor in the APK; simulated in browser) ---------- */
const Ads={
 plugin(){return W.Capacitor&&W.Capacitor.Plugins&&W.Capacitor.Plugins.AdMob},
 init(){const p=this.plugin();if(p){try{p.initialize({initializeForTesting:true})}catch(e){}}},
 rewarded(cb){
  const p=this.plugin();
  if(p){try{
   let done=false;const h=p.addListener("onRewardedVideoAdReward",()=>{done=true});
   p.prepareRewardVideoAd({adId:CFG.rewardedId}).then(()=>p.showRewardVideoAd()).then(r=>{cb(!!r||done)}).catch(()=>cb(false));
   return}catch(e){cb(false);return}
  }
  const d=W.document.createElement("div");
  d.style.cssText="position:fixed;inset:0;z-index:30;background:#000c;display:grid;place-items:center;color:#fff;font:700 20px sans-serif;text-align:center";
  d.innerHTML="<div>"+t("adtxt")+"<br><br></div>";const b=W.document.createElement("button");
  b.textContent=t("adok");b.style.cssText="padding:12px 28px;border:0;border-radius:14px;font:inherit;background:#F4B63D;color:#2A1B00";
  b.onclick=()=>{d.remove();cb(true)};d.firstChild.appendChild(b);W.document.body.appendChild(d);
 }
};

/* ---------- Game shell: how-to card, result sheet, retry, gentle difficulty ---------- */
const Game=(function(){
 const reg={};let losses=0;
 const el=(tag,css,txt)=>{const e=W.document.createElement(tag);if(css)e.style.cssText=css;if(txt!=null)e.textContent=txt;return e};
 const BTN="border:0;border-radius:16px;padding:14px;font:700 17px sans-serif;width:100%;cursor:pointer;";
 function open(id){
  const spec=reg[id];if(!spec)return;
  const ov=el("div","position:fixed;left:0;top:0;right:0;bottom:0;width:100%;max-width:100%;overflow:hidden;z-index:20;background:#0E2F2A;color:#FFF4DC;display:flex;flex-direction:column;padding-top:env(safe-area-inset-top,0)");
  const bar=el("div","display:flex;align-items:center;gap:10px;padding:10px 14px");
  const back=el("button",BTN+"width:auto;background:#1C5148;color:#FFF4DC;padding:10px 16px",t("back"));
  const ttl=el("b","flex:1;font-size:18px",spec.title?(spec.title[lang()]||spec.title.en):id);
  const coin=el("span","background:#154039;border-radius:999px;padding:6px 14px;font-weight:700");
  const upd=()=>{coin.textContent="🪙 "+Rewards.get()};upd();
  const prev=Rewards.onChange;Rewards.onChange=n=>{upd();if(prev)prev(n)};
  bar.append(back,ttl,coin);
  const root=el("div","flex:1;position:relative;overflow:hidden");
  ov.append(bar,root);W.document.body.appendChild(ov);
  let alive=true;
  const exit=()=>{alive=false;try{spec.stop&&spec.stop()}catch(e){}Music.stop();Sfx.crowd(false);Rewards.onChange=prev;ov.remove()};
  back.onclick=exit;
  const api={root,sfx:Sfx,music:Music,rewards:Rewards,ads:Ads,t,lang,exit,
   get ease(){return Math.min(3,losses)*.1}, // 0 .. 0.3: games use it to soften difficulty after losses
   win(coins){losses=0;Sfx.win();Rewards.add(coins);result(true,coins)},
   lose(){losses++;Sfx.lose();result(false,0)}};
  function sheet(){const s=el("div","position:absolute;inset:0;background:#000a;display:flex;align-items:flex-end;justify-content:center;z-index:5");
   const c=el("div","width:100%;max-width:640px;background:#16403A;border-radius:24px 24px 0 0;padding:20px 28px calc(20px + env(safe-area-inset-bottom,0px));display:grid;gap:10px;text-align:center;box-sizing:border-box;min-width:0;overflow-wrap:anywhere");s.appendChild(c);root.appendChild(s);return [s,c]}
  function launch(){root.innerHTML="";if(alive)spec.start(api)}
  function result(won,coins){
   const [s,c]=sheet();
   c.appendChild(el("div","font:800 26px sans-serif;color:#F4B63D",won?t("win"):t("lose")));
   if(won){c.appendChild(el("div","font:700 22px sans-serif","+"+coins+" 🪙"));
    const d=el("button",BTN+"background:#E8553D;color:#fff",t("dbl"));
    d.onclick=()=>{d.disabled=true;Ads.rewarded(ok=>{if(ok){Rewards.add(coins);Sfx.coin();d.textContent="+"+(coins*2)+" 🪙"}else d.disabled=false})};c.appendChild(d)}
   const r=el("button",BTN+"background:#F4B63D;color:#2A1B00",t("retry"));r.onclick=launch;
   const b=el("button",BTN+"background:#3A5A52;color:#FFF4DC",t("back"));b.onclick=exit;c.append(r,b);
  }
  const key="ij_seen_"+id;
  if(spec.howto&&!store.get(key)){
   const [s,c]=sheet();c.appendChild(el("div","font:800 22px sans-serif;color:#F4B63D",t("howto")));
   c.appendChild(el("div","font:17px/1.5 sans-serif;padding:0 4px",spec.howto[lang()]||spec.howto.en));
   const g=el("button",BTN+"background:#F4B63D;color:#2A1B00",t("go"));g.onclick=()=>{store.set(key,"1");launch()};c.appendChild(g);
  }else launch();
 }
 return {register(s){reg[s.id]=s},has(id){return !!reg[id]},open,get losses(){return losses}};
})();

W.Sfx=Sfx;W.Music=Music;W.Rewards=Rewards;W.Ads=Ads;W.Game=Game;W.IJ={t,store,lang,L};
})(typeof window!=="undefined"?window:globalThis);
