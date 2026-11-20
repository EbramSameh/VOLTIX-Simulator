/* VOLTIX physical component artwork + package-aware pin placement.
   SVG is an illustrative top view; pin coordinates are tied to the named package,
   not a generic row at the bottom of every component. */
(()=> {
  if(typeof shape!=='function'||typeof PT==='undefined'||typeof S==='undefined'||typeof pinsOf!=='function')return;
  const $=s=>document.querySelector(s);
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const side = {
    // Breakout boards with a single edge connector
    mpu6050:'bottom',adxl345:'bottom',bmp280:'bottom',ina219:'bottom',max30:'bottom',
    bme280:'bottom',sht31:'bottom',rtc:'bottom',ads:'bottom',dac:'bottom',pca:'bottom',
    qmc:'bottom',tcs:'bottom',apds:'bottom',vl53:'bottom',mpu9250:'bottom',
    gps:'bottom',hc05:'bottom',rfid:'bottom',nrf:'bottom',lora:'bottom',max485:'bottom',
    sdc:'bottom',hx711:'bottom',npk:'bottom',irr:'bottom',enc:'bottom',keypad:'bottom',
    soil:'bottom',soilc:'bottom',rain:'bottom',wlevel:'bottom',turb:'bottom',tds:'bottom',
    mq135:'bottom',ph:'bottom',vsens:'bottom',uvs:'bottom',ecg:'bottom',eeg:'bottom',emg:'bottom',
    // Three-pin headers and compact modules
    servo:'bottom',aicam:'bottom',pir:'bottom',ir:'bottom',flame:'bottom',touch:'bottom',
    hall:'bottom',ds18:'bottom',irr:'bottom',pot:'bottom',vibs:'bottom',snd:'bottom',sndl:'bottom',lux:'bottom',press:'bottom',
    loadc:'bottom',fsr:'bottom',flex:'bottom',tmp36:'bottom',lm35:'bottom',
    // Power boards expose terminal blocks on opposite sides
    lm2596:'dual',mt3608:'dual',ams1117:'bottom',lm7805:'bottom',
    // Larger driver boards
    l298:'driver',tb6612:'driver',a4988:'dual',drv8825:'dual',
    relay:'relay',us:'bottom',dht11:'bottom',dht22:'bottom',
    lcd:'bottom',oled:'bottom',neo:'bottom',seg7:'bottom',step28:'bottom'
  };
  const bottomTypes=new Set(['led','rgb','cap','buz','mot','fan','vib','sol','spk','laser','nema','nema17','stepc','bat','dmm']);
  const moduleKinds=new Set(['an','dig','i2c','vis','sx','us','dht','relay','neo','sd','reg','pca','a4988','step','disp','seg','dmm','uart','rfid','hb']);
  const isThrough=p=>['res','ind','dio','fuse'].includes(p.k);
  function dimensions(p){
    if(p.k==='piboard')return[300,220];
    if(isThrough(p))return[144,100];
    if(p.k==='disp')return[220,150];
    if(p.t==='l298')return[210,154];
    if(p.t==='tb6612')return[180,132];
    if(p.t==='a4988'||p.t==='drv8825')return[154,132];
    if(p.t==='us')return[176,112];
    if(p.t==='relay')return[174,124];
    if(p.t==='lm2596'||p.t==='mt3608')return[176,128];
    if(side[p.t]||moduleKinds.has(p.k))return[Math.max(168,Math.min(260,pinsOf(p).length*18+30)),124];
    if(bottomTypes.has(p.t)||bottomTypes.has(p.k))return[144,112];
    return[148,116];
  }
  function point(p,label,index,w,h){
    const t=p.t, pins=pinsOf(p), n=pins.length, layout=side[t]|| (moduleKinds.has(p.k)?'bottom':null);
    const at=(x,y,d)=>[x,y,d];
    if(p.k==='piboard')return [index%2===0?12:288,42+Math.floor(index/2)*7.1,index%2===0?'l':'r'];
    if(isThrough(p))return at(index===0?56:120,52,index===0?'l':'r');
    if(t==='led')return at(label==='A'?82:94,104,'d');
    if(t==='rgb')return at([79,85,91,97][index]||88,104,'d');
    if(t==='cap')return at(index===0?79:97,104,'d');
    if(t==='buz')return at(index===0?78:98,104,'d');
    if(t==='dht11'||t==='dht22')return at([64,80,96,112][index]||88,h+8,'b');
    if(t==='us')return at([52,76,100,124][index]||88,h+8,'b');
    if(t==='seg7'){
      const left=['A','B','C','D','E'],right=['F','G','DP','COM'];
      const group=left.includes(label)?left:right,idx=group.indexOf(label);
      return at(left.includes(label)?-8:w+8,32+idx*(h-64)/Math.max(1,group.length-1),left.includes(label)?'l':'r');
    }
    if(layout==='left'){
      const y=34+index*(h-68)/Math.max(1,n-1);
      return at(-8,y,'l');
    }
    if(layout==='dual'){
      const leftLabels=t==='lm2596'||t==='mt3608'?['IN+','IN-']:t==='a4988'||t==='drv8825'?['VMOT','GND','VDD','EN']:['VM','VCC','GND','AIN1','AIN2','PWMA'];
      const left=leftLabels.includes(label);
      const group=pins.filter(x=>leftLabels.includes(x));
      const right=pins.filter(x=>!leftLabels.includes(x));
      const list=left?group:right,idx=list.indexOf(label);
      return at(left?-8:w+8,30+idx*(h-60)/Math.max(1,list.length-1),left?'l':'r');
    }
    if(t==='l298'){
      // L298N module: three supply screw terminals at the top, paired motor
      // outputs on the sides, and six logic/control header pins at the bottom.
      if(['VS','GND','5V'].includes(label)){
        const i=['VS','GND','5V'].indexOf(label);
        return at(62+i*43,-8,'t');
      }
      if(['OUT1','OUT2'].includes(label))return at(-8,label==='OUT1'?58:98,'l');
      if(['OUT3','OUT4'].includes(label))return at(w+8,label==='OUT3'?58:98,'r');
      const controls=['ENA','IN1','IN2','IN3','IN4','ENB'];
      if(controls.includes(label))return at(35+controls.indexOf(label)*28,h+8,'b');
    }
    if(layout==='driver'){
      const motor=['AO1','AO2','BO1','BO2'];
      if(motor.includes(label))return at(w+8,42+motor.indexOf(label)*22,'r');
      const control=pins.filter(x=>!motor.includes(x));
      const idx=control.indexOf(label);
      return at(-8,28+idx*(h-56)/Math.max(1,control.length-1),'l');
    }
    if(layout==='relay'){
      if(['COM','NO','NC'].includes(label)){
        const i=['COM','NO','NC'].indexOf(label);
        return at(w+8,38+i*24,'r');
      }
      const i=['VCC','IN','GND'].indexOf(label);
      return at(-8,38+Math.max(0,i)*24,'l');
    }
    if(layout==='bottom'||bottomTypes.has(t)||bottomTypes.has(p.k)){
      // Physical through-hole/header row, left-to-right in the order printed.
      const pad=Math.max(20,Math.min(32,w/(n+1)));
      return at(pad+index*(w-2*pad)/Math.max(1,n-1),h+8,'b');
    }
    // Unclassified module: pins run down the left board edge, as on common breakouts.
    return at(-8,30+index*(h-60)/Math.max(1,n-1),'l');
  }
  window.pinPos=function(p,i){
    const [w,h]=dimensions(p);p.w=w;p.h=h;
    return point(p,pinsOf(p)[i],i,w,h);
  };
  // Keep wire endpoints attached to the correct physical edge for top/bottom headers.
  window.dv=function(ref){
    if(ref[0]==='b'){
      const q=S.bp.find(x=>x.l===ref.slice(2));
      return q&&q.d==='u'?[0,-70]:[0,70];
    }
    const [id,label]=ref.split(':'),part=S.parts.find(x=>x.id===id);
    if(!part)return[0,0];
    const index=pinsOf(part).indexOf(label),q=point(part,label,index,part.w||dimensions(part)[0],part.h||dimensions(part)[1]);
    return q[2]==='t'?[0,-50]:q[2]==='b'?[0,50]:q[2]==='d'?[0,50]:q[2]==='l'?[-60,0]:[60,0];
  };
  function pinMarkup(p,w,h){
    const id=p.id,labels=pinsOf(p),t=p.t,k=p.k;
    return labels.map((label,i)=>{
      const [x,y,dir]=point(p,label,i,w,h),sidePin=dir==='l'||dir==='r';
      const cls='pin'+(/^(VCC|VIN|5V|VM|VMOT|IN\+|OUT\+)$/.test(label)?' p5':label==='3V3'||label==='VDD'?' p3':/^(GND|IN-|OUT-)$/.test(label)?' g':'');
      const text=esc(label),r=p.k==='piboard'?3.5:4.3;
      if(p.k==='piboard'){
        const tx=dir==='l'?x+7:x-7,anchor=dir==='l'?'start':'end';
        return `<circle class="${cls}" data-pin="${id}:${text}" cx="${x}" cy="${y}" r="3.5"/><text class="pl vx-pin-label" x="${tx}" y="${y+2.2}" text-anchor="${anchor}" style="font-size:5px">${esc(label.slice(1))}</text>`;
      }
      if(dir==='t'||dir==='b'){
        const edge=dir==='t'?8:h-8,ty=dir==='t'?22:h-20;
        return `<line x1="${x}" y1="${edge}" x2="${x}" y2="${y}" class="vx-pin-lead"/><circle class="${cls}" data-pin="${id}:${text}" cx="${x}" cy="${y}" r="${r}"/><text class="pl vx-pin-label" x="${x}" y="${ty}" text-anchor="middle">${text}</text>`;
      }
      if(sidePin){
        const tx=dir==='l'?17:w-17,anchor=dir==='l'?'start':'end';
        if(isThrough(p)){
          const bx=dir==='l'?56:120;
          return `<line x1="${x}" y1="${y}" x2="${bx}" y2="${y}" class="vx-pin-lead"/><circle class="${cls}" data-pin="${id}:${text}" cx="${x}" cy="${y}" r="${r}"/><text class="pl vx-pin-label" x="${tx}" y="${y+13}" text-anchor="${anchor}">${text}</text>`;
        }
        const edge=dir==='l'?8:w-8;
        return `<line x1="${x}" y1="${y}" x2="${edge}" y2="${y}" class="vx-pin-lead"/><circle class="${cls}" data-pin="${id}:${text}" cx="${x}" cy="${y}" r="${r}"/><text class="pl vx-pin-label" x="${tx}" y="${y+2.5}" text-anchor="${anchor}">${text}</text>`;
      }
      const leadTop=t==='led'||t==='rgb'?74:t==='cap'?76:t==='dht11'||t==='dht22'?78:t==='us'?90:h-22;
      const ty=y-12;
      return `<line x1="${x}" y1="${leadTop}" x2="${x}" y2="${y}" class="vx-pin-lead"/><circle class="${cls}" data-pin="${id}:${text}" cx="${x}" cy="${y}" r="${r}"/><text class="pl vx-pin-label" x="${x}" y="${ty}" text-anchor="middle">${text}</text>`;
    }).join('');
  }
  const screw=(x,y)=>`<g pointer-events="none"><circle cx="${x}" cy="${y}" r="3.4" fill="#b8c2ca" stroke="#43515c" stroke-width="1"/><path d="M${x-1.8} ${y+1.8}L${x+1.8} ${y-1.8}" stroke="#34404a" stroke-width="1.1"/></g>`;
  function boardArt(p,w,h){
    const t=p.t,k=p.k;
    // Most module artwork already contains its own PCB. L298N is drawn here
    // because its terminal blocks and separated control header need a custom layout.
    if(t!=='l298')return '';
    const green=['l298','tb6612','relay','mpu6050','adxl345','bmp280','ina219','bme280','sht31','rtc','ads','dac','pca','qmc','tcs','apds','vl53','max30','gps','hc05','rfid','nrf','lora','max485','hx711','sdc','neo','aicam','pir','ir','flame','touch','hall','soil','soilc','rain','wlevel','turb','tds','mq135','ph','vsens','uvs','ecg','eeg','emg','snd','sndl','lux','press','vibs','loadc','fsr','flex','lcd','oled','seg7','step28','lm2596','mt3608','ams1117','lm7805','joy','enc','keypad'];
    if(!green.includes(t)&&!moduleKinds.has(k))return '';
    const fill=t==='l298'||t==='tb6612'?'#176b48':t==='a4988'||t==='drv8825'?'#9f2630':t==='lm2596'||t==='mt3608'?'#175aa3':t==='relay'?'#1766b8':'#176344';
    const corners=[[12,12],[w-12,12],[12,h-12],[w-12,h-12]].map(([x,y])=>screw(x,y)).join('');
    let extra='';
    if(t==='l298')extra=`<rect x="52" y="22" width="94" height="78" rx="3" fill="#252b32" stroke="#87939b" stroke-width="2"/><path d="M60 28H138M60 36H138M60 44H138M60 52H138M60 60H138M60 68H138M60 76H138" stroke="#68747e" stroke-width="3"/><rect x="65" y="104" width="78" height="12" rx="2" fill="#101820" stroke="#9aa6af"/><text x="104" y="112" text-anchor="middle" font-size="6" fill="#dce6e9">L298N</text>`+
      // Blue screw-terminal housings: supply at the top, motor outputs on both sides.
      [48,91,134].map(x=>`<rect x="${x}" y="14" width="28" height="20" rx="2" fill="#2467b8" stroke="#8eb7e5"/><circle cx="${x+14}" cy="20" r="4" fill="#b9c4cf" stroke="#586575"/><path d="M${x+14} 20v5" stroke="#4b5563" stroke-width="1.5"/>`).join('')+
      [48,88].map(y=>`<rect x="4" y="${y}" width="23" height="20" rx="2" fill="#2467b8" stroke="#8eb7e5"/><circle cx="15" cy="${y+6}" r="4" fill="#b9c4cf" stroke="#586575"/>`).join('')+
      [48,88].map(y=>`<rect x="183" y="${y}" width="23" height="20" rx="2" fill="#2467b8" stroke="#8eb7e5"/><circle cx="194" cy="${y+6}" r="4" fill="#b9c4cf" stroke="#586575"/>`).join('')+
      Array.from({length:6},(_,i)=>`<rect x="${28+i*28}" y="137" width="8" height="7" rx="1" fill="#d5b46a" stroke="#725b2e"/>`).join('');
    else if(t==='a4988'||t==='drv8825')extra=`<rect x="55" y="35" width="58" height="48" rx="3" fill="#242a32" stroke="#c5cbd1"/><circle cx="124" cy="52" r="7" fill="#c3cbd1" stroke="#6b7280"/><path d="M72 42H96M72 49H96M72 56H96M72 63H96" stroke="#7c8791" stroke-width="2"/>`;
    else if(t==='lm2596'||t==='mt3608')extra=`<rect x="54" y="32" width="44" height="40" rx="4" fill="#1d242b" stroke="#89939a"/><circle cx="118" cy="54" r="15" fill="#252b32" stroke="#9ca3af" stroke-width="3"/><circle cx="118" cy="54" r="6" fill="#aeb8c2"/><rect x="68" y="82" width="32" height="9" rx="2" fill="#d1a64a"/>`;
    else if(t==='relay')extra=`<rect x="54" y="28" width="66" height="54" rx="4" fill="#1e293b" stroke="#93a4b3"/><rect x="60" y="34" width="54" height="40" rx="3" fill="#263746"/><text x="87" y="56" text-anchor="middle" font-size="8" fill="#e8f0f5">RELAY</text>`;
    else if(t==='mpu6050'||t==='adxl345'||t==='bmp280'||t==='bme280'||t==='sht31')extra=`<rect x="62" y="34" width="42" height="34" rx="2" fill="#111820" stroke="#89949d"/><text x="83" y="54" text-anchor="middle" font-size="6.5" fill="#cbd5e1">${t.toUpperCase()}</text>`;
    else if(t==='ina219')extra=`<rect x="57" y="36" width="50" height="28" rx="2" fill="#101820" stroke="#94a3b8"/><text x="82" y="53" text-anchor="middle" font-size="7" fill="#dbeafe">INA219</text><rect x="116" y="34" width="24" height="10" rx="2" fill="#d1a64a"/>`;
    else if(t==='neo')extra=`<rect x="30" y="37" width="108" height="48" rx="3" fill="#111820" stroke="#4b5563"/>`+[0,1,2,3,4,5,6,7].map(i=>`<circle cx="${38+(i%4)*31}" cy="${49+Math.floor(i/4)*23}" r="7" fill="#293c52" stroke="#8da1b5"/>`).join('');
    else if(t==='gps')extra=`<rect x="48" y="25" width="72" height="66" rx="4" fill="#c6b98b" stroke="#f1e6bc"/><path d="M55 32H113V84H55Z" fill="none" stroke="#9b8b58" stroke-dasharray="3 2"/><text x="84" y="61" text-anchor="middle" font-size="8" fill="#51482d">GPS</text>`;
    else if(t==='sdc')extra=`<rect x="52" y="30" width="66" height="64" rx="4" fill="#111820" stroke="#9ca3af"/><rect x="62" y="39" width="46" height="34" rx="2" fill="#0b1016" stroke="#52616f"/><path d="M66 80H104" stroke="#c5a44a" stroke-width="3"/>`;
    else if(t==='hc05')extra=`<rect x="50" y="25" width="74" height="65" rx="4" fill="#1b2028" stroke="#9ca3af"/><rect x="58" y="34" width="58" height="46" rx="3" fill="#b8c0c8" stroke="#e5e7eb"/><text x="87" y="60" text-anchor="middle" font-size="8" fill="#202833">HC-05</text>`;
    else if(t==='rfid')extra=`<rect x="48" y="23" width="78" height="72" rx="4" fill="#182a55" stroke="#8ea4cc"/><path d="M59 34H115V84H59Z M67 42H107V76H67Z" fill="none" stroke="#d6e4ff" stroke-opacity=".65" stroke-width="2"/><text x="87" y="61" text-anchor="middle" font-size="7" fill="#e2e8f0">RFID</text>`;
    else if(t==='us')extra=`<rect x="10" y="22" width="156" height="68" rx="5" fill="#1760b4" stroke="#78aee8"/><circle cx="58" cy="55" r="21" fill="#cbd5e1" stroke="#526579" stroke-width="3"/><circle cx="58" cy="55" r="12" fill="#253647"/><circle cx="118" cy="55" r="21" fill="#cbd5e1" stroke="#526579" stroke-width="3"/><circle cx="118" cy="55" r="12" fill="#253647"/>`;
    else if(t==='dht11'||t==='dht22')extra=`<rect x="53" y="24" width="62" height="65" rx="5" fill="${t==='dht11'?'#3974bb':'#e4e8ef'}" stroke="#aab7c4"/><path d="M62 37H106M62 45H106M62 53H106M62 61H106" stroke="#758596" stroke-width="2"/><text x="84" y="79" text-anchor="middle" font-size="7" fill="${t==='dht11'?'#fff':'#25313d'}">${t.toUpperCase()}</text>`;
    else if(t==='lcd'||t==='oled')extra=`<rect x="38" y="30" width="92" height="62" rx="4" fill="#151c25" stroke="#8997a6"/><rect x="45" y="37" width="78" height="48" rx="2" fill="${t==='lcd'?'#a8d36c':'#07131c'}" stroke="#5d6b77"/>`;
    else if(t==='lm7805'||t==='ams1117')extra=`<rect x="56" y="34" width="56" height="42" rx="5" fill="#222a32" stroke="#8c969e"/><text x="84" y="59" text-anchor="middle" font-size="8" fill="#dce6ee">${t.toUpperCase()}</text>`;
    return `<rect x="3" y="3" width="${w-6}" height="${h-6}" rx="7" fill="${fill}" stroke="#8ba29a" stroke-width="1.5"/><rect x="7" y="7" width="${w-14}" height="${h-14}" rx="5" fill="url(#gl)" opacity=".18"/>${corners}${extra}`;
  }
  function drawPart(p){
    const d=PT[p.t],k=p.k,id=p.id,[w,h]=dimensions(p),sl=k==='dht'?['v','v2']:(k==='an'||k==='us')?['v']:[],labels=pinsOf(p);
    p.w=w;p.h=h;p.key=null;
    const isBoard=p.k==='piboard';
    const art=isBoard?`<rect x="25" y="28" width="250" height="165" rx="10" fill="#14532d" stroke="#4ade80" stroke-width="2"/>
      <rect x="46" y="48" width="70" height="54" rx="5" fill="#0f172a" stroke="#94a3b8"/><text x="81" y="70" text-anchor="middle" font-size="8" fill="#cbd5e1">Broadcom</text><text x="81" y="83" text-anchor="middle" font-size="8" fill="#cbd5e1">SoC</text>
      <rect x="140" y="48" width="52" height="42" rx="4" fill="#111827" stroke="#94a3b8"/><rect x="201" y="48" width="54" height="42" rx="4" fill="#111827" stroke="#94a3b8"/>
      <text x="166" y="72" text-anchor="middle" font-size="7" fill="#e5e7eb">RAM</text><text x="228" y="72" text-anchor="middle" font-size="7" fill="#e5e7eb">Power</text>
      <rect x="48" y="124" width="80" height="40" rx="4" fill="#1e293b" stroke="#94a3b8"/><text x="88" y="140" text-anchor="middle" font-size="7" fill="#e5e7eb">USB / LAN</text><text x="88" y="151" text-anchor="middle" font-size="7" fill="#e5e7eb">connectors</text>
      <rect x="151" y="124" width="100" height="40" rx="4" fill="#111827" stroke="#67e8f9"/><text x="201" y="140" text-anchor="middle" font-size="7" fill="#a5f3fc">40-pin header</text><text x="201" y="151" text-anchor="middle" font-size="6" fill="#a5f3fc">P1–P40</text>`:
      t==='l298'?'':shape(p.t,k,id,d,p.st.ohm,k==='led'&&typeof LC!=='undefined'?LC[p.st.color||'red']?.[0]:k==='cap'?p.st.ctype:null);
    const pcb=boardArt(p,w,h);
    const title=k==='res'?fmtOhm(p.st.ohm||220):k==='bat'?(p.st.volt||5)+' V supply':d[0];
    const controls=sl.map((s,i)=>`<foreignObject x="12" y="${h-28-(sl.length-1-i)*24}" width="114" height="22"><input type="range" min="0" max="100" value="${Math.round(p.st[s]*100)}" data-p="${id}" data-s="${s}" title="${s==='v2'?'Humidity':k==='dht'?'Temperature':k==='us'?'Distance':'Level'}"/></foreignObject>`).join('');
    const labelsMarkup=pinMarkup(p,w,h);
    return `<g id="g-${id}" class="${S.sel===id?'sel':''} vx-physical-part" transform="translate(${p.x},${p.y})">
      <rect class="pb" data-drag="${id}" width="${w}" height="${h}" rx="${isThrough(p)?7:9}"/>
      ${pcb}
      <text x="12" y="17" class="t vx-part-title">${esc(title)}</text>
      <g class="vx-part-art" pointer-events="none" transform="translate(${Math.max(0,(w-144)/2)},${Math.max(12,(h-104)/2)})">${art}</g>
      ${labelsMarkup}${controls}
      <text id="s-${id}" x="${w/2}" y="${h-24}" text-anchor="middle" class="ps"></text>
    </g>`;
  }
  const style=document.createElement('style');
  style.textContent=`
    #pl .vx-physical-part{filter:drop-shadow(0 5px 6px #0008)}
    #pl .vx-physical-part .pb{fill:#202a35;stroke:#758596;stroke-width:1.3}
    #pl .vx-physical-part:hover .pb{stroke:#54d6c5;stroke-width:1.9}
    #pl .vx-physical-part.sel .pb{stroke:#54d6c5;stroke-width:2.2}
    #pl .vx-physical-part .vx-pin-lead{stroke:#d5b46a;stroke-width:2.5;stroke-linecap:round}
    #pl .vx-physical-part .pin{stroke:#f4d58a;stroke-width:1.5;fill:#d5b56c;cursor:crosshair}
    #pl .vx-physical-part .pin.p5{fill:#f28b70;stroke:#ffd0c0}
    #pl .vx-physical-part .pin.p3{fill:#66d8c0;stroke:#c6fff0}
    #pl .vx-physical-part .pin.g{fill:#657383;stroke:#cbd5e1}
    #pl .vx-physical-part .pin:hover{stroke:#fff;stroke-width:2.6;filter:drop-shadow(0 0 4px #54d6c5)}
    #pl .vx-physical-part .vx-pin-label{font:6.5px 'JetBrains Mono',monospace;fill:#f1f5f9;paint-order:stroke;stroke:#14202a;stroke-width:2px;stroke-linejoin:round;pointer-events:none}
    #pl .vx-physical-part .vx-part-title{font-size:9px;fill:#eaf2f8}
    #pl .vx-physical-part .vx-part-art{filter:drop-shadow(0 2px 2px #0009)}
  `;
  document.head.appendChild(style);
  window.VOLTIXPhysicalComponents={version:'2.4',packages:Object.keys(side),rendered:true,geometry:point};
  if(typeof draw==='function')draw();
})();