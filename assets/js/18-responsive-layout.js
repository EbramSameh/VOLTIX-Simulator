/* Responsive layout and workspace controls. */

(()=>{const $q=s=>document.querySelector(s),B=document.body,ls=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){}};
// ===== collapsible sidebars, focus mode, tidy header =====
const mk=(id,txt,tip,fn)=>{const b=document.createElement('button');b.id=id;b.className='tb2';b.textContent=txt;b.title=tip;b.onclick=fn;return b};
const upd=()=>{$q('#tl').classList.toggle('on',!B.classList.contains('lc'));$q('#tr').classList.toggle('on',!B.classList.contains('rc'));ls('vx_lc',B.classList.contains('lc')?1:0);ls('vx_rc',B.classList.contains('rc')?1:0);setTimeout(()=>window.dispatchEvent(new Event('resize')),260)};
const tog=c=>{B.classList.toggle(c);upd()};
const tl=mk('tl','☰ Parts','Show / hide the parts list ( [ )',()=>tog('lc')),tr=mk('tr','▤ Code','Show / hide the code panel ( ] )',()=>tog('rc')),fc=mk('fc','⛶ Focus','Hide both side panels ( F )',()=>{const h=B.classList.contains('lc')&&B.classList.contains('rc');B.classList.toggle('lc',!h);B.classList.toggle('rc',!h);upd()});
const v3=$q('#v3');v3.before(tl,tr,fc);
if(ls('vx_lc')==='1')B.classList.add('lc');if(ls('vx_rc')==='1')B.classList.add('rc');upd();
document.addEventListener('keydown',e=>{if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.ctrlKey||e.metaKey)return;if(e.key=='[')tog('lc');else if(e.key==']')tog('rc');else if(e.key=='f'||e.key=='F')fc.onclick()});
// Keep useful tools visible in the toolbar instead of hiding them in a More menu.
['#clr','#bom','#lib'].forEach(s=>{const b=$q(s);if(b){b.classList.add('tb2');$q('#v3').before(b)}});
const fresh=$q('#vx-new-circuit');
if(fresh)fresh.addEventListener('click',()=>{
  stop();S.bt='uno';layout();S.parts=[];S.wires=[];S.n=0;S.sel=null;S.pend=null;
  $q('#bd').value='uno';$q('#ex').value='';$q('#code').value='void setup() {\n}\n\nvoid loop() {\n}\n';
  draw();lnu();fit();tab('code');go('sim');toast('Fresh Arduino Uno circuit ready.');
});
// parts list: categories start collapsed (first one open), with an expand/collapse-all toggle
const ds=()=>[...document.querySelectorAll('#pal details')];ds().forEach((d,i)=>d.open=i<1);
const ex=document.createElement('button');ex.textContent='⇕';ex.title='Expand / collapse all categories';ex.style.cssText='flex:0 0 28px;padding:3px';ex.onclick=()=>{const any=ds().some(d=>d.open);ds().forEach(d=>d.open=!any)};$q('#chips').appendChild(ex);
// ===== extra detail layered on top of the original part art (keeps all animation ids) =====
const L=(x1,y1,x2,y2,s='#fff',w=1,o=1)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${s}" stroke-width="${w}" opacity="${o}"/>`,
 C=(x,y,r,f,s='none',w=1,o=1)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" stroke="${s}" stroke-width="${w}" opacity="${o}"/>`,
 R=(x,y,w,h,f,s='none',rx=1,o=1)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}" stroke="${s}" stroke-width=".7" opacity="${o}"/>`,
 TX=(x,y,s,z=5,f='#fff',o=.8)=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="${z}" font-family="Arial" font-weight="700" fill="${f}" opacity="${o}">${s}</text>`;
const DK={led:()=>`<path d="M80,58V49l-1.5,-3h7l-1.5,3V58" fill="#9aa0b8" opacity=".75"/>${L(94,58,94,45,'#c9cde2',1.4)}<path d="M85,46Q90,40 94,45" stroke="#d4af37" fill="none" stroke-width=".8"/>${R(83,47,4,2.5,'#d4af37')}${L(76,48,76,58,'#fff',2,.55)}<path d="M82,74l1.5,3M94,70l1.5,3" stroke="#cbd0ff" stroke-width="1.6"/>`,
 rgb:()=>`${R(79,47,3,4,'#ff4d6d')}${R(85,47,3,4,'#3ddc84')}${R(91,47,3,4,'#4da3ff')}${L(76,48,76,58,'#fff',2,.55)}`,
 res:()=>R(64,43,7,18,'#a47e52','none',3,.55)+R(105,43,7,18,'#a47e52','none',3,.55)+R(68,44.5,40,3.5,'#fff','none',1.7,.28)+L(56,52,64,52,'#f1f3ff',2.6,.9),
 btn:()=>R(72,40,32,24,'none','#aeb4c4',5,.8)+C(88,52,14,'none','#7a1418',1.5,.7)+`<ellipse cx="83" cy="46" rx="6" ry="3" fill="#fff" opacity=".35"/>`+[[70,36],[106,36],[70,68],[106,68]].map(([x,y])=>C(x,y,1,'#2a2f6b')).join(''),
 us:()=>[74,102].map(x=>C(x,50,9,'none','#9aa6d6',.8,.8)+C(x,50,3.5,'#0b1220')+[3,5,7].map(r=>C(x,50,r,'none','#cfd4ff',.4,.5)).join('')+C(x,50,12,'none','#e6e9f7',1.4,.9)).join('')+R(83,40,10,4.5,'#d9dde6','#7b8494',2)+R(82,57,12,6,'#15151b','#444')+TX(88,69,'HC-SR04',4.2,'#dfe6ff',.9)+[0,1,2,3].map(i=>TX(68+[0,12,28,40][i],82,['V','T','E','G'][i],4,'#cbd0ff')).join(''),
 dht:()=>[78,84,90,96].map(x=>L(x,32,x,56,'#1d4ed8',.5,.55)).join('')+R(69,29,38,3,'#fff','none',1.5,.25)+R(80,58,16,6,'#15151b','#333'),
 pir:()=>[0,60,120,180,240,300].map(a=>`<ellipse cx="88" cy="52" rx="3.2" ry="10" fill="#fff" fill-opacity=".1" stroke="#fff" stroke-opacity=".3" stroke-width=".5" transform="rotate(${a} 88 52)"/>`).join('')+C(88,52,19,'none','#c9ced6',1.5,.8)+R(66,67,9,6,'#f59e0b','none',1)+R(98,66,8,8,'#2563eb','#9aa6d6',1)+C(102,70,2,'#c9ced6'),
 servo:()=>R(50,44,10,18,'#2d58d6','#bcd0ff',2)+R(112,44,10,18,'#2d58d6','#bcd0ff',2)+C(55,48,1.6,'#0b1020')+C(55,58,1.6,'#0b1020')+C(117,48,1.6,'#0b1020')+C(117,58,1.6,'#0b1020')+R(66,33,22,7,'#2a52c9','#bcd0ff',2)+C(88,52,2.3,'#9aa0b8','#333')+TX(76,63,'SG90',5,'#dbe5ff',.9)+`<path d="M60,60q-8,6 -10,16M60,62q-6,8 -6,16M60,64q-3,9 -2,18" stroke="#e8590c" stroke-width="1.2" fill="none"/><path d="M60,64q-3,9 -2,18" stroke="#8b5a2b" stroke-width="1.2" fill="none"/>`,
 buz:()=>C(88,52,22,'none','#05060f',1.6,.7)+`<path d="M70,40a22,22 0 0 1 14,-9" stroke="#fff" stroke-width="2" fill="none" opacity=".25"/>`+C(88,52,10,'none','#3b3f66',.8,.6),
 pot:()=>Array.from({length:16},(_,i)=>{const a=i*22.5*Math.PI/180;return L(88+14*Math.cos(a),52+14*Math.sin(a),88+16*Math.cos(a),52+16*Math.sin(a),'#e6e8ff',1,.5)}).join('')+L(82,52,94,52,'#0b1020',1.4,.5)+C(88,52,19,'none','#c4b5fd',.6,.4),
 ldr:()=>C(88,50,16,'none','#8a5a14',1,.6)+`<path d="M74,45h28M74,52h28" stroke="#fff" stroke-opacity=".18" stroke-width="1.5"/><ellipse cx="80" cy="42" rx="5" ry="2.5" fill="#fff" opacity=".3"/>`};
const sh=window.shape;window.shape=function(t,k,id,d,ohm,col){let s=sh(t,k,id,d,ohm,col);const f=DK[t]||(k=='led'?DK.led:k=='rgb'?DK.rgb:k=='res'?DK.res:k=='btn'?DK.btn:k=='us'?DK.us:k=='dht'?DK.dht:k=='servo'?DK.servo:null);return f?s+`<g pointer-events="none">${f()}</g>`:s};
try{palBuild();document.querySelectorAll('#pal [data-add]').forEach(b=>{const k=b.dataset.add,w=SUPK[k]=='Full'||PD[k]||(typeof AN!='undefined'&&AN[k])||(typeof LIN!='undefined'&&LIN[k])||new Set(['an','dig','sx','joy','hb','sd','us','dht','servo','rgb','relay','disp','seg','neo','out','step','reg','led','res','btn','sw','bat','cap','ind','dio','fuse','dmm','i2c']).has(PT[k][4]);b.dataset.w=w?'w':'p';b.insertAdjacentHTML('beforeend',`<em class="bdg ${w?'w':'p'}">${w?'works':'basic'}</em>`)});ds().forEach((d,i)=>d.open=i<1);draw()}catch(e){console.warn(e)}
})();
