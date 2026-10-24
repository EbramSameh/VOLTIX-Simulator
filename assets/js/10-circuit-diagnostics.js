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
