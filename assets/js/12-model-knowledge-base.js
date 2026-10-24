/* Component knowledge base and usage guidance. */

(()=>{const $q=s=>document.querySelector(s);
// ================= WIRING AI: role-aware, board-aware =================
const V3ONLY=new Set('nrf lora bme280 sht31 vl53 apds tcs qmc mpu9250 gps rfid max30 ads dac'.split(' ')),V5=new Set('servo us relay mq135 hb a4988 sd l298 tb6612 pca step'.split(' '));
function boardInfo(){const t=S.bt,l=q=>S.bp.find(x=>x.l==q);const sp=({uno:['D11','D12','D13'],nano:['D11','D12','D13'],pro:['D11','D12','D13'],leo:['D11','D12','D13'],mega:['D51','D50','D52'],esp32:['G23','G19','G18'],pico:['G19','G16','G18']})[t]||[],ua=({uno:['D0','D1'],nano:['D0','D1'],pro:['D0','D1'],leo:['D0','D1'],mega:['D19','D18'],esp32:['G16','G17'],pico:['G1','G0']})[t]||[];
 const pwm=({uno:'D3 D5 D6 D9 D10 D11',nano:'D3 D5 D6 D9 D10 D11',pro:'D3 D5 D6 D9 D10 D11',leo:'D3 D5 D6 D9 D10 D11',mega:'D2 D3 D4 D5 D6 D7 D8 D9 D10 D11 D12 D13'})[t];
 const bad=/^(D0|D1|G0|G1|G3|G6|G7|G8|G9|G10|G11|G12|G15)$/;
 return{mosi:l(sp[0]),miso:l(sp[1]),sck:l(sp[2]),rx:l(ua[0]),tx:l(ua[1]),pwm:pwm?pwm.split(' '):null,bad,an:q=>/^A\d$/.test(q.l)||(t=='esp32'&&/^G(32|33|34|35|36|39)$/.test(q.l))||(t=='pico'&&/^G(26|27|28)$/.test(q.l)),inOnly:q=>t=='esp32'&&/^G(34|35|36|39)$/.test(q.l)}}
function wireParts(list){const bp=S.bp,bi=boardInfo(),used=new Set(S.wires.flatMap(w=>[w.a,w.b])),ref=q=>'b:'+q.l,[sd,sc]=(I2P[S.bt]||[]),io=bp.filter(q=>q.k=='io'),v33=BD[S.bt][1]<4,
 gq=bp.find(q=>q.k=='g'),p3=bp.find(q=>q.k=='p3'),p5=bp.find(q=>q.k=='p5'),notes=[],map={},miss=[],pl=[];let n=0;
 const take=(f,pref)=>{const free=io.filter(q=>!used.has(ref(q))&&!bi.bad.test(q.l)&&f(q));return(pref&&free.find(pref))||free[0]||io.find(q=>!used.has(ref(q))&&f(q))},
 any=()=>take(q=>!bi.inOnly(q)),ana=()=>take(q=>bi.an(q)),pw=()=>bi.pwm?take(q=>bi.pwm.includes(q.l)):take(q=>!bi.inOnly(q)),inn=()=>take(q=>true),
 con=(a,b)=>{if(!window.VX_DRY)connect(a,b);used.add(a);used.add(b);n++;pl.push([a,b])},
 sup=(p)=>{const t=p.t;if(V3ONLY.has(t)&&p3)return p3;if(v33)return V5.has(t)&&p5?p5:(p3||p5);return V5.has(t)||!V3ONLY.has(t)?(p5||p3):p3},
 series=(p,l,q)=>{addPart('res220');const r=S.parts[S.parts.length-1];if(v33)r.st.ohm=150;const[r0,r1]=pinsOf(r);con(p.id+':'+l,r.id+':'+r1);con(r.id+':'+r0,ref(q));used.add(ref(q));map[p.id+':'+l]=q.l};
 list.forEach(p=>{const k=p.k,t=p.t;if(['bat','dmm','res','cap','ind','dio','fuse','reg','stepc','out'].includes(k)&&k!='out')return;
  pinsOf(p).forEach(l=>{const pr=p.id+':'+l;if(used.has(pr))return;let q=null,wired=0;
   const L=l.toUpperCase();
   if(k=='out'&&(l=='+'))q=pw();else if(k=='out'&&l=='-')q=gq;
   else if(['btn','sw'].includes(k))q=l=='1'?inn():gq;
   else if(k=='led'){if(l=='C')q=gq;else{q=any();if(q&&q.k=='io'){series(p,l,q);wired=1}}}
   else if(k=='rgb'){if(l=='GND')q=gq;else{q=pw();if(q){series(p,l,q);wired=1}}}
   else if(k=='seg'){if(l=='COM')q=gq;else{q=any();if(q){series(p,l,q);wired=1}}}
   else if(/^(VCC|VDD|VIN|V\+|VS|VM|VMOT|5V|3V3|\+|IN\+|OUT\+)$/.test(L)&&!['reg'].includes(k))q=(L=='5V'&&p5)||sup(p);
   else if(/^(GND|-|IN-|OUT-|COM)$/.test(L)&&!['relay'].includes(k)&&!(k=='dmm'))q=gq;
   else if(L=='SDA'&&!/RFID/i.test(PT[t][0])||(L=='SDA'&&(k=='i2c'||k=='disp')))q=bp.find(x=>x.n===sd);
   else if(L=='SCL')q=bp.find(x=>x.n===sc);
   else if(/^(MOSI|DIN)$/.test(L)&&!/NeoPixel/i.test(PT[t][0])&&k!='neo')q=bi.mosi;else if(L=='MISO')q=bi.miso;else if(/^(SCK|SCLK|CLK)$/.test(L)&&k!='vis'||(/SCK/.test(L)))q=bi.sck;
   else if(/^(TX|TXD)$/.test(L))q=bi.rx;else if(/^(RX|RXD)$/.test(L))q=bi.tx;
   else if(L=='EN'&&k=='a4988')q=gq;else if(L=='STBY')q=p5||p3;
   else if(/^(SIG|PWM|PWMA|PWMB|ENA|ENB|DIN)$/.test(L)||(k=='servo'&&l=='SIG'))q=pw();
   else if(k=='joy'&&/^VR/.test(L)||k=='an'||k=='sx'&&/^(OUT|AOUT|A0|SIG|V)$/.test(L)||(k=='vis'&&/^(A|B)$/.test(L)&&0))q=ana();
   else if(k=='an'||k=='sx'||/^(OUT|AOUT)$/.test(L)&&['an','sx'].includes(k))q=ana();
   else if(['relay'].includes(k)&&/^(COM|NO|NC)$/.test(L))return;
   else if(['hb','sd','a4988'].includes(k)&&/^(OUT\d|AO\d|BO\d|[12][AB])$/.test(L))return;
   else q=any();
   if(wired)return;
   if(!q){miss.push(PT[t][0]+'.'+l);return}
   con(pr,ref(q));map[pr]=q.l});
  if(t=='us'&&v33)notes.push('HC-SR04 ECHO is 5 V: add a voltage divider (1 kΩ + 2 kΩ) on '+(map[p.id+':ECHO']||'ECHO')+' for a 3.3 V board.');
  if(V3ONLY.has(t)&&!v33)notes.push(PT[t][0]+' is a 3.3 V part: it was wired to 3V3; use a level shifter on its signal lines.');
  if(k=='servo')notes.push('Servo power: for more than one servo, use an external 5 V supply and join the grounds.');
  if(k=='a4988'||t=='nema17')notes.push('Stepper driver: motor supply needs its own 8-35 V source and a 100 µF capacitor.')});
 draw();return{n,miss,notes:[...new Set(notes)],map,pl}}
const sel=()=>S.parts.find(q=>q.id==S.sel);
$q('#awb').onclick=()=>{const s=sel(),r=wireParts(s?[s]:[...S.parts]);toast(r.n?`Wired ${r.n} connections correctly for ${BD[S.bt][0]}.`+(r.miss.length?' No free pin: '+r.miss.join(', '):''):(S.parts.length?'Everything is already wired.':'Add a part first.'),!r.n);if(r.notes.length)setTimeout(()=>toast('Tip: '+r.notes[0]),2600)};
$q('#pwa').onclick=()=>$q('#awb').onclick();
// ================= PROJECT AI: understands parts, intent, writes the code =================
const SY=[[/ultrasonic|sonar|distance|proximity|hc-?sr04|obstacle/,'us'],[/servo|gate|door|barrier|arm\b/,'servo'],[/buzzer|alarm|beep|siren/,'buz'],[/push.?button|button|switch\b/,'btn'],[/potentiometer|\bpot\b|knob|dial/,'pot'],[/dht|temperature|humidity/,'dht11'],[/\bpir\b|motion/,'pir'],[/relay/,'relay'],[/oled/,'oled'],[/\blcd\b/,'lcd'],[/rgb/,'rgb'],[/neopixel|led strip/,'neo'],[/gps|location|tracker/,'gps'],[/rfid|card reader|key ?card/,'rfid'],[/pulse|heart|oximeter/,'max30'],[/compass|magnetometer/,'qmc'],[/\bimu\b|accelerometer|gyro/,'mpu9250'],[/load cell|weigh|scale/,'hx711'],[/\brtc\b|clock/,'rtc'],[/pressure|barometer|weather/,'bme280'],[/ds18|waterproof temp/,'ds18'],[/colou?r sensor/,'tcs'],[/keypad/,'keypad'],[/encoder/,'enc'],[/joystick/,'joy'],[/infrared receiver|ir remote/,'irr'],[/ldr|light sensor|brightness|photoresistor/,'lux'],[/soil|moisture/,'soilc'],[/gas|smoke|air quality/,'mq135'],[/sound|clap|microphone/,'sndl'],[/water level/,'wlevel']],
 LEDC={red:'ledr',green:'ledg',blue:'ledb',yellow:'ledy',white:'ledw',orange:'ledo'},NW={a:1,an:1,one:1,two:2,three:3,four:4,pair:2};
const cnt=(txt,m)=>{const pre=txt.slice(Math.max(0,m.index-12),m.index).toLowerCase(),x=/(\d+|one|two|three|four|a pair of|an?)\s+(?:\w+\s+)?$/.exec(pre);return x?Math.min(4,+x[1]||NW[x[1].trim().split(' ')[0]]||1):1};
function plan(txt){const low=txt.toLowerCase(),res=[],got=new Set();
 SY.forEach(([re,k])=>{if(!PT[k])return;const m=re.exec(low);if(m){res.push([k,cnt(low,m)]);got.add(m[0])}});
 const lm=[...low.matchAll(/(?:(\d+|one|two|three|four)\s+)?(red|green|blue|yellow|white|orange)?\s*(leds?|lamp|light)\b/g)].filter(m=>!/rgb|neopixel/.test(m[0]));
 lm.forEach(m=>{const c=LEDC[m[2]||'red'];if(PT[c])res.push([c,m[1]?(+m[1]||NW[m[1]]):1])});
 low.split(/,|\band\b|\+|&|:|;/).map(s=>s.trim()).filter(s=>s.length>2).forEach(c=>{if(SY.some(([re])=>re.test(c))||/led|lamp|light/.test(c))return;const k=find(c);if(k&&!res.some(r=>r[0]==k))res.push([k,1])});
 return res}
function find(chunk){const ST=new Set('and with the that when then for use using from into make build want will have this which sensor module board show read control turn turns'.split(' '));const T=chunk.toLowerCase().replace(/[^a-z0-9. -]/g,' ').split(/\s+/).filter(w=>w.length>2&&!ST.has(w)).map(w=>w.replace(/s$/,''));let best=null,bs=0;
 Object.entries(PT).forEach(([k,d])=>{if(/^led[rgbywopk]$/.test(k))return;const hay=(d[0]+' '+k).toLowerCase();let s=0;T.forEach(w=>{if(hay.includes(w))s+=w.length>3?2:1});s-=d[0].length/200;if(s>bs){bs=s;best=k}});return bs>=2?best:null}
const pn=l=>{const m=/^[DG](\d+)$/.exec(l);return m?m[1]:l};
function codegen(txt,added,map){const low=txt.toLowerCase(),pin=(p,l)=>{const v=map[p.id+':'+l];return v?pn(v):null},of=k=>added.filter(p=>p.k==k||p.t==k),first=k=>of(k)[0];
 const us=first('us'),sv=first('servo'),bz=of('out')[0],led=of('led')[0],btn=first('btn'),pot=first('an'),dh=added.find(p=>p.k=='dht'),relay=first('relay'),pir=added.find(p=>p.t=='pir');
 let inc='',gl='',su='',lp='';const near=/close|near|detect|object|obstacle|distance|approach|within/.test(low);
 const act=[],off=[];const lp_pin=p=>{const q=S.wires.find(w=>w.a==p.id+':A');if(!q)return null;const r=q.b.split(':')[0],w2=S.wires.find(x=>x.a.startsWith(r+':')&&x.b[0]=='b');return w2?pn(w2.b.slice(2)):null};
 if(led){const lp2=map[led.id+':A']||lp_pin(led);if(lp2){gl+=`const int LED_PIN = ${lp2};\n`;su+='  pinMode(LED_PIN, OUTPUT);\n';act.push('digitalWrite(LED_PIN, HIGH);');off.push('digitalWrite(LED_PIN, LOW);')}}
 if(bz){const b=pin(bz,'+');if(b){gl+=`const int BUZZER_PIN = ${b};\n`;su+='  pinMode(BUZZER_PIN, OUTPUT);\n';act.push('tone(BUZZER_PIN, 1000);');off.push('noTone(BUZZER_PIN);')}}
 if(relay){const b=pin(relay,'IN');if(b){gl+=`const int RELAY_PIN = ${b};\n`;su+='  pinMode(RELAY_PIN, OUTPUT);\n';act.push('digitalWrite(RELAY_PIN, HIGH);');off.push('digitalWrite(RELAY_PIN, LOW);')}}
 if(sv){const b=pin(sv,'SIG');if(b){inc+='#include <Servo.h>\n';gl+=`Servo gate;\nconst int SERVO_PIN = ${b};\n`;su+='  gate.attach(SERVO_PIN);\n  gate.write(0);\n';act.push('gate.write(90);');off.push('gate.write(0);')}}
 if(us){const tr=pin(us,'TRIG'),ec=pin(us,'ECHO');if(tr&&ec){gl+=`const int TRIG_PIN = ${tr};\nconst int ECHO_PIN = ${ec};\nconst int NEAR_CM = 20;\n\nlong readCm() {\n  digitalWrite(TRIG_PIN, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG_PIN, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG_PIN, LOW);\n  long t = pulseIn(ECHO_PIN, HIGH, 30000);\n  return t * 0.034 / 2;\n}\n`;su+='  pinMode(TRIG_PIN, OUTPUT);\n  pinMode(ECHO_PIN, INPUT);\n';lp+='  long cm = readCm();\n  Serial.print("Distance: ");\n  Serial.print(cm);\n  Serial.println(" cm");\n';if(act.length)lp+=`  if (cm > 0 && cm < NEAR_CM) {\n${act.map(x=>'    '+x).join('\n')}\n  } else {\n${off.map(x=>'    '+x).join('\n')}\n  }\n`;lp+='  delay(100);\n'}}
 else if(btn&&act.length){const b=pin(btn,'1');if(b){gl+=`const int BUTTON_PIN = ${b};\n`;su+='  pinMode(BUTTON_PIN, INPUT_PULLUP);\n';lp+=`  if (digitalRead(BUTTON_PIN) == LOW) {\n${act.map(x=>'    '+x).join('\n')}\n  } else {\n${off.map(x=>'    '+x).join('\n')}\n  }\n  delay(20);\n`}}
 else if(pot){const b=pin(pot,'OUT');if(b){gl+=`const int POT_PIN = ${/^\d/.test(b)?b:b};\n`;lp+='  int raw = analogRead(POT_PIN);\n  Serial.println(raw);\n';if(sv)lp+='  gate.write(map(raw, 0, 1023, 0, 180));\n';else if(led)lp+='  analogWrite(LED_PIN, map(raw, 0, 1023, 0, 255));\n';lp+='  delay(20);\n'}}
 else if(dh){const b=pin(dh,'DATA');if(b){inc+='#include <DHT.h>\n';gl+=`DHT dht(${b}, DHT11);\n`;su+='  dht.begin();\n';lp+='  float t = dht.readTemperature();\n  float h = dht.readHumidity();\n  Serial.print("Temp: ");\n  Serial.print(t);\n  Serial.print(" C  Humidity: ");\n  Serial.println(h);\n  delay(1000);\n'}}
 else if(pir){const b=pin(pir,'OUT');if(b){gl+=`const int PIR_PIN = ${b};\n`;su+='  pinMode(PIR_PIN, INPUT);\n';lp+=act.length?`  if (digitalRead(PIR_PIN) == HIGH) {\n${act.map(x=>'    '+x).join('\n')}\n  } else {\n${off.map(x=>'    '+x).join('\n')}\n  }\n  delay(100);\n`:'  Serial.println(digitalRead(PIR_PIN));\n  delay(200);\n'}}
 else if(act.length)lp+=`  ${act.join('\n  ')}\n  delay(500);\n  ${off.join('\n  ')}\n  delay(500);\n`;
 return`// Generated by VOLTIX for: ${txt.replace(/\n/g,' ').slice(0,90)}\n${inc}${inc?'\n':''}${gl}\nvoid setup() {\n  Serial.begin(9600);\n${su}}\n\nvoid loop() {\n${lp||'  // add your logic here\n'}}\n`}
window.VX={plan,wireParts,codegen};$q('#pgo').onclick=()=>{const txt=$q('#ptxt').value.trim();if(!txt)return;const pl=plan(txt),mark=S.parts.length,added=[];
 pl.forEach(([k,c])=>{for(let i=0;i<c;i++){addPart(k);added.push(S.parts[S.parts.length-1])}});
 if(!added.length){$q('#pout').innerHTML='I could not match any part. Try: <i>ultrasonic sensor, servo, red led, buzzer, button, dht11, potentiometer, pir, relay</i>.';return}
 const r=wireParts(S.parts.slice(mark)),newAll=S.parts.slice(mark),code=codegen(txt,added,r.map);const ta=$q('#code');if(ta){ta.value=code;ta.dispatchEvent(new Event('input'));try{tab('code')}catch(e){}}
 try{fit()}catch(e){}draw();
 $q('#pout').innerHTML=`<b style="color:var(--ink)">Parts:</b> ${pl.map(([k,c])=>(c>1?c+'× ':'')+PT[k][0]).join(', ')}<br><b style="color:var(--ink)">Wiring:</b> ${r.n} connections on ${BD[S.bt][0]} (power, ground, signals${S.parts.length>newAll.length?'':''}; LEDs get series resistors).<br><b style="color:var(--ink)">Code:</b> written to the editor. Press <b>Run</b>.`+(r.notes.length?'<br><b style="color:#ffd24d">Notes:</b> '+r.notes.join(' '):'')+(r.miss.length?'<br>No free pin for: '+r.miss.join(', '):'')};
})();
