/* Code editor utilities, autocomplete, syntax highlighting, and lint helpers. */

/* ===== MODULE 5: code editor tools (colours, autocomplete, typo check) ===== */
//ED-START
const KW=new Set('void int long float double byte bool boolean char short unsigned const static if else for while do return break continue switch case default true false new class struct sizeof'.split(' '));
const MEM={Serial:['begin','print','println','write','available','read','readString','readStringUntil','parseInt','flush','setTimeout'],
 WiFi:['begin','status','localIP','softAP','softAPIP','scanNetworks','SSID','RSSI','reconnect','disconnect','macAddress','mode','setHostname'],Wire:['begin','setClock'],Servo:['attach','write','read','detach'],
 WebServer:['on','onNotFound','begin','stop','handleClient','send','arg','hasArg','uri','method','sendHeader'],HTTPClient:['begin','end','GET','getString','getSize','addHeader','setTimeout'],Stepper:['setSpeed','step'],DHT:['begin','readTemperature','readHumidity'],
 Adafruit_MPU6050:['begin','getEvent','setAccelerometerRange','setGyroRange','setFilterBandwidth'],Adafruit_ADXL345_Unified:['begin','getEvent','setRange'],Adafruit_BMP280:['begin','readTemperature','readPressure','readAltitude','setSampling'],
 Adafruit_INA219:['begin','getCurrent_mA','getBusVoltage_V','getShuntVoltage_mV','getPower_mW','setCalibration_32V_2A'],Adafruit_NeoPixel:['begin','setPixelColor','show','clear','fill','Color','ColorHSV','setBrightness','numPixels'],
 Adafruit_SSD1306:['begin','clearDisplay','display','setCursor','setTextSize','setTextColor','print','println','drawPixel','drawLine','drawRect','fillRect','drawCircle','fillCircle'],LiquidCrystal_I2C:['init','begin','backlight','clear','setCursor','print','println']};
const GLOB=['pinMode','digitalWrite','digitalRead','analogRead','analogWrite','delay','delayMicroseconds','millis','micros','tone','noTone','pulseIn','map','constrain','random','randomSeed','sin','cos','tan','sqrt','pow','abs','min','max','floor','ceil','round','setup','loop'];
const CONS=['HIGH','LOW','INPUT','OUTPUT','INPUT_PULLUP','LED_BUILTIN','PI','WL_CONNECTED','A0','A1','A2','A3','A4','A5','NEO_GRB','NEO_KHZ800','SSD1306_WHITE','WHITE'];
const TYPES=Object.keys(MEM).concat(['String','uint8_t','uint16_t','uint32_t','sensors_event_t','LiquidCrystal']);
const ALLM=new Set(Object.values(MEM).flat()),KWL=[...KW];
const varTypes=src=>{const m={Serial:'Serial',WiFi:'WiFi',Wire:'Wire'};src.replace(/\b([A-Z]\w*)\s+(\w+)\s*(?:[=;(])/g,(x,t,n)=>{const T=t=='LiquidCrystal'?'LiquidCrystal_I2C':t;if(MEM[T])m[n]=T});return m};
const decl=src=>{const s=new Set();src.replace(/\b(?:void|int|long|float|double|byte|bool|boolean|char|short|String|uint\d+_t|[A-Z]\w*)\s+\*?(\w+)/g,(x,n)=>s.add(n));src.replace(/#define\s+(\w+)/g,(x,n)=>s.add(n));return s};
const lev=(a,b)=>{const d=Array.from({length:a.length+1},(_,i)=>[i,...Array(b.length).fill(0)]);for(let j=1;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]==b[j-1]?0:1));return d[a.length][b.length]};
const suggest=(bad,list)=>{let best=null,bd=9;list.forEach(x=>{const d=lev(bad.toLowerCase(),x.toLowerCase());if(d<bd){bd=d;best=x}});return best&&bd<=Math.max(2,Math.floor(bad.length/3))?best:null};
//ED-END
const esc2=s=>s.replace(/[&<>]/g,c=>'&#'+c.charCodeAt(0)+';');
window.hlu=()=>{const src=$('#code').value,vt=varTypes(src),dc=decl(src);
 $('#hl').innerHTML=src.replace(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|(^[ \t]*#[^\n]*)|(\b\d[\w.]*)|([A-Za-z_]\w*)|([\s\S])/gm,(m,cm,st,pp,nu,id,ot,off)=>{
  if(cm)return`<span class='hc'>${esc2(cm)}</span>`;if(st)return`<span class='hs'>${esc2(st)}</span>`;if(pp)return`<span class='hp'>${esc2(pp)}</span>`;if(nu)return`<span class='hn'>${esc2(nu)}</span>`;
  if(id){const dm=/([A-Za-z_]\w*)\s*\.\s*$/.exec(src.slice(Math.max(0,off-40),off)),next=src[off+m.length]==='(';let c='';
   if(KW.has(id))c='hk';else if(MEM[id]||TYPES.includes(id))c='ht';else if(CONS.includes(id))c='hv';
   else if(dm){const T=vt[dm[1]],L=T&&MEM[T];c=L?(L.includes(id)?'hf':'he'):''}
   else if(GLOB.includes(id))c='hf';else if(next&&!dc.has(id)&&!ALLM.has(id)&&/^[a-z]/.test(id))c='he';else if(next)c='hu';
   return c?`<span class='${c}'>${id}</span>`:id}
  return esc2(ot)});$('#hl').scrollTop=$('#code').scrollTop;$('#hl').scrollLeft=$('#code').scrollLeft;lintUpd()};
function lintUpd(){const src=$('#code').value,vt=varTypes(src),dc=decl(src),res=[];
 src.split('\n').forEach((ln,i)=>{const code=ln.replace(/\/\/.*$/,'');
  code.replace(/([A-Za-z_]\w*)\s*\.\s*([A-Za-z_]\w*)/g,(m,o,mem,col)=>{const T=vt[o],L=T&&MEM[T];if(L&&!L.includes(mem))res.push({i,col:col+m.length-mem.length,bad:mem,sug:suggest(mem,L)})});
  code.replace(/(?<![\w.])([a-z_]\w*)\s*\(/g,(m,id,col)=>{if(!KW.has(id)&&!GLOB.includes(id)&&!ALLM.has(id)&&!dc.has(id))res.push({i,col,bad:id,sug:suggest(id,GLOB)})})});
 $('#lint').innerHTML=res.length?res.slice(0,6).map(r=>`Line ${r.i+1}: '${esc2(r.bad)}' is not a command this simulator knows.${r.sug?` Did you mean '${r.sug}'? <button data-i='${r.i}' data-c='${r.col}' data-b='${esc2(r.bad)}' data-s='${r.sug}'>Fix</button>`:' It may be unsupported here.'}`).join('<br>')+(res.length>6?`<br>${res.length-6} more...`:''):`<span style='color:#86efac'>✔ No unknown commands found.</span>`}
$('#lint').addEventListener('click',e=>{const d=e.target.dataset;if(d.s===undefined)return;const ta=$('#code'),L=ta.value.split('\n');let off=0;for(let k=0;k<+d.i;k++)off+=L[k].length+1;off+=+d.c;ta.setRangeText(d.s,off,off+d.b.length,'end');ta.dispatchEvent(new Event('input',{bubbles:true}))});
const AC=$('#ac');let acItems=[],acSel=0,acAt=0;
function acUpdate(){const ta=$('#code'),pos=ta.selectionStart,before=ta.value.slice(0,pos),m=/([A-Za-z_]\w*)\s*\.\s*(\w*)$/.exec(before),g=/(?:^|[^\w.])([A-Za-z_]\w*)$/.exec(before);let list=[],pre='',kind='function';
 if(m){const T=varTypes(ta.value)[m[1]],L=T&&MEM[T];if(L){pre=m[2];kind='method';list=L.filter(x=>x.toLowerCase().startsWith(pre.toLowerCase())&&x!==pre)}}
 else if(g&&g[1].length>=2){pre=g[1];list=[...new Set([...GLOB,...CONS,...TYPES,...KWL])].filter(x=>x.toLowerCase().startsWith(pre.toLowerCase())&&x!==pre)}
 if(!list.length){AC.hidden=true;acItems=[];return}
 acItems=list.slice(0,12);acSel=0;acAt=pos-pre.length;const lines=before.split('\n'),r=ta.getBoundingClientRect();
 AC.innerHTML=acItems.map((x,i)=>`<div class='${i?'':'on'}' data-i='${i}'>${x}<small>${m?'method':GLOB.includes(x)?'function':CONS.includes(x)?'constant':TYPES.includes(x)?'type':'keyword'}</small></div>`).join('');
 AC.style.left=Math.min(innerWidth-220,Math.max(4,r.left+10+lines[lines.length-1].length*7.2-ta.scrollLeft))+'px';AC.style.top=Math.min(innerHeight-230,r.top+10+lines.length*18-ta.scrollTop)+'px';AC.hidden=false}
function acPick(i){const ta=$('#code');ta.setRangeText(acItems[i],acAt,ta.selectionStart,'end');AC.hidden=true;ta.dispatchEvent(new Event('input',{bubbles:true}));ta.focus()}
function acMark(){[...AC.children].forEach((c,i)=>c.classList.toggle('on',i==acSel));AC.children[acSel]&&AC.children[acSel].scrollIntoView({block:'nearest'})}
$('#cw').addEventListener('keydown',e=>{if(AC.hidden)return;const k=e.key;if(k=='ArrowDown'){acSel=(acSel+1)%acItems.length;acMark()}else if(k=='ArrowUp'){acSel=(acSel+acItems.length-1)%acItems.length;acMark()}else if(k=='Enter'||k=='Tab'){acPick(acSel)}else if(k=='Escape'){AC.hidden=true}else return;e.preventDefault();e.stopPropagation()},true);
AC.addEventListener('mousedown',e=>{const i=e.target.closest('[data-i]');if(i){e.preventDefault();acPick(+i.dataset.i)}});
$('#code').addEventListener('input',acUpdate);$('#code').addEventListener('blur',()=>setTimeout(()=>{AC.hidden=true},150));
$('#code').addEventListener('scroll',()=>{$('#hl').scrollTop=$('#code').scrollTop;$('#hl').scrollLeft=$('#code').scrollLeft;AC.hidden=true});
hlu();
