/* ── CANVAS PARTICLES ── */
const cvs=document.getElementById('canvas');
const ctx=cvs.getContext('2d');
let W,H,pts=[];
function resize(){ W=cvs.width=innerWidth; H=cvs.height=innerHeight; }
resize(); addEventListener('resize',resize);
class Pt{
  constructor(){
    this.x=Math.random()*W; this.y=Math.random()*H;
    this.r=Math.random()*1.5+.3;
    this.vx=(Math.random()-.5)*.25; this.vy=(Math.random()-.5)*.25;
    this.a=Math.random()*.4+.05;
  }
  tick(){
    this.x+=this.vx; this.y+=this.vy;
    if(this.x<0||this.x>W||this.y<0||this.y>H){
      this.x=Math.random()*W; this.y=Math.random()*H;
    }
  }
  draw(){
    ctx.beginPath();
    ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
    ctx.fillStyle=`rgba(248,113,113,${this.a})`;
    ctx.fill();
  }
}
for(let i=0;i<60;i++) pts.push(new Pt());
(function animP(){
  ctx.clearRect(0,0,W,H);
  pts.forEach(p=>{p.tick();p.draw();});
  requestAnimationFrame(animP);
})();

/* ── LOADING ── */
let prog=0;
const lbar=document.getElementById('lbar');
const lt=setInterval(()=>{
  prog+=Math.random()*7+2;
  if(prog>=100){
    prog=100; clearInterval(lt);
    setTimeout(()=>{
      document.getElementById('loading').classList.add('out');
      document.getElementById('pin-screen').classList.add('show');
    },400);
  }
  lbar.style.width=prog+'%';
},80);

/* ── PIN ── */
const PIN='0404';
let inp='';
const dots=[0,1,2,3].map(i=>document.getElementById('pd'+i));
const perr=document.getElementById('perr');

document.querySelector('.keypad').addEventListener('click',e=>{
  const k=e.target.dataset.k; if(!k) return;
  if(k==='del'){ inp=inp.slice(0,-1); }
  else if(k==='ok'){
    if(inp===PIN){
      dots.forEach(d=>d.classList.add('on'));
      setTimeout(()=>{
        document.getElementById('pin-screen').classList.add('hide');
        setTimeout(()=>{
          document.getElementById('main').classList.add('show');
          confetti();
          setTimeout(()=>document.getElementById('mini').classList.add('show'),1500);
        },400);
      },300);
    } else {
      dots.forEach(d=>{d.classList.remove('on');d.classList.add('err');});
      perr.classList.add('show');
      setTimeout(()=>{ dots.forEach(d=>d.classList.remove('err')); perr.classList.remove('show'); },900);
      inp='';
    }
    return;
  } else if(inp.length<4){ inp+=k; }
  updDots();
});
function updDots(){
  dots.forEach((d,i)=>{
    d.classList.toggle('on',i<inp.length);
    d.classList.remove('err');
  });
  perr.classList.remove('show');
}

/* ── CONFETTI ── */
const CC=['#ef4444','#fb7185','#fecaca','#f97316','#f8fafc'];
function confetti(){
  for(let i=0;i<70;i++){
    const el=document.createElement('div');
    el.className='conf';
    el.style.cssText=`
      left:${Math.random()*100}vw; top:-8px;
      width:${Math.random()*6+3}px; height:${Math.random()*10+4}px;
      background:${CC[Math.floor(Math.random()*CC.length)]};
      animation-duration:${Math.random()*3+2}s;
      animation-delay:${Math.random()*1.5}s;
    `;
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),6000);
  }
}
function hearts(n=5){
  for(let i=0;i<n;i++){
    const h=document.createElement('div');
    h.className='fheart';
    h.textContent=['❤️','💕','💖'][Math.floor(Math.random()*3)];
    h.style.cssText=`
      left:${Math.random()*100}vw; bottom:5vh; font-size:${Math.random()*16+12}px;
      animation-duration:${Math.random()*2+2.5}s;
      animation-delay:${Math.random()*.6}s;
    `;
    document.body.appendChild(h);
    setTimeout(()=>h.remove(),6000);
  }
}

/* ── PLAYER ── */
let playing=false, pInt=null;
const audio=new Audio('assets/audio/Bulan Sutena - Happy Birthday.mp3');
audio.preload='auto';
const tfill=document.getElementById('tfill');
const pbtn=document.getElementById('pbtn');
const mbtn=document.getElementById('mbtn');
const pthumb=document.getElementById('pthumb');
const mico=document.getElementById('mico');
const viz=document.getElementById('viz');
const playerTrack=document.querySelector('.player-track');
const playerArtist=document.querySelector('.player-artist');
const miniTxt=document.querySelector('.mini-txt');
let currentSongIndex=0;

for(let i=0;i<18;i++){
  const b=document.createElement('div');
  b.className='vbar'; viz.appendChild(b);
}
const vbars=[...viz.querySelectorAll('.vbar')];

function animViz(){
  if(!playing) return;
  vbars.forEach(b=>b.style.height=(Math.random()*18+3)+'px');
  setTimeout(animViz,130);
}

function setPlayingState(state){
  playing=state;
  const ico=playing?'⏸':'▶';
  pbtn.textContent=ico; mbtn.textContent=ico;
  if(playing){
    pthumb.classList.add('play'); mico.classList.add('play');
    clearInterval(pInt);
    pInt=setInterval(updateProgress,250);
    animViz();
  } else {
    pthumb.classList.remove('play'); mico.classList.remove('play');
    clearInterval(pInt);
    vbars.forEach(b=>b.style.height='3px');
  }
}

function updateProgress(){
  if(audio.duration){
    tfill.style.width=((audio.currentTime/audio.duration)*100)+'%';
  }
}

function setSong(index, shouldPlay=false){
  const song=songs[index];
  if(!song) return;
  currentSongIndex=index;
  audio.pause();
  audio.src=song.file;
  audio.currentTime=0;
  tfill.style.width='0%';
  playerTrack.textContent=`${song.t} - ${song.a}`;
  playerArtist.textContent='Diputar spesial untukmu ❤️';
  miniTxt.textContent=`${song.t} - ${song.a}`;
  document.querySelectorAll('.pl-item').forEach((item,i)=>{
    item.classList.toggle('active',i===currentSongIndex);
  });
  if(shouldPlay){
    audio.play().then(()=>setPlayingState(true)).catch(()=>setPlayingState(false));
  } else {
    setPlayingState(false);
  }
}

function togglePlay(){
  if(audio.paused){
    audio.play().then(()=>setPlayingState(true)).catch(()=>setPlayingState(false));
  } else {
    audio.pause();
    setPlayingState(false);
  }
}

audio.addEventListener('timeupdate',updateProgress);
audio.addEventListener('ended',()=>{
  tfill.style.width='0%';
  setSong((currentSongIndex+1)%songs.length,true);
});

/* ── LOVE METER ── */
const ldata=[
  ['51%','Hampir sampai... ❤️'],
  ['75%','Sayang banget 🥺'],
  ['90%','Hampir penuh 💖'],
  ['100%','Paling sayang! 🥰'],
];
let li=0;
function activateLove(){
  const [p,m]=ldata[li%ldata.length];
  document.getElementById('lpct').textContent=p;
  document.getElementById('lmsg').textContent=m;
  li++;
  confetti(); hearts(8);
}

/* ── MODALS ── */
let letterTimer=null;
function openM(n){
  document.getElementById('m-'+n).classList.add('show');
  if(n==='letter') typeLetter();
  if(n==='rundown'){
    setTimeout(()=>{
      document.querySelectorAll('.tl-item').forEach((el,i)=>{
        setTimeout(()=>el.classList.add('vis'),i*160);
      });
    },200);
  }
  if(n==='gallery') buildGal();
  if(n==='playlist') buildPl();
}
function closeM(n){ document.getElementById('m-'+n).classList.remove('show'); }
document.querySelectorAll('.overlay').forEach(o=>{
  o.addEventListener('click',e=>{ if(e.target===o) o.classList.remove('show'); });
});

const letter=`Happy Birthday

Sayangkuuuu.

Semoga dengan bertambahnya umurmu hari ini, tidak bertambah juga marah-marah tidak jelasmu🤭.

Akuu sangatt mencintaimu, lebih dari yang bisa aku jelaskan dengan kata-kata. Terima kasih karena sudah hadir dan menjadi bagian terindah dalam hidupku.

Semoga semua hal baik selalu datang menghampirimu, semua impianmu dipermudah, hatimu selalu bahagia, dan kesehatan selalu menyertaimu.

Terimakasih kamu masih bersamaku, aku minta maaf jika ada salah yaa sayangkuuu

Sekali lagi Happy Birthday saaaaaa❤️.
I loveeee youuuuuu❤️`;

function typeLetter(){
  const el=document.getElementById('lbody');
  clearInterval(letterTimer);
  el.textContent=''; let i=0;
  letterTimer=setInterval(()=>{
    el.textContent+=letter[i]; i++;
    if(i>=letter.length) clearInterval(letterTimer);
  },22);
}

const galItems=[
  {src:'assets/foto.jpeg',c:'Favorite smile'},
  {src:'assets/1.jpeg',c:'Sweet memory'},
  {src:'assets/2.jpeg',c:'Special moment'},
];
function buildGal(){
  const g=document.getElementById('galg');
  if(g.children.length) return;
  galItems.forEach(({src,c})=>{
    const d=document.createElement('div'); d.className='gal-item';
    d.innerHTML=`<img src="${src}" alt="${c}"><span class="gal-cap">${c}</span>`;
    g.appendChild(d);
  });
}

const songs=[
  {t:'Happy Birthday',a:'Bulan Sutena',d:'--:--',file:'assets/audio/Bulan Sutena - Happy Birthday.mp3'},
  {t:'La La Lost You',a:'NIKI',d:'--:--',file:'assets/audio/La La Lost You.mp3'},
  {t:'Lonely',a:'Justin Bieber & benny blanco',d:'--:--',file:'assets/audio/Lonely.mp3'},
  {t:'The Cut That Always Bleeds',a:'Conan Gray',d:'--:--',file:'assets/audio/The Cut That Always Bleeds.mp3'},
  {t:'Ada titik-titik di ujung doa',a:'Unknown Artist',d:'--:--',file:'assets/audio/Ada titik-titik di ujung doa.mp3'},
  {t:'IQRO',a:'Unknown Artist',d:'--:--',file:'assets/audio/IQRO.mp3'},
  {t:'Sesi Potret',a:'Unknown Artist',d:'--:--',file:'assets/audio/Sesi Potret.mp3'},
  {t:'Jatuh Suka',a:'TULUS',d:'--:--',file:'assets/audio/TULUS - Jatuh Suka.mp3'},
];
function formatTime(sec){
  const m=Math.floor(sec/60);
  const s=Math.floor(sec%60).toString().padStart(2,'0');
  return `${m}:${s}`;
}
function buildPl(){
  const el=document.getElementById('pllist');
  if(el.children.length) return;
  songs.forEach((s,i)=>{
    const d=document.createElement('div'); d.className='pl-item';
    if(i===currentSongIndex) d.classList.add('active');
    d.innerHTML=`
      <div class="pl-num">${i+1}</div>
      <div class="pl-thumb">🎵</div>
      <div class="pl-info">
        <div class="pl-title">${s.t}</div>
        <div class="pl-artist">${s.a}</div>
      </div>
      <div class="pl-dur">${s.d}</div>
    `;
    d.addEventListener('click',()=>setSong(i,true));
    el.appendChild(d);
    const probe=new Audio(s.file);
    probe.addEventListener('loadedmetadata',()=>{
      d.querySelector('.pl-dur').textContent=formatTime(probe.duration);
    });
  });
}

/* ── SCROLL REVEAL ── */
const obs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('vis'); });
},{threshold:.12});
document.querySelectorAll('.rv').forEach(el=>obs.observe(el));

/* UI EVENTS */
document.getElementById('heroCta').addEventListener('click',()=>{
  document.getElementById('dash').scrollIntoView({behavior:'smooth'});
});
document.getElementById('pbtn').addEventListener('click',togglePlay);
document.getElementById('mbtn').addEventListener('click',togglePlay);
document.getElementById('loveCta').addEventListener('click',activateLove);

document.querySelectorAll('[data-modal]').forEach(card=>{
  card.addEventListener('click',()=>openM(card.dataset.modal));
});
document.querySelectorAll('[data-close-modal]').forEach(btn=>{
  btn.addEventListener('click',()=>closeM(btn.dataset.closeModal));
});

/* ── PERIODIC HEARTS ── */
setInterval(()=>{
  if(document.getElementById('main').classList.contains('show')) hearts(1);
},4000);
