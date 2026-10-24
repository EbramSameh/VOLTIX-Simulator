/* Additional boards and pin maps. */

(()=>{const $q=s=>document.querySelector(s);
// ===== 1. more microcontrollers =====
const P33=['5V','3V3','VIN','GND','GND2'];
Object.assign(BD,{unor4:['Arduino Uno R4 WiFi',5,[...N(0,13,'D'),...N(0,5,'A')],14,1023,13,0,PA],
 due:['Arduino Due',3.3,[...N(2,13,'D'),...N(20,33,'D'),...N(0,11,'A')],54,4095,13,0,PA],
 nanoesp32:['Arduino Nano ESP32',3.3,[...N(2,13,'D'),...N(0,7,'A')],14,4095,13,0,PA],
 teensy40:['Teensy 4.0',3.3,[...N(0,13,'D'),...N(0,9,'A')],14,1023,13,0,P33],
 picow:['Raspberry Pi Pico W',3.3,G([...N(0,22),26,27,28]),0,1023,25,0,PE],
 pico2:['Raspberry Pi Pico 2',3.3,G([...N(0,22),26,27,28]),0,1023,25,0,PE],
 bluepill:['STM32 Blue Pill',3.3,G(N(0,15).map(Number)),0,4095,13,1,PE],
 xiao:['Seeed XIAO ESP32-C3',3.3,G([2,3,4,5,6,7,8,9,10,20,21]),0,4095,10,1,PE],
 tiny85:['ATtiny85',5,G([0,1,2,3,4]),0,1023,1,1,['5V','GND']]});
Object.assign(I2P,{unor4:[18,19],due:[20,21],nanoesp32:[18,19],teensy40:[18,19],picow:[4,5],pico2:[4,5],bluepill:[7,6],xiao:[6,7],tiny85:[0,2]});
Object.assign(DIM,{unor4:[68.6,53.3],due:[101.6,53.3],nanoesp32:[43,18],teensy40:[35,18],picow:[51,21],pico2:[51,21],bluepill:[53,22.8],xiao:[21,17.8],tiny85:[24,14]});
const cur=$q('#bd').value;$q('#bd').innerHTML=Object.entries(BD).map(([k,b])=>`<option value="${k}">${b[0]}</option>`).join('');$q('#bd').value=cur;
// ===== 2. drivers for sensors that were visual-only =====
const f1=(v,n=1)=>(+v).toFixed(n),T=(t,pd,pr,ms,rd,sup)=>{PD[t]=pd;PR[t]=pr;MS[t]=ms;READ[t]=rd||(p=>ms(p.st));SUP[t]=sup;SUPK[t]='Full'};
const P1=t=>S.parts.find(q=>q.t==t&&pwr(q));
T('gps',{lat:52.0,lng:4.2,spd:0,sat:8,alt:12},[RG('lat','Latitude (°)',-90,90,.0001),RG('lng','Longitude (°)',-180,180,.0001),RG('spd','Speed (km/h)',0,200),RG('sat','Satellites',0,16),RG('alt','Altitude (m)',-100,5000)],s=>f1(s.lat,4)+', '+f1(s.lng,4),null,'Driver model: TinyGPSPlus getters return the slider values');
T('rfid',{card:'none'},[{k:'card',l:'Tap a card',t:'sel',o:['none','card A','card B','tag C']}],s=>s.card,null,'Driver model: MFRC522 PICC_* calls and uid bytes');
T('max30',{bpm:72,finger:'on'},[RG('bpm','Heart rate (BPM)',40,180),{k:'finger',l:'Finger on sensor',t:'sel',o:['on','off']}],s=>s.finger=='on'?s.bpm+' BPM':'no finger',null,'Driver model: MAX30105 getIR / getRed pulsing at the BPM');
T('qmc',{head:0},[RG('head','Heading (°)',0,359)],s=>s.head+'°',null,'Driver model: QMC5883LCompass azimuth and X/Y/Z');
T('pca',{},[],()=>'16 ch',p=>Object.entries(p.st).map(([k,v])=>k+': '+v).join('\n')||'no PWM set yet','Driver model: Adafruit_PWMServoDriver stores each channel');
T('dac',{out:0},[],s=>f1(s.out,2)+' V',null,'Driver model: Adafruit_MCP4725 setVoltage shows the output');
const I=t=>i2c(t),UID={'card A':[0xDE,0xAD,0xBE,0xEF],'card B':[0x12,0x34,0x56,0x78],'tag C':[0xCA,0xFE,0xBA,0xBE]};
class TinyGPSPlus{constructor(){const g=()=>{const p=P1('gps');return p?p.st:null},self=this;self.location={lat:()=>g()?+g().lat:0,lng:()=>g()?+g().lng:0,isValid:()=>!!g()&&g().sat>3,isUpdated:()=>!!g()};self.speed={kmph:()=>g()?+g().spd:0,mph:()=>g()?g().spd*.621:0,isValid:()=>!!g()};self.satellites={value:()=>g()?+g().sat:0,isValid:()=>!!g()};self.altitude={meters:()=>g()?+g().alt:0};self.date={year:()=>new Date().getFullYear(),month:()=>new Date().getMonth()+1,day:()=>new Date().getDate()};self.time={hour:()=>new Date().getUTCHours(),minute:()=>new Date().getUTCMinutes(),second:()=>new Date().getUTCSeconds()};self.charsProcessed=()=>999}encode(){return true}}
class MFRC522{constructor(){this.uid={size:0,uidByte:[]};this.last='none'}PCD_Init(){}PCD_DumpVersionToSerial(){}PICC_IsNewCardPresent(){const p=S.parts.find(q=>q.t=='rfid'&&pwr(q)),c=p?p.st.card:'none',n=c!='none'&&c!=this.last;this.last=c;this.cur=c;return n}PICC_ReadCardSerial(){const u=UID[this.cur];if(!u)return false;this.uid.size=4;this.uid.uidByte=[...u];return true}PICC_HaltA(){}PCD_StopCrypto1(){}}
class MAX30105{begin(){return !!P1('max30')||!!I('max30')}setup(){}setPulseAmplitudeRed(){}setPulseAmplitudeGreen(){}check(){return 1}available(){return 1}nextSample(){}safeCheck(){return true}getFIFOIR(){return this.getIR()}getFIFORed(){return this.getRed()}
 sig(k){const p=S.parts.find(q=>q.t=='max30'&&i2c('max30'));if(!p||p.st.finger!='on')return 4000+Math.random()*50;const ph=Math.sin(performance.now()/1000*p.st.bpm/60*2*Math.PI);return 100000+(ph>.6?1:ph*.4)*4000*k+Math.random()*60}getIR(){return Math.round(this.sig(1))}getRed(){return Math.round(this.sig(.7)-9000)}}
class QMC5883LCompass{init(){}setCalibration(){}setSmoothing(){}read(){}_h(){const p=S.parts.find(q=>q.t=='qmc'&&i2c('qmc'));return p?+p.st.head:0}getAzimuth(){return this._h()}getX(){return Math.round(Math.cos(this._h()*Math.PI/180)*1500)}getY(){return Math.round(Math.sin(this._h()*Math.PI/180)*1500)}getZ(){return -600}getBearing(a){return Math.round(a/22.5)%16}}
class Adafruit_PWMServoDriver{constructor(){}begin(){return true}setPWMFreq(){}setOscillatorFrequency(){}setPWM(c,on,off){const p=S.parts.find(q=>q.t=='pca');if(p)p.st['ch'+c]=off}setPin(c,v){this.setPWM(c,0,v)}writeMicroseconds(c,us){this.setPWM(c,0,Math.round(us/4.88))}}
class Adafruit_MCP4725{begin(){return !!I('dac')||true}setVoltage(v){const p=S.parts.find(q=>q.t=='dac');if(p)p.st.out=v/4095*BD[S.bt][1]}}
const NEW={TinyGPSPlus,MFRC522,MAX30105,QMC5883LCompass,Adafruit_PWMServoDriver,Adafruit_MCP4725,SoftwareSerial:class{begin(){}available(){return 0}read(){return 0}print(){}println(){}write(){}},SERVOMIN:150,SERVOMAX:600},om=window.mkAPI;
window.mkAPI=function(){const a=om();Object.keys(NEW).forEach(k=>{if(!(k in a))a[k]=NEW[k]});return a};
// ===== 3. every part with a model counts as working; menu badges + filters =====
Object.keys(PD).forEach(k=>{SUPK[k]='Full'});if(typeof AN!='undefined')Object.keys(AN).forEach(k=>{SUPK[k]='Full'});
palBuild();
const bd=()=>{document.querySelectorAll('#pal [data-add]').forEach(b=>{const k=b.dataset.add,w=SUPK[k]=='Full'||PD[k]||(typeof AN!='undefined'&&AN[k]);b.dataset.w=w?'w':'p';if(!b.querySelector('.bdg'))b.insertAdjacentHTML('beforeend',`<em class="bdg ${w?'w':'p'}">${w?'works':'basic'}</em>`)})};bd();
$q('#q').insertAdjacentHTML('afterend','<div id="chips"><button class="on" data-f="">All</button><button data-f="w">Works</button><button data-f="p">Basic</button></div>');
let flt='';const pf=()=>{const q=$q('#q').value.toLowerCase().trim();document.querySelectorAll('#pal [data-add]').forEach(b=>b.hidden=(!!q&&!b.dataset.s.includes(q))||(!!flt&&b.dataset.w!=flt));document.querySelectorAll('#pal details').forEach(d=>{const any=[...d.querySelectorAll('[data-add]')].some(b=>!b.hidden);d.hidden=!any;if(q||flt)d.open=any})};
$q('#q').oninput=pf;$q('#chips').onclick=e=>{const b=e.target.closest('button');if(!b)return;flt=b.dataset.f;document.querySelectorAll('#chips button').forEach(x=>x.classList.toggle('on',x==b));pf()};
const pb=window.palBuild;
})();
