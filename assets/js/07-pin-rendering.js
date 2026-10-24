/* Board pin rendering and pin interaction helpers. */

(()=>{const $q=s=>document.querySelector(s);
const R=(x,y,w,h,f,r=2,s='#0007')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${f}" stroke="${s}"/>`,
C=(x,y,r,f,s='#0007')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" stroke="${s}"/>`,
T=(x,y,s,f='#fff',z=6)=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="${z}" font-family="JetBrains Mono,monospace" fill="${f}">${s}</text>`,
B=(f,w=60,h=46,y=30)=>R(88-w/2,y,w,h,f,3,'#ffffff44')+R(88-w/2,y,w,h,'url(#gl)',3,'none')+`<rect x="${88-w/2+3}" y="${y+3}" width="${w-6}" height="${h-6}" rx="2" fill="none" stroke="#ffffff30" stroke-dasharray="2 2"/>`+Array.from({length:Math.max(2,Math.floor((w-14)/7))},(_,k)=>R(88-w/2+7+k*7,y+h-8,4,5,'#e6c76a',1,'#8a6a1a')).join('')+[[1,1],[1,-1],[-1,1],[-1,-1]].map(([a,b])=>C(88+a*(w/2-4),y+(b>0?h-4:4),1.8,'#0b0f2a','#d9b45a')).join(''),
CH=(x,y,w,h,l)=>Array.from({length:Math.floor(w/4)},(_,k)=>`<path d="M${x+2+k*4},${y}v-2M${x+2+k*4},${y+h}v2" stroke="#cfd3dd" stroke-width="1.4"/>`).join('')+R(x,y,w,h,'#17171d',1,'#555')+C(x+3,y+3,1,'#555','none')+(l?T(x+w/2,y+h/2+2,l,'#b7bccf',5):''),
PADS=(x,y,n,gap=6)=>Array.from({length:n},(_,i)=>R(x+i*gap,y,3,8,'#e6c76a',1,'none')).join(''),
TO92=(c='#15151c')=>`<path d="M78,38a10,10 0 0 1 20,0V62H78Z" fill="${c}" stroke="#555"/>`+[80,88,96].map(x=>`<line x1="${x}" y1="62" x2="${x}" y2="82" stroke="#cfd3e6" stroke-width="2"/>`).join(''),
BLU='#1553b8',GRN='#0b7a3e',RED='#b3202a',PUR='#5b2a86',BLK='#17171f';
const A={
mq135:i=>B(BLU)+C(88,52,17,'#aab0bd','#fff6')+C(88,52,12,'#7c8292')+'<path d="M78,52h20M80,46h16M80,58h16" stroke="#444"/>'+T(88,34,'MQ-135','#fff',5),
soilc:i=>R(70,24,36,76,BLK,4,'#fff3')+R(70,24,36,22,GRN,3)+CH(80,28,16,10)+'<path d="M78,52v44M98,52v44" stroke="#c9a14a" stroke-width="3"/>'+T(88,60,'SOIL','#9aa',5),
wlevel:i=>R(68,24,40,76,GRN,3,'#fff4')+Array.from({length:9},(_,k)=>R(74,34+k*7,28,3.5,'#e0b84f',1,'none')).join('')+R(78,26,20,6,'#222',1),
ph:i=>B(BLU,48,40,34).replace(/x="/,'x="')+C(112,52,10,'#c8ccd6','#fff')+C(112,52,4,'#e6c76a')+'<rect x="104" y="64" width="16" height="30" rx="3" fill="#dfe6ee"/>'+T(66,56,'pH','#fff',8),
tds:i=>B(GRN,46,40,34)+R(104,34,16,12,'#111')+'<path d="M108,46v38M116,46v38" stroke="#d9d9d9" stroke-width="3"/>'+T(66,56,'TDS','#fff',7),
turb:i=>B(GRN,40,36,36)+C(102,52,17,'#f2f2f2','#999')+C(102,52,9,'#bfe3ff','#789')+T(64,58,'TURB','#fff',5),
max30:i=>B(PUR,44,44)+R(76,38,24,16,'#111',2)+C(82,46,3,'#ff3b3b')+C(94,46,3,'#7fff7f')+CH(76,60,24,10,'MAX'),
gps:i=>B(BBL(),70,50)+R(62,34,30,30,'#e9d9a6',2,'#a08f50')+C(77,49,6,'#c9b872')+CH(98,38,16,12,'U-BLOX')+T(98,64,'NEO-6M','#fff',5),
rfid:i=>B(BLU,76,52,28)+R(60,34,36,34,'none',2,'#eee')+R(66,40,24,22,'none',2,'#eee')+R(72,46,12,10,'none',2,'#eee')+CH(100,38,18,14,'MFRC'),
hc05:i=>B(GRN,58,48)+R(60,34,24,24,'#c7ccd6',2,'#fff7')+CH(88,34,20,10,'BC417')+C(112,38,2,'#4da3ff')+T(88,72,'HC-05','#fff',6),
nrf:i=>B(GRN,40,50,28)+`<path d="M76,34h6v-4h6v8h6v-8h6v8h4" stroke="#d9b45a" fill="none" stroke-width="2"/>`+R(92,48,16,12,'#c7ccd6')+CH(70,50,12,12,'nRF')+T(88,76,'nRF24L01','#fff',5),
lora:i=>B(BLU,64,50,28)+R(60,38,32,26,'#c7ccd6',2,'#fff7')+T(76,54,'SX1278','#222',5)+'<path d="M104,38c8,0 8,4 0,4s-8,4 0,4s8,4 0,4s-8,4 0,4" stroke="#d9b45a" fill="none" stroke-width="2"/>',
mpu9250:i=>B(PUR,38,40)+CH(78,40,20,20,'MPU')+T(88,32,'IMU','#fff',5),
rtc:i=>B(BLU,64,48)+C(88,52,16,'#d5d9e2','#fff')+C(88,52,12,'none','#9aa')+T(88,54,'3V','#555',6)+CH(62,34,14,10,'DS')+PADS(64,72,8),
sdc:i=>B(BLU,64,48)+R(64,34,48,22,'#aab0bd',2,'#fff')+R(74,42,28,14,'#111')+PADS(66,66,6),
hx711:i=>B(RED,46,34,34)+CH(78,40,22,12,'HX711')+R(62,60,8,8,'#3a7')+PADS(62,26,1),
joy:i=>B(BLU,60,58,26)+C(88,54,14,'#222','#555')+C(88,54,9,'#3a3a44','#777')+T(88,92,'JOY','#fff',5),
enc:i=>B(BLU,60,46)+C(88,52,15,'#bcc2cf','#fff')+C(88,52,10,'#8f96a6')+'<path d="M88,52V43" stroke="#222" stroke-width="2"/>'+PADS(70,74,5,8),
keypad:i=>R(54,26,68,68,'#d7dae3',4,'#fff6')+Array.from({length:16},(_,k)=>R(60+(k%4)*15,32+Math.floor(k/4)*15,12,12,'#4b5370',2,'#222')).join(''),
irr:i=>`<path d="M76,64V44a12,12 0 0 1 24,0V64Z" fill="#14141a" stroke="#555"/>`+C(88,46,4,'#222','#777')+[80,88,96].map(x=>`<line x1="${x}" y1="64" x2="${x}" y2="84" stroke="#cfd3e6" stroke-width="2"/>`).join(''),
lux:i=>B(BLU,52,44)+C(76,50,12,'#d9a45a','#fff6')+'<path d="M68,48h16l-12,4h16l-12,4h8" stroke="#6b3a10" fill="none"/>'+T(100,58,'LDR','#fff',6),
press:i=>B(GRN,52,44)+C(76,52,11,'#b6bcc8','#fff')+C(76,52,4,'#333')+T(102,56,'PRS','#fff',6),
hallx:i=>TO92()+T(88,52,'49E','#aab',6),ds18:i=>TO92()+T(88,52,'DS18','#aab',5),
sndl:i=>B(BLU,56,46)+C(76,50,9,'#111','#888')+C(76,50,4,'#444')+R(94,40,14,14,'#2a6fd6',2)+T(101,66,'MIC','#fff',5),
acs712:i=>B(BLU,64,48)+R(60,36,18,22,'#2fae66',2)+CH(88,40,16,12,'ACS')+R(96,38,12,6,'#ccc'),
vsens:i=>B(BLU,56,44)+R(60,36,16,18,'#2a6fd6',2,'#fff6')+R(80,40,8,4,'#111')+R(92,40,8,4,'#111'),
uvs:i=>B(PUR,40,40)+R(78,38,20,14,'#9b5de5',2)+T(88,66,'UV','#fff',7),
ecg:i=>B(RED,56,44)+C(110,50,6,'#111')+CH(66,40,18,12,'AD8232'),
emg:i=>B(BLK,56,44)+C(104,52,7,'#c9a14a')+CH(64,40,18,12,'EMG'),
eeg:i=>B(BLK,56,44)+C(78,50,9,'#e0e4ee')+C(104,50,5,'#c9a14a')+T(88,72,'EEG','#9ab',6),
bme280:i=>B(PUR,34,34,34)+R(78,40,20,18,'#c7ccd6',2)+C(88,49,2,'#333')+T(88,28,'BME280','#fff',5),
sht31:i=>B(BLU,34,34,34)+R(78,40,18,18,'#e9e9ef')+C(87,49,5,'#cfd3dd')+T(88,28,'SHT31','#fff',5),
vl53:i=>B(PUR,40,32,34)+R(72,38,24,14,'#111')+C(79,45,4,'#344')+C(90,45,4,'#612')+T(88,28,'VL53','#fff',5),
tcs:i=>B('#f1f1f1',40,40,32)+C(88,50,8,'#c9d6e8','#999')+C(76,60,3,'#ffd')+C(100,60,3,'#ffd'),
apds:i=>B(PUR,40,34,34)+R(76,38,24,12,'#111')+C(82,44,3,'#533')+C(94,44,3,'#533')+T(88,28,'APDS','#fff',5),
qmc:i=>B(BLU,36,36,32)+CH(80,42,16,16,'QMC')+T(88,28,'HMC','#fff',5),
ads:i=>B(BLU,60,40)+CH(74,40,20,12,'ADS1115')+PADS(62,66,8),dac:i=>B(PUR,44,34,34)+CH(80,42,16,14,'4725'),
pca:i=>B(BLU,76,50,28)+CH(76,56,18,10,'PCA')+Array.from({length:8},(_,k)=>R(54+k*9,34,6,14,'#111',1)).join(''),
max485:i=>B(BLU,58,44)+CH(66,38,22,14,'MAX485')+R(96,38,14,18,'#2fae66',2),
npk:i=>B(BLK,40,34,30)+CH(78,40,20,10,'485')+[72,88,104].map(x=>R(x-3,62,6,34,'#cfd3dd',1)).join(''),
lm7805:i=>R(70,26,36,18,'#bfc4d0',2)+C(88,34,4,'#222')+R(70,44,36,26,BLK,2,'#666')+T(88,60,'7805','#aab',7)+[76,88,100].map(x=>`<line x1="${x}" y1="70" x2="${x}" y2="88" stroke="#cfd3e6" stroke-width="3"/>`).join(''),
ams1117:i=>R(72,34,32,26,BLK,2,'#666')+R(76,28,24,8,'#bfc4d0',1)+T(88,52,'1117','#aab',7)+[76,88,100].map(x=>R(x-2,60,5,12,'#cfd3e6',1,'none')).join(''),
lm2596:i=>B(BLU,70,50,28)+R(60,34,26,26,'#222',3,'#666')+C(100,46,9,'#222','#888')+C(100,46,5,'#aab')+R(60,64,12,8,'#2fae66')+R(104,64,12,8,'#2fae66'),
mt3608:i=>B(BLU,52,40,34)+R(64,40,18,18,'#222',2,'#666')+CH(86,42,14,10,'MT')+R(58,58,10,6,'#2fae66')+R(108,58,10,6,'#2fae66'),
a4988:i=>B(RED,40,52,26)+R(76,32,24,18,'#222',1,'#555')+CH(80,54,16,10,'A4988')+C(110,40,3,'#ccc'),
drv8825:i=>B(PUR,40,52,26)+R(76,32,24,18,'#222',1,'#555')+CH(80,54,16,10,'8825')+C(110,40,3,'#d9b45a')};
function BBL(){return '#0a4aa3'}
const OS=window.shape;
window.shape=function(t,k,id,d,ohm,col){const f=A[t];if(f)return`<g ${id?`id="i-${id}" `:''}>${f(id)}</g>`;
 if(['sx','vis','i2c','sd','reg'].includes(k)&&!/^(led|res|btn|us|dht|servo|disp)/.test(k)){const h=[...t].reduce((a,c)=>a*31+c.charCodeAt(0),7)%360;return B(`hsl(${h},55%,32%)`)+CH(76,40,24,14)+T(88,70,(d[0]||t).slice(0,12),'#fff',5)}
 return OS(t,k,id,d,ohm,col)};
// 3D toolbar
const bar=document.createElement('div');bar.id='bar3';bar.innerHTML='<button data-v="0,0">Top</button><button data-v="48,-18">Iso</button><button data-v="72,0">Front</button><button id="spin">Spin</button>';$q('#cvw').appendChild(bar);
let sp=0;bar.onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.id=='spin'){sp=!sp;b.style.background=sp?'#8b6cff':'';return}const[a,z]=b.dataset.v.split(',').map(Number);rx3=a;rz3=z;s3=1;set3()};
(function loop(){if(sp&&V3&&!O3){rz3+=.35;set3()}requestAnimationFrame(loop)})();
$q('#cvw').addEventListener('dblclick',()=>{if(V3){rx3=48;rz3=-18;s3=1;set3()}});
// Auto-wire
const ab=document.createElement('button');ab.id='awb';ab.textContent='⚡ Auto-wire';ab.title='Select a part, then click to wire it automatically';$q('#v3').after(ab);
ab.onclick=()=>{const p=S.parts.find(q=>q.id==S.sel);if(!p)return toast('Click a part first, then press Auto-wire.',1);
 const bp=S.bp,used=new Set(S.wires.flatMap(w=>[w.a,w.b])),vcc=BD[S.bt][1]>4?'5V':'3V3',ref=q=>'b:'+q.l,pw=n=>bp.find(q=>q.n==n&&q.k!='io'),[sd,sc]=(I2P[S.bt]||[]),
 io=bp.filter(q=>q.k=='io'),free=a=>io.find(q=>!used.has(ref(q))&&!/^(D0|D1|G0|G1|G3)$/.test(q.n)&&(!a||/^A\d|^G(32|33|34|35|36|39)$/.test(q.n)));let n=0;
 pinsOf(p).forEach(l=>{const pr=p.id+':'+l;if(used.has(pr))return;let q=null;
  if(/^(VCC|VIN|V\+|5V|3V3|VDD)$/.test(l))q=pw(BD[S.bt][1]==3.3||/3V3|VDD/.test(l)?'3V3':'5V')||pw(vcc);
  else if(/^(GND|G|C|K|-)$/.test(l))q=pw('GND')||bp.find(x=>/GND/.test(x.n));
  else if(/SDA/.test(l))q=bp.find(x=>x.n==sd);else if(/SCL/.test(l))q=bp.find(x=>x.n==sc);
  else q=free(['sx','an'].includes(p.k)||/^(A0|AO|AOUT|OUT|SIG)$/.test(l));
  if(q){connect(pr,ref(q));used.add(pr);used.add(ref(q));n++}});
 draw();toast(n?`Auto-wired ${n} pin${n>1?'s':''}. Tweak any wire by clicking it.`:'Nothing left to wire on this part.',!n)};
})();
