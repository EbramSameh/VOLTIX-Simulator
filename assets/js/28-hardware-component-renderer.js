/* VOLTIX realistic hardware renderer and physical pin geometry. */
(()=>{
  const oldDraw=drawPart, oldPinPos=pinPos;
  const sideMap={
    rfid:'left',a4988:'dual',drv8825:'dual',levelshifter:'dual',
    tca9548:'dual',max485:'dual'
  };
  const moduleKinds=new Set(['an','dig','i2c','vis','sx','us','dht','relay','neo','sd','reg','pca','a4988','step','disp','seg','dmm','uart','rfid']);
  const isModule=p=>moduleKinds.has(p.k)||!!sideMap[p.t]||['gps','hc05','nrf','lora','mpu6050','mpu9250','bmp280','bme280','sht31','vl53','tcs','apds','qmc','rtc','ads','dac','hx711','pca','canbus','hc12','uartusb','hc05','nrf','lora','max485','tca9548'].includes(p.t);
  function geometry(p,i,w,h){
    const pins=pinsOf(p),n=pins.length,t=p.t;
    if(t==='piboard')return oldPinPos(p,i);
    if(['res','ind','dio','fuse'].includes(p.k))return[i?120:56,52,i?'r':'l'];
    if(p.k==='disp')return[50+i*38,122,'d'];
    if(sideMap[t]==='left')return[12,34+i*(68/Math.max(1,n-1)),'l'];
    if(sideMap[t]==='dual'){
      const half=Math.ceil(n/2),left=i<half;
      return[left?12:w-12,34+(left?i:i-half)*(68/Math.max(1,(left?half:n-half)-1)),left?'l':'r'];
    }
    const edgePad=Math.max(28,Math.min(42,w/(n+1)));
    return[edgePad+i*((w-2*edgePad)/Math.max(1,n-1)),108,'d'];
  }
  pinPos=function(p,i){return geometry(p,i,p.w||Math.max(132,pinsOf(p).length*12+24),p.h||136)};
  const screw=(x,y)=>`<g pointer-events="none"><circle cx="${x}" cy="${y}" r="3.1" fill="#b7c0ca" stroke="#313b46" stroke-width="1"/><path d="M${x-1.5} ${y+1.5}L${x+1.5} ${y-1.5}" stroke="#35404a" stroke-width=".9"/></g>`;
  const finish=(p,w)=>isModule(p)?`<g class="vx-hw-finish" pointer-events="none">
    <rect x="57" y="24" width="62" height="58" rx="5" fill="none" stroke="#d6e2cf" stroke-opacity=".23" stroke-width="1"/>
    ${screw(62,29)}${screw(114,29)}${screw(62,77)}${screw(114,77)}
    <path d="M66 84H110" stroke="#d8e6d0" stroke-opacity=".22" stroke-width="1"/>
    <text x="88" y="92" text-anchor="middle" font-size="4.8" letter-spacing=".8" fill="#e6f4df" fill-opacity=".55">${String(p.t).toUpperCase()}</text>
  </g>`:'';
  drawPart=function(p){
    const d=PT[p.t],k=p.k,ps=pinsOf(p),sl=k==='dht'?['v','v2']:(k==='an'||k==='us')?['v']:[],id=p.id;
    const h=k==='piboard'?220:(k==='disp'?150:136)+sl.length*24;
    const w=k==='piboard'?300:(k==='disp'?214:Math.max(132,ps.length*12+24));
    p.h=h;p.w=w;p.key=null;
    const piArt=`<rect x="25" y="28" width="250" height="165" rx="10" fill="#14532d" stroke="#4ade80" stroke-width="2"/><rect x="46" y="48" width="70" height="54" rx="5" fill="#0f172a" stroke="#94a3b8"/><text x="81" y="70" text-anchor="middle" font-size="8" fill="#cbd5e1">Broadcom</text><text x="81" y="83" text-anchor="middle" font-size="8" fill="#cbd5e1">SoC</text><rect x="140" y="48" width="52" height="42" rx="4" fill="#111827" stroke="#94a3b8"/><rect x="201" y="48" width="54" height="42" rx="4" fill="#111827" stroke="#94a3b8"/><text x="166" y="72" text-anchor="middle" font-size="7" fill="#e5e7eb">RAM</text><text x="228" y="72" text-anchor="middle" font-size="7" fill="#e5e7eb">Power</text><rect x="48" y="124" width="80" height="40" rx="4" fill="#1e293b" stroke="#94a3b8"/><text x="88" y="140" text-anchor="middle" font-size="7" fill="#e5e7eb">USB / LAN</text><text x="88" y="151" text-anchor="middle" font-size="7" fill="#e5e7eb">connectors</text><rect x="151" y="124" width="100" height="40" rx="4" fill="#111827" stroke="#67e8f9"/><text x="201" y="140" text-anchor="middle" font-size="7" fill="#a5f3fc">40-pin header</text><text x="201" y="151" text-anchor="middle" font-size="6" fill="#a5f3fc">P1–P40</text>`;
    const ic=k==='piboard'?piArt:k==='disp'?dispSvg(p,id,w,h):`<g class="sh3d vx-hardware-art" pointer-events="none">${shape(p.t,k,id,d,p.st.ohm,k==='led'?LC[p.st.color||'red'][0]:k==='cap'?p.st.ctype:null)}</g>`+finish(p,w)+(['btn','sw','dig'].includes(k)?`<rect data-ico="${id}" x="56" y="26" width="68" height="52" rx="8" fill="transparent" style="cursor:pointer"/>`:'');
    const pinMarkup=ps.map((l,i)=>{
      const q=geometry(p,i,w,h),x=q[0],y=q[1],dir=q[2],isSide=dir==='l'||dir==='r';
      if(k==='piboard')return `<circle class="pin" data-pin="${id}:${l}" cx="${x}" cy="${y}" r="3.8"/><text x="${x+(dir==='l'?8:-8)}" y="${y+2.5}" text-anchor="${dir==='l'?'start':'end'}" class="pl" style="font-size:5.5px">${l.slice(1)}</text>`;
      const cls='pin'+(l==='VCC'||l==='VIN'||l==='5V'?' p5':l==='3V3'?' p3':l==='GND'?' g':'');
      if(isSide){
        const tx=dir==='l'?25:w-25,anchor=dir==='l'?'start':'end',lineX=dir==='l'?22:w-22;
        return `<line x1="${lineX}" y1="${y}" x2="${x}" y2="${y}" stroke="#c8a96a" stroke-width="2.2"/><circle class="${cls}" data-pin="${id}:${l}" cx="${x}" cy="${y}" r="4.8"/><text x="${tx}" y="${y+2.4}" text-anchor="${anchor}" class="pl" style="font-size:6.2px">${l}</text>`;
      }
      return `<line x1="${x}" y1="91" x2="${x}" y2="${y}" stroke="url(#gold)" stroke-width="2.8"/><circle class="${cls}" data-pin="${id}:${l}" cx="${x}" cy="${y}" r="4.8"/><text x="${x}" y="126" text-anchor="middle" class="pl" style="font-size:6.4px">${l}</text>`;
    }).join('');
    return `<g id="g-${id}" class="${S.sel===id?'sel':''} vx-hardware-part" transform="translate(${p.x},${p.y})"><rect class="pb" data-drag="${id}" width="${w}" height="${h}" rx="10"/><text x="12" y="20" class="t">${k==='res'?fmtOhm(p.st.ohm||220):k==='bat'?(p.st.volt||5)+' V supply':d[0]}</text>${ic}${pinMarkup}<text id="s-${id}" x="88" y="136" text-anchor="middle" class="ps"></text>${sl.map((s,i)=>`<foreignObject x="10" y="${h-28-(sl.length-1-i)*24}" width="114" height="22"><input type="range" min="0" max="100" value="${Math.round(p.st[s]*100)}" data-p="${id}" data-s="${s}" title="${s==='v2'?'Humidity':k==='dht'?'Temperature':k==='us'?'Distance':'Level'}"></foreignObject>`).join('')}</g>`;
  };
  const style=document.createElement('style');
  style.textContent=`
    #pl .vx-hardware-part{filter:drop-shadow(0 7px 7px #0009)}
    #pl .vx-hardware-part .pb{fill:#202a35;stroke:#718294;stroke-width:1.35}
    #pl .vx-hardware-part:hover .pb{stroke:#5de4dc;stroke-width:1.8}
    #pl .vx-hardware-art{filter:drop-shadow(0 2px 2px #000b)}
    #pl .pin{stroke:#f4d58a;stroke-width:1.6;fill:#d5b56c;cursor:crosshair}
    #pl .pin:hover{stroke:#fff;stroke-width:2.5;filter:drop-shadow(0 0 4px #5de4dc)}
    #pl .pin.p5{fill:#f28b70;stroke:#ffd0c0}
    #pl .pin.p3{fill:#66d8c0;stroke:#c6fff0}
    #pl .pin.g{fill:#657383;stroke:#cbd5e1}
    #pl .pl{fill:#e5edf5;paint-order:stroke;stroke:#101820;stroke-width:1.8px;stroke-linejoin:round;pointer-events:none}
    #pl .vx-hw-finish{opacity:.85}
  `;
  document.head.appendChild(style);
  window.VOLTIXHardwareRenderer={version:'1.0',pinLayouts:Object.keys(sideMap),rendered:true};
  if(typeof draw==='function')draw();
})();