/* Workspace enhancements and component helpers. */

(()=>{
// ===== smooth, rounded, outlined wires =====
const rr=(P,r=14)=>{if(P.length<3)return'M'+P.map(p=>p.x+','+p.y).join('L');let d='M'+P[0].x+','+P[0].y;for(let i=1;i<P.length-1;i++){const a=P[i-1],b=P[i],c=P[i+1],l1=Math.hypot(b.x-a.x,b.y-a.y)||1,l2=Math.hypot(c.x-b.x,c.y-b.y)||1,k=Math.min(r,l1/2,l2/2);d+=`L${b.x+(a.x-b.x)/l1*k},${b.y+(a.y-b.y)/l1*k}Q${b.x},${b.y} ${b.x+(c.x-b.x)/l2*k},${b.y+(c.y-b.y)/l2*k}`}const z=P[P.length-1];return d+'L'+z.x+','+z.y};
const dw=window.drawWires;window.drawWires=function(){dw();const L=document.querySelector('#wl');let o='';L.querySelectorAll('path.wire,path.wh2').forEach(p=>{const i=+p.dataset.w,w=S.wires[i];if(!w)return;let d;try{d=rr(wroute(w))}catch(e){return}p.setAttribute('d',d);if(p.classList.contains('wire'))o+=`<path d="${d}" fill="none" stroke="#02041a" stroke-opacity=".6" stroke-width="7" stroke-linejoin="round" stroke-linecap="round" pointer-events="none"/>`});L.insertAdjacentHTML('afterbegin',o)};
// ===== realistic microcontroller artwork =====
const R=(x,y,w,h,f,s='#0007',rx=1.5)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}" stroke="${s}" stroke-width=".8"/>`,
 T=(x,y,s,z=8,f='#fff',a='middle')=>`<text x="${x}" y="${y}" text-anchor="${a}" font-size="${z}" font-family="Arial,sans-serif" font-weight="700" fill="${f}" fill-opacity=".88" pointer-events="none">${s}</text>`,
 QF=(x,y,s,l)=>{const n=Math.max(4,Math.floor(s/4));let g='';for(let i=0;i<n;i++){const o=3+i*(s-6)/(n-1);g+=`<path d="M${x+o},${y-2.5}v2.5M${x+o},${y+s}v2.5M${x-2.5},${y+o}h2.5M${x+s},${y+o}h2.5" stroke="#cfd3dd" stroke-width="1.3"/>`}return g+R(x,y,s,s,'#14141a','#444')+`<circle cx="${x+5}" cy="${y+5}" r="1.6" fill="#555"/>`+T(x+s/2,y+s/2+2,l,Math.min(8,s/4.5),'#b7bccf')},
 DIP=(x,y,w,h,l)=>{let g='';for(let i=0;i<14;i++){const o=6+i*(w-12)/13;g+=R(x+o-1.6,y-3,3.2,4,'#cfd3dd','none',.5)+R(x+o-1.6,y+h-1,3.2,4,'#cfd3dd','none',.5)}return g+R(x,y,w,h,'#17171d','#444',2)+`<path d="M${x},${y+h/2-5}a5,5 0 0 1 0,10" fill="#050508"/>`+T(x+w/2,y+h/2+3,l,8,'#aeb4c8')},
 USB=(x,y,w,h)=>R(x,y,w,h,'#c9ced6','#6b7280',2)+R(x+4,y+4,w-8,h-8,'#7b8494','#4b5563',1)+R(x+w*.1,y+h*.12,w*.35,h*.76,'#e7ebf2','none',1),
 MU=(x,y)=>R(x,y,22,15,'#c9ced6','#6b7280',2)+R(x+2,y+4,18,7,'#1b1f2a','#333',1)+R(x+5,y+6,12,3,'#8c93a4','none',.5),
 UC=(x,y)=>R(x,y,22,14,'#c9ced6','#6b7280',5)+R(x+3,y+4,16,6,'#1b1f2a','#333',3),
 JK=(x,y,w,h)=>R(x,y,w,h,'#15151a','#444',3)+`<circle cx="${x+w*.55}" cy="${y+h/2}" r="${h*.28}" fill="#0a0a0d" stroke="#555"/>`+R(x+w*.1,y+h*.35,w*.2,h*.3,'#aab0bd','none',1),
 XT=(x,y,w,h,l)=>R(x,y,w,h,'#d4d8e0','#7b8494',h/2)+T(x+w/2,y+h/2+2.5,l,6,'#333'),
 BT=(x,y,s,c)=>R(x,y,s,s,'#aab0bd','#555',2)+`<circle cx="${x+s/2}" cy="${y+s/2}" r="${s*.32}" fill="${c}" stroke="#222"/>`,
 LD=(x,y,c)=>R(x,y,9,5,c,'#0008',1)+`<rect x="${x-2}" y="${y-2}" width="13" height="9" rx="3" fill="${c}" opacity=".25"/>`,
 CP=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#c4c8d0" stroke="#666"/><path d="M${x+r*.3},${y-r}A${r},${r} 0 0 1 ${x+r*.3},${y+r}Z" fill="#222" opacity=".8"/>`,
 HD=(x,y,c,r)=>{let g=R(x,y,c*8+2,r*8+2,'#111','#333',1);for(let i=0;i<c;i++)for(let j=0;j<r;j++)g+=R(x+2+i*8,y+2+j*8,4,4,'#e6c76a','#8a6a1a',.5);return g},
 BERRY=(x,y)=>`<circle cx="${x}" cy="${y}" r="3.2" fill="#c51a4a"/><circle cx="${x+5}" cy="${y+1}" r="3.2" fill="#c51a4a"/><circle cx="${x+2.5}" cy="${y+5}" r="3.2" fill="#c51a4a"/><path d="M${x-1},${y-4}q3,-5 8,-1q-3,5 -8,1z" fill="#4caf50"/>`,
 ANT=(x,y,w,h)=>{let d='M'+x+','+(y+h);for(let i=0;i<6;i++){d+=`V${y+(i%2?h:0)}h${w/6}`}return `<path d="${d}" fill="none" stroke="#d9b45a" stroke-width="1.6"/>`},
 MOD=(x,y,w,h,l,l2='ESPRESSIF')=>R(x,y,w,h,'#d7dbe3','#6b7280',2)+R(x+2,y+2,w-4,h-4,'none','#aab0bd',1)+T(x+w/2,y+h/2,l,7,'#374151')+T(x+w/2,y+h/2+9,l2,5,'#4b5563'),
 INF=(x,y)=>`<path d="M${x-14},${y}c0,-9 12,-9 14,0c2,9 14,9 14,0c0,-9 -12,-9 -14,0c-2,9 -14,9 -14,0z" fill="none" stroke="#fff" stroke-width="3" stroke-opacity=".9"/>${T(x-8,y+3,'−',9)}${T(x+8,y+3,'+',9)}`;
const BCOL={uno:'#00878f',unor4:'#00878f',leo:'#00878f',mega:'#00878f',due:'#2b6cb0',nano:'#1b4fa8',nanoesp32:'#2563a8',pro:'#b3262f',pico:'#0b7a3d',picow:'#0b7a3d',pico2:'#0b7a3d',teensy40:'#0a5d34',bluepill:'#1c4db0',esp32:'#14171f',s2:'#14171f',s3:'#14171f',c3:'#14171f',nodemcu:'#14171f',xiao:'#20242e',tiny85:'#1b4fa8'};
const ART={uno:(W,H,k)=>USB(-10,H*.1,66,60)+JK(-10,H*.66,62,50)+BT(66,22,22,'#d62828')+(k=='unor4'?QF(W*.48,H*.38,54,'RA4M1')+MOD(W*.7,H*.16,52,34,'ESP32-S3','')+T(W*.36,H*.26,'UNO R4',12):QF(W*.18,H*.42,32,'ATMEGA16U2')+DIP(W*.46,H*.52,150,34,'ATMEGA328P-PU')+T(W*.36,H*.27,'UNO',14))+XT(W*.34,H*.34,28,12,'16.000')+CP(96,H*.74,9)+CP(122,H*.74,9)+R(150,H*.62,22,13,'#14141a','#444')+LD(W*.6,H*.3,'#ffd24d')+LD(W*.66,H*.3,'#3ddc84')+LD(W*.72,H*.3,'#ffb020')+HD(W-52,H*.44,3,2)+T(W*.36,H*.2,'ARDUINO',18)+INF(W*.6,H*.2),
 leo:(W,H)=>MU(-5,H*.12)+JK(-10,H*.66,62,50)+BT(66,22,22,'#d62828')+QF(W*.4,H*.42,40,'ATMEGA32U4')+XT(W*.3,H*.34,28,12,'16.000')+CP(96,H*.74,9)+LD(W*.6,H*.3,'#3ddc84')+T(W*.36,H*.22,'LEONARDO',14),
 mega:(W,H)=>USB(-10,H*.1,66,60)+JK(-10,H*.66,62,50)+BT(66,22,22,'#d62828')+QF(W*.5,H*.4,58,'ATMEGA2560')+QF(W*.2,H*.45,28,'16U2')+XT(W*.36,H*.3,28,12,'16.000')+CP(96,H*.76,9)+CP(122,H*.76,9)+LD(W*.7,H*.28,'#ffd24d')+HD(W-52,H*.42,3,2)+T(W*.4,H*.2,'ARDUINO MEGA 2560',14),
 due:(W,H)=>MU(-5,H*.14)+MU(-5,H*.4)+JK(-10,H*.7,62,50)+QF(W*.5,H*.38,62,'SAM3X8E')+BT(60,H*.55,18,'#d62828')+XT(W*.34,H*.3,28,12,'12MHz')+T(W*.4,H*.2,'ARDUINO DUE',14),
 nano:(W,H,k)=>R(-5,H/2-9,22,18,'#c9ced6','#6b7280',2)+R(0,H/2-5,14,10,'#2a2f3a','#333',1)+QF(W*.45,H/2-14,28,k=='nanoesp32'?'ESP32-S3':'ATMEGA328')+QF(W*.22,H/2-8,16,'FT232')+XT(W*.34,H/2-18,16,7,'16M')+BT(W*.08,H*.2,8,'#d62828')+LD(W*.62,H/2-3,'#3ddc84')+T(W*.7,H/2+4,k=='nanoesp32'?'NANO ESP32':'NANO',9),
 pro:(W,H)=>QF(W*.45,H/2-14,28,'ATMEGA328')+XT(W*.3,H/2-9,18,8,'16M')+LD(W*.7,H/2-3,'#3ddc84')+BT(W*.15,H/2-6,9,'#d62828')+T(W*.55,H/2+22,'PRO MINI',7),
 pico:(W,H,k)=>MU(-4,H/2-8)+BT(32,H/2-7,14,'#f4f4f4')+QF(W*.48,H/2-17,34,'RP2040')+R(W*.7,H/2-9,24,18,'#14141a','#444')+T(W*.7+12,H/2+3,'W25Q16',5,'#aab')+BERRY(W*.3,H*.28)+T(W*.5,H*.28,'Raspberry Pi Pico'+(k=='pico2'?' 2':k=='picow'?' W':''),8)+'<circle cx="'+W*.5+'" cy="'+(H-16)+'" r="2" fill="#e6c76a"/><circle cx="'+(W*.5+8)+'" cy="'+(H-16)+'" r="2" fill="#e6c76a"/><circle cx="'+(W*.5+16)+'" cy="'+(H-16)+'" r="2" fill="#e6c76a"/>'+(k=='picow'?MOD(W*.82,H/2-14,34,28,'CYW43','Infineon'):''),
 teensy40:(W,H)=>MU(-4,H/2-8)+QF(W*.5,H/2-17,34,'IMXRT1062')+BT(30,H/2-6,12,'#f4f4f4')+R(W*.78,H/2-5,12,10,'#14141a')+T(W*.3,H/2-14,'TEENSY 4.0',8),
 bluepill:(W,H)=>MU(-4,H/2-8)+QF(W*.45,H/2-15,30,'STM32F103')+XT(W*.3,H/2-8,20,8,'8MHz')+BT(W*.62,H*.22,10,'#d62828')+R(W*.7,H/2-3,16,6,'#ffd24d','#a58b1a')+LD(W*.78,H*.3,'#3ddc84')+T(W*.55,H/2+22,'STM32 BLUE PILL',7),
 esp32:(W,H,k)=>MU(-4,H/2-8)+MOD(W*.5,H*.16,W*.3,H*.68,k=='s2'?'ESP32-S2':k=='s3'?'ESP32-S3':k=='c3'?'ESP32-C3':k=='nodemcu'?'ESP-12E':'ESP-WROOM-32')+ANT(W*.82,H*.2,W*.1,H*.6)+QF(W*.2,H/2-8,16,'CP2102')+BT(W*.1,H*.74,8,'#2563eb')+BT(W*.1,H*.2,8,'#444')+LD(W*.4,H/2-3,'#3b82f6')+R(W*.34,H/2+6,14,9,'#14141a')+T(W*.3,H*.5-16,k=='nodemcu'?'NodeMCU':'DEVKIT',6),
 xiao:(W,H)=>UC(-4,H/2-7)+MOD(W*.45,H*.12,W*.4,H*.76,'ESP32-C3','Seeed')+ANT(W*.88,H*.2,W*.08,H*.6)+BT(W*.12,H*.1,7,'#444'),
 tiny85:(W,H)=>DIP(W*.3,H/2-8,40,18,'ATTINY85')};
ART.unor4=ART.uno;ART.nanoesp32=ART.nano;ART.picow=ART.pico;ART.pico2=ART.pico;ART.s2=ART.esp32;ART.s3=ART.esp32;ART.c3=ART.esp32;ART.nodemcu=ART.esp32;
const ob=window.drawBoard2,re=/(fill="url\(#gl\)" pointer-events="none"\/>)[\s\S]*?(<rect x="[^"]*" y="[^"]*" width="[^"]*" height="14" rx="2" fill="#0d0d0d"\/>)/;
window.drawBoard2=function(){const s=ob(),k=S.bt,f=ART[k];if(!f||!re.test(s))return s;let a;try{a=f(S.bw,S.bh,k)}catch(e){return s}
 return s.replace(/style="fill:[^"]*"/,`style="fill:${BCOL[k]||'#14171f'}"`).replace(re,(m,g1,g2)=>g1+a+g2).replace(/<text x="14" y="[^"]*" font-size="11" font-weight="700"[^>]*>[^<]*<\/text>/,'')};
try{draw()}catch(e){}
})();
