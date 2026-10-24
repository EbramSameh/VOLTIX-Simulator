/* Circuit diagnostics and electrical checks. */

(()=>{const $q=s=>document.querySelector(s);
// ---------- core: wire a list of parts completely ----------
function wireParts(list){const bp=S.bp,used=new Set(S.wires.flatMap(w=>[w.a,w.b])),ref=q=>'b:'+q.l,[sd,sc]=(I2P[S.bt]||[]),io=bp.filter(q=>q.k=='io'),v33=BD[S.bt][1]<4,
 gq=bp.find(q=>q.k=='g'),p3=bp.find(q=>q.k=='p3'),p5=bp.find(q=>q.k=='p5'),
 skip=q=>/^(D0|D1|G0|G1|G3)$/.test(q.l),ana=q=>/^A\d$/.test(q.l)||/^G(26|27|28|32|33|34|35|36|39)$/.test(q.l),
 sig=a=>io.find(q=>!used.has(ref(q))&&!skip(q)&&(!a||ana(q)))||io.find(q=>!used.has(ref(q))&&(!a||ana(q)))||io.find(q=>!used.has(ref(q))),
 con=(a,b)=>{connect(a,b);used.add(a);used.add(b)};let n=0;const miss=[];
 list.forEach(p=>{if(['res','bat','hb'].includes(p.k)&&!['res'].includes(p.k)){}
  pinsOf(p).forEach(l=>{const pr=p.id+':'+l;if(used.has(pr))return;let q;
   if(/^(VCC|VIN|VS|VM|VMOT|V\+|VDD|5V|3V3|\+|IN\+)$/.test(l))q=(v33||/3V3/.test(l))&&!['servo','sd','out'].includes(p.k)&&p3?p3:(p5||p3);
   else if(/^(GND|G|K|-|IN-)$/.test(l)||(l=='C'&&p.k=='led'))q=gq;
   else if(/SDA/.test(l))q=bp.find(x=>x.n===sd);else if(/SCL/.test(l))q=bp.find(x=>x.n===sc);
   else q=sig(['sx','an'].includes(p.k)||/^(A0|AO|AOUT|OUT|SIG|VRX|VRY)$/.test(l)&&p.k!='dig');
   if(!q){miss.push(PT[p.t][0]+'.'+l);return}
   if(p.k=='led'&&l=='A'&&q.k=='io'){addPart('res220');const r=S.parts[S.parts.length-1],[r0,r1]=pinsOf(r);con(p.id+':A',r.id+':'+r1);con(r.id+':'+r0,ref(q));used.add(ref(q));n+=2;return}
   con(pr,ref(q));if(q.k=='io')used.add(ref(q));n++})});
 draw();return{n,miss}}
$q('#awb').title='Wires the selected part, or every part on the board if none is selected';
$q('#awb').onclick=()=>{const sel=S.parts.find(q=>q.id==S.sel),r=wireParts(sel?[sel]:[...S.parts]);toast(r.n?`Made ${r.n} connections${sel?'':' for all parts'}.`+(r.miss.length?' No free pin for: '+r.miss.join(', '):''):(S.parts.length?'Everything is already wired.':'Add a part first.'),!r.n)};
// ---------- project describer ----------
const ST=new Set('and with the that when then for use using from into make build want will have this which sensor module board show read control turn turns'.split(' ')),
 AL={ultrasonic:'hc-sr04',distance:'hc-sr04',temperature:'dht11',humidity:'dht11',lamp:'led',light:'ldr',potentiometer:'pot',knob:'pot',motor:'servo',buzzer:'buzzer',display:'oled',screen:'oled',moisture:'soil',pulse:'max30',heartbeat:'max30',compass:'qmc',accelerometer:'mpu',gyro:'mpu',weight:'hx711',scale:'hx711',clock:'rtc',time:'rtc',card:'sd',wireless:'nrf24',bluetooth:'hc-05'},
 tok=s=>s.toLowerCase().replace(/[^a-z0-9. -]/g,' ').split(/\s+/).filter(Boolean);
function find(chunk){let T=tok(chunk).filter(w=>w.length>2&&!ST.has(w)).map(w=>AL[w]||w.replace(/s$/,'')),best=null,bs=0;
 Object.entries(PT).forEach(([k,d])=>{if(/^led[rgbywopk]$/.test(k)&&k!='ledr')return;const hay=(d[0]+' '+k+' '+d[1]).toLowerCase();let s=0;T.forEach(w=>{if(hay.includes(w))s+=w.length>3?2:1});s-=d[0].length/200;if(s>bs){bs=s;best=k}});return bs>=1?best:null}
const P=document.createElement('div');P.id='prj';P.innerHTML='<b>✨ Describe your project</b><div style="color:var(--mute);margin:4px 0 8px">List 2-3 parts and what you want. I add them and wire every pin.</div><textarea id="ptxt" placeholder="e.g. ultrasonic sensor, servo and a red led: the servo turns when something is close"></textarea><div class="row"><button id="pgo">Build &amp; wire it</button><button id="pwa">Wire what I have</button><button id="px">✕</button></div><div id="pout"></div>';document.body.appendChild(P);
const pb=document.createElement('button');pb.textContent='✨ Describe project';pb.style.cssText='background:linear-gradient(90deg,#22d3ee,#8b6cff);border:0;font-weight:700';$q('#awb').before(pb);
pb.onclick=()=>{P.style.display=P.style.display=='block'?'none':'block'};$q('#px').onclick=()=>P.style.display='none';
$q('#pwa').onclick=()=>$q('#awb').onclick();
$q('#pgo').onclick=()=>{const txt=$q('#ptxt').value,head=txt.split(/[:.;\n]/)[0],chunks=head.split(/,|\band\b|\+|&/i).map(s=>s.trim()).filter(Boolean),added=[],unk=[],mark=S.parts.length;
 chunks.forEach(c=>{const m=/^(\d+|two|three|a pair of)\b/i.exec(c),cnt=m?({two:2,three:3,'a pair of':2}[m[1].toLowerCase()]||Math.min(4,+m[1])):1,k=find(c);if(!k){if(tok(c).some(w=>w.length>3&&!ST.has(w)))unk.push(c);return}
  for(let i=0;i<cnt;i++){addPart(k);added.push(PT[k][0])}});
 if(!added.length){$q('#pout').innerHTML='I could not match any part. Try names like <i>ultrasonic sensor, servo, red led, dht11, oled</i>.';return}
 const r=wireParts(S.parts.slice(mark));try{fit()}catch(e){}draw();
 $q('#pout').innerHTML=`<b style="color:var(--ink)">Added:</b> ${added.join(', ')}<br><b style="color:var(--ink)">Wired:</b> ${r.n} connections on ${BD[S.bt][0]} (LEDs got a 220 Ω resistor).`+(r.miss.length?'<br>No free pin for: '+r.miss.join(', '):'')+(unk.length?'<br>Not recognised: '+unk.join(', '):'')+'<br>Next: write or paste code in the editor, then press Run.'};
})();

// --- electrical safety pass: visual diagnostics for common wiring mistakes ---
(()=>{const $=s=>document.querySelector(s),root=x=>{while(parent.has(x)&&parent.get(x)!==x)x=parent.get(x);return x},parent=new Map();
 const ensure=x=>{if(!parent.has(x))parent.set(x,x)},join=(a,b)=>{ensure(a);ensure(b);const x=root(a),y=root(b);if(x!==y)parent.set(x,y)};
 function analyze(){if(!window.S||!Array.isArray(S.parts)||!Array.isArray(S.wires)||!Array.isArray(S.bp))return[];parent.clear();S.wires.forEach(w=>join(w.a,w.b));const net=x=>{ensure(x);return root(x)},messages=[],seen=new Set(),add=(level,title,detail)=>{const key=level+title+detail;if(!seen.has(key)){seen.add(key);messages.push({level,title,detail})}},boardNets=new Map();
 S.bp.forEach(p=>{const r=net('b:'+p.l);if(!boardNets.has(r))boardNets.set(r,[]);boardNets.get(r).push(p)});
 boardNets.forEach((pins,r)=>{const power=pins.some(p=>p.k==='p5'||p.k==='p3'),ground=pins.some(p=>p.k==='g');if(power&&ground)add('danger','Power-to-ground short','A single connected net contains both a supply pin and GND. Disconnect the short before running the circuit.')});
 const byId=new Map(S.parts.map(p=>[String(p.id),p])),resistors=S.parts.filter(p=>p.k==='res'||/resistor/i.test(String(p.t||'')));
 const pinNet=(p,l)=>{const pin=p.id+':'+l;return S.wires.some(w=>w.a===pin||w.b===pin)?net(pin):null};
 S.parts.forEach(p=>{
  const type=String(p.t||'').toLowerCase(),kind=String(p.k||'').toLowerCase(),pins=typeof pinsOf==='function'?pinsOf(p):[];
  const vPins=pins.filter(l=>/^(VCC|VIN|VS|VM|VMOT|V\+|VDD|5V|3V3|3\.3V|\+)$/.test(l));
  vPins.forEach(l=>{const n=pinNet(p,l);if(n===null)return;const source=boardNets.get(n)||[];if(source.some(q=>q.k==='p5')&&/mpu6050|mpu9250|qmc|rc522|max301|esp32cam|sx127|3v3only|bmp280|bme280/i.test(type+' '+kind))add('danger','Possible 5 V overvoltage',PT[p.t]?.[0]+' appears connected directly to the 5 V rail. Check its exact module rating before powering it.')});
  if(/hc.?sr04|ultrasonic/i.test(type+' '+kind)&&/esp32|cam|s2|s3|c3|nodemcu|pico/i.test(S.bt)){const echo=pins.find(l=>/ECHO/i.test(l));if(echo){const n=pinNet(p,echo),source=n===null?[]:(boardNets.get(n)||[]);if(source.some(q=>q.k==='io'))add('warning','Check ultrasonic ECHO voltage','HC-SR04 ECHO can output 5 V. Use a suitable voltage divider or level shifter before a 3.3 V GPIO.')}}
  if(/servo|stepper|motor|fan/i.test(type+' '+kind)){pins.forEach(l=>{const n=pinNet(p,l);if(n!==null&&(boardNets.get(n)||[]).some(q=>q.k==='io'))add('warning','Motor load on a GPIO','A motor or servo signal is connected to a board pin. Power the load correctly and use a suitable driver where required.')})}
  if(kind==='led'||/^led/.test(type)){const labels=pins.length?pins:['A','K'],hasRes=labels.some(l=>resistors.some(r=>pinsOf(r).some(rl=>S.wires.some(w=>(w.a===p.id+':'+l&&w.b===r.id+':'+rl)||(w.b===p.id+':'+l&&w.a===r.id+':'+rl)))));if(!hasRes){const direct=labels.some(l=>{const n=pinNet(p,l);return n!==null&&(boardNets.get(n)||[]).some(q=>q.k==='io'||q.k==='p5'||q.k==='p3')});if(direct)add('danger','LED may be missing a resistor','Place a suitable series resistor in the LED path to limit current and protect the LED and board pin.')}}
 });
 return messages;
 }
 function render(){const box=$('#diag');if(!box)return;const issues=analyze();box.innerHTML='';const head=document.createElement('div');head.className='vx-diag-head';const title=document.createElement('b');title.textContent='Electrical health check';const count=document.createElement('span');count.className='vx-diag-count '+(issues.some(x=>x.level==='danger')?'has-danger':issues.length?'has-warning':'is-clean');count.textContent=issues.length?issues.length+' issue'+(issues.length===1?'':'s'):'No detected issues';head.append(title,count);box.appendChild(head);
 const intro=document.createElement('p');intro.className='vx-diag-intro';intro.textContent='Checks common wiring risks using the simulator’s component and pin model. This is a helpful warning system, not a substitute for a datasheet or a real electrical test.';box.appendChild(intro);
 if(!issues.length){const clean=document.createElement('div');clean.className='vx-diag-clean';clean.textContent=S.parts.length?'No common wiring hazards detected in the current circuit.':'Add components and wires to run electrical checks.';box.appendChild(clean)}
 issues.forEach(issue=>{const card=document.createElement('article');card.className='vx-diag-card '+issue.level;const badge=document.createElement('span');badge.className='vx-diag-icon';badge.textContent=issue.level==='danger'?'!':'i';const body=document.createElement('div'),name=document.createElement('b'),detail=document.createElement('p');name.textContent=issue.title;detail.textContent=issue.detail;body.append(name,detail);card.append(badge,body);box.appendChild(card)});
 }
 setInterval(()=>{try{render()}catch(e){}},1100);document.querySelectorAll('.tabs button[data-t="diag"]').forEach(b=>b.addEventListener('click',render));window.VOLTIXRunDiagnostics=render;
})();
