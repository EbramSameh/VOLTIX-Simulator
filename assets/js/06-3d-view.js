/* Three.js 3D workspace and camera controls. */

/* ===== MODULE 8: real 3D view (Three.js) ===== */
(()=>{let sc,cm,rn,grp,tg,az=.6,el=.85,dist=13,raf=0,sig='',fc=0,drag=null;const K=60;
 const css=document.createElement('style');css.textContent='#v3d{position:absolute;inset:0;z-index:7;background:#0a0a0b}#v3d canvas{position:absolute;inset:0;width:100%;height:100%}#v3d .hint{position:absolute;left:14px;top:14px;padding:9px 12px;border:1px solid #414348;border-radius:8px;background:#111214f2;font-size:12px;color:#f4f4f5;z-index:1;box-shadow:0 8px 24px #0008}#v3d .hint:after{content:" • LIVE CIRCUIT";color:#ff7043;font-weight:700;margin-left:8px}#v3d .vx-3d-cameras{position:absolute;right:14px;top:14px;z-index:2;display:flex;gap:6px}#v3d .vx-3d-cameras button{background:#151619;border:1px solid #4a4d52;color:#f4f4f5;padding:8px 11px;border-radius:7px;font:600 11px Inter,Arial;cursor:pointer}#v3d .vx-3d-cameras button:hover{border-color:#ff7043;color:#ff987a}';document.head.appendChild(css);
 const box=document.createElement('div');box.id='v3d';box.hidden=true;box.innerHTML='<div class="hint">Interactive hardware view · Drag to orbit · Scroll to zoom</div><div class="vx-3d-cameras"><button type="button" data-v3-camera="iso">Isometric</button><button type="button" data-v3-camera="front">Front</button><button type="button" data-v3-camera="top">Top</button><button type="button" data-v3-camera="reset">Reset</button></div>';$('#cvw').appendChild(box);
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.55,metalness:.1},o||{}));
 const bx=(w,h,d,c,x,y,z,o)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c,o));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;return m};
 const cy=(r,h,c,x,y,z,o,hz)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,24),M(c,o));m.position.set(x,y,z);if(hz)m.rotation.z=Math.PI/2;m.castShadow=true;return m};
 const boardFace=(g,w,h,kind,topY=.132)=>{const c=document.createElement('canvas');c.width=1024;c.height=768;const x=c.getContext('2d');x.clearRect(0,0,1024,768);x.fillStyle='#f4f6f8';x.globalAlpha=.92;x.font='bold 54px Arial';x.fillText(kind==='uno'?'ARDUINO':String(kind).toUpperCase(),70,105);x.font='bold 34px Arial';x.fillText(kind==='uno'?'UNO':'MODULE',72,150);x.globalAlpha=.72;x.font='bold 19px monospace';if(kind==='uno'){['DIGITAL 0-13','POWER','ANALOG IN A0-A5'].forEach((t,i)=>x.fillText(t,70,220+i*42));x.font='bold 62px Arial';x.fillText('∞',470,390);x.font='bold 20px Arial';x.fillText('ATmega328P',420,550)}else{x.fillText('VCC  GND  SDA  SCL',70,220);x.fillText('SENSOR BREAKOUT',70,265)}const tex=new THREE.CanvasTexture(c);tex.anisotropy=8;const m=new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:.82,depthWrite:false,side:THREE.DoubleSide});const p=new THREE.Mesh(new THREE.PlaneGeometry(w-.08,h-.08),m);p.rotation.x=-Math.PI/2;p.position.y=topY;g.add(p)};
 const smd=(g,x,z,w=.12,h=.1,c='#242a31')=>{g.add(bx(w,.075,h,c,x,.18,z,{roughness:.52}));g.add(bx(w*.72,.012,h*.65,'#11161d',x,.222,z));g.add(bx(.025,.025,h*.75,'#c5cbd0',x-w*.48,.18,z,{metalness:.7}));g.add(bx(.025,.025,h*.75,'#c5cbd0',x+w*.48,.18,z,{metalness:.7}))};
 const cap3=(g,x,z,c='#d5d9df')=>{g.add(cy(.075,.2,c,x,.2,z,{metalness:.45}));g.add(cy(.077,.025,'#9ca3af',x,.305,z,{metalness:.75}));g.add(bx(.025,.12,.025,'#cbd5e1',x,.18,z+.07,{metalness:.8}))};
 const pinRow=(g,x,z,count,spacing,dir=1)=>{for(let i=0;i<count;i++){const px=x+i*spacing*dir;g.add(bx(.075,.11,.075,'#11151b',px,.16,z));g.add(cy(.024,.15,'#d7b66d',px,.235,z,{metalness:.9,roughness:.22}));g.add(cy(.012,.018,'#fff0b5',px,.31,z,{metalness:.9}))}};

 function part3(p){const g=new THREE.Group(),k=p.k,s=p.st,ud={};g.position.set((p.x+(k=='piboard'?150:88))/K,0,(p.y+(k=='piboard'?110:52))/K);const lead=()=>g.add(cy(.012,.95,'#cbd5e1',0,.12,0,{metalness:.9},1));
  if(k=='piboard'){g.add(bx(2.5,.12,1.65,'#166534',0,.06,0,{roughness:.55}));g.add(bx(.72,.18,.52,'#111827',-.62,.19,-.28));g.add(bx(.48,.15,.4,'#111827',.12,.18,-.28));g.add(bx(.48,.15,.4,'#111827',.7,.18,-.28));g.add(bx(.9,.1,.34,'#0f172a',.1,.16,.42));}
  else if(k=='led'){const col=LC[s.color||'red'][0];g.add(cy(.17,.14,'#d1d5db',0,.1,0));const dm=new THREE.Mesh(new THREE.SphereGeometry(.15,20,12,0,6.3,0,1.6),M(col,{transparent:true,opacity:.88,emissive:col,emissiveIntensity:0}));dm.position.y=.17;g.add(dm);ud.led=dm}
  else if(k=='res'){lead();g.add(cy(.075,.5,'#d9b88f',0,.12,0,{},1));bands(s.ohm||220).forEach((c,i)=>g.add(cy(.08,.045,c,-.13+i*.1,.12,0,{},1)))}
  else if(k=='cap'){if(s.ctype=='ceramic')g.add(cy(.17,.06,'#f59e0b',0,.25,0));else{g.add(cy(.16,.42,'#1e3a8a',0,.24,0));g.add(bx(.04,.4,.1,'#cbd5e1',-.14,.24,0))}}
  else if(k=='ind'){lead();g.add(cy(.1,.5,'#7c2d12',0,.12,0,{},1));for(let i=0;i<6;i++)g.add(cy(.105,.03,'#d97706',-.2+i*.08,.12,0,{metalness:.7},1))}
  else if(k=='dio'||k=='fuse'){lead();g.add(cy(.06,.38,k=='fuse'?'#bae6fd':'#111827',0,.12,0,k=='fuse'?{transparent:true,opacity:.5}:{},1));g.add(cy(.062,.05,'#e5e7eb',.12,.12,0,{},1))}
  else if(k=='out'||k=='stepc'||k=='step'||k=='a4988'){const r=new THREE.Group();g.add(cy(.28,.34,p.t=='fan'?'#1f2937':'#8a93c8',0,.2,0,{metalness:.6}));r.add(bx(.5,.03,.07,'#c4b5fd',0,.4,0),bx(.07,.03,.5,'#c4b5fd',0,.4,0));g.add(r);ud.rot=r}
  else if(k=='servo'){g.add(bx(.7,.35,.34,'#2f5fe0',0,.18,0));const arm=new THREE.Group();arm.add(bx(.55,.05,.1,'#f5f6ff',.2,0,0));arm.position.set(-.12,.4,0);g.add(arm);ud.arm=arm}
  else if(k=='bat'){g.add(bx(.7,.5,.4,'#111827',0,.26,0));g.add(bx(.7,.12,.4,'#f59e0b',0,.56,0))}
  else if(k=='disp'){g.add(bx(1.5,.1,.9,'#1b2166',0,.06,0));g.add(bx(1.2,.03,.62,p.t=='lcd'?'#a8e063':'#02040f',0,.13,-.02,{emissive:p.t=='lcd'?'#3b5a1a':'#06202a',emissiveIntensity:.8}))}
  else if(['us','dht','dig','i2c','relay','sx','a4988'].includes(k)){
   const W=Math.max(1.1,PT[p.t][3].split(' ').length*12/K+.4),H=.95;
   const pcb=p.t==='hcsr04'||p.t==='hc-sr04'?'#1b5f9b':p.t==='relay'?'#235b91':p.t==='a4988'?'#a83236':'#202832';
   g.add(bx(W,.08,H,pcb,0,.04,0,{roughness:.58,metalness:.12}));
   boardFace(g,W,H,p.t,.082);
   const pn=String(PT[p.t][3]||'').trim().split(/\\s+/).filter(Boolean).length;
   pinRow(g,-W*.36,H*.39,Math.max(3,pn),W*.72/Math.max(2,pn-1));
   smd(g,-W*.24,-H*.23,.12,.09);smd(g,W*.24,-H*.23,.12,.09);
   if(k==='us'){
    [-.25,.25].forEach(x=>{g.add(cy(.19,.13,'#aeb6bf',x,.17,-.18,{metalness:.82,roughness:.24}));g.add(cy(.145,.018,'#343a42',x,.245,-.18,{roughness:.3}));g.add(cy(.11,.012,'#11161d',x,.258,-.18,{roughness:.2}))});
    g.add(bx(.16,.12,.14,'#151a20',0,.13,.22));
   }else if(k==='dht'){
    g.add(bx(.48,.38,.42,'#e7e9e8',0,.25,-.12,{roughness:.8}));
    for(let i=0;i<5;i++)g.add(bx(.32,.018,.025,'#9da4a8',0,.27+i*.055,.105,{roughness:.9}));
    g.add(bx(.12,.12,.08,'#c7cccf',0,.12,.12));
   }else if(k==='dig'){
    const dome=new THREE.Mesh(new THREE.SphereGeometry(.28,28,18,0,Math.PI*2,0,Math.PI*.52),M('#e9edf0',{roughness:.3,transparent:true,opacity:.86}));dome.position.set(0,.29,-.12);g.add(dome);
    g.add(bx(.34,.18,.32,'#171c22',0,.16,-.12));
   }else if(k==='relay'){
    g.add(bx(.55,.38,.48,'#2869a3',0,.27,-.12,{roughness:.42}));
    g.add(bx(.38,.02,.3,'#d7e2ec',0,.47,-.12,{metalness:.35}));
   }else if(k==='a4988'){
    g.add(bx(.62,.25,.48,'#22272e',0,.22,-.1,{metalness:.55}));
    for(let i=0;i<5;i++)g.add(bx(.06,.34,.07,'#aeb5bd',-.22+i*.11,.48,-.1,{metalness:.78}));
   }else if(k==='i2c'){
    g.add(bx(.32,.12,.32,'#171b20',0,.17,-.12));
    for(let i=-1;i<=1;i++){g.add(bx(.035,.07,.08,'#c4c9ce',i*.09,.12,-.3,{metalness:.8}));g.add(bx(.035,.07,.08,'#c4c9ce',i*.09,.12,.06,{metalness:.8}))}
   }else{
    g.add(bx(.32,.16,.3,'#22272e',0,.16,-.12));
    g.add(cy(.13,.09,'#aeb7c0',.25,.16,.12,{metalness:.7}));
   }
  }else if(window.P3X&&window.P3X(p,g,K,M,bx,cy)){}else{const W=Math.max(1.1,PT[p.t][3].split(' ').length*12/K+.4);g.add(bx(W,.07,.95,MC(p.t),0,.06,.1));g.add(bx(.45,.09,.35,'#111827',0,.13,0));if(k=='hb')g.add(bx(.7,.35,.4,'#374151',0,.25,0))}
  const n=((PT[p.t]&&PT[p.t][3])||'').trim().split(/\\s+/).filter(Boolean).length,cx=k=='piboard'?150:88,cy0=k=='piboard'?110:52;for(let i=0;i<n;i++){const q=pinPos(p,i);g.add(bx(.06,.22,.06,'#e8c26a',(q[0]-cx)/K,.11,(q[1]-cy0)/K))}
  g.userData=Object.assign(ud,{p});return g}
 function board3(){
 const g=new THREE.Group(),W=S.bw/K,H=S.bh/K,uno=S.bt==='uno'||S.bt==='unor4',col={uno:'#087f86',unor4:'#087f86',mega:'#0a7c86',leo:'#0a7c86',nano:'#1f5fbf',pro:'#b3262f',pico:'#0b7a3d',esp32:'#176b52',cam:'#176b52'}[S.bt]||'#171b26';
 g.position.set((S.bx+S.bw/2)/K,0,(S.by+S.bh/2)/K);
 g.add(bx(W,.13,H,col,0,.065,0,{roughness:.48,metalness:.08}));boardFace(g,W,H,uno?'uno':S.bt);
 const chip=(x,z,w,h,label)=>{g.add(bx(w,.17,h,'#20242b',x,.19,z,{roughness:.6}));g.add(bx(w*.72,.035,h*.7,'#11151b',x,.29,z,{roughness:.35}));for(let q=-2;q<=2;q++){g.add(bx(.035,.09,.045,'#c8ccd0',x+q*w*.15,.13,z-h*.52));g.add(bx(.035,.09,.045,'#c8ccd0',x+q*w*.15,.13,z+h*.52))}return label};
 const pad=(x,z)=>g.add(cy(.07,.018,'#0c1720',x,.14,z,{roughness:.8}));
 const header=(x,z,n,dx)=>{for(let q=0;q<n;q++){const px=x+q*dx;g.add(bx(.075,.12,.075,'#111318',px,.16,z));g.add(cy(.022,.14,'#d6b86b',px,.22,z,{metalness:.85}))}};
 if(uno){
  // USB-B connector, barrel jack, voltage regulator and USB interface.
  g.add(bx(.43,.28,.58,'#b9c0c9',-W*.42,.19,-H*.23,{metalness:.82,roughness:.28}));
  g.add(bx(.30,.12,.34,'#252a32',-W*.42,.37,-H*.23,{metalness:.25}));g.add(bx(.24,.075,.012,'#090c10',-W*.42,.37,-H*.405,{roughness:.25}));g.add(bx(.17,.035,.014,'#8d969f',-W*.42,.385,-H*.414,{metalness:.85}));
  g.add(bx(.36,.27,.38,'#171b22',-W*.43,.18,H*.17,{roughness:.5}));g.add(cy(.105,.19,'#090b0e',-W*.43,.26,H*.17,{roughness:.25},1));g.add(cy(.075,.025,'#4b535d',-W*.43,.26,H*.17,{metalness:.7},1));
  g.add(bx(.27,.14,.3,'#222830',-W*.31,.16,H*.31));
  chip(-W*.19,-H*.23,.45,.36,'USB interface');
  chip(W*.12,H*.06,.76,.42,'ATmega328P');
  chip(W*.3,-H*.22,.35,.28,'regulator');
  chip(-W*.08,H*.3,.24,.2,'op amp');
  g.add(bx(.18,.2,.14,'#f1f3f5',W*.05,.19,-H*.29,{metalness:.25}));
  g.add(cy(.085,.11,'#d6d9df',W*.28,.18,-H*.31,{metalness:.8}));
  g.add(cy(.07,.1,'#d6d9df',W*.36,.18,-H*.31,{metalness:.8}));
  g.add(bx(.13,.16,.12,'#161a20',W*.44,.18,-H*.05));
  // Reset switch and status LEDs.
  g.add(bx(.18,.12,.16,'#d8dce1',-W*.2,.16,H*.31,{metalness:.55}));
  ['#39d98a','#ffcb4d','#e7eaf0'].forEach((c,n)=>g.add(cy(.035,.025,c,W*(.22+n*.075),.16,-H*.28,{emissive:c,emissiveIntensity:.18})));
  pinRow(g,-W*.36,-H*.43,14,W*.055);pinRow(g,-W*.34,H*.43,8,W*.052);pinRow(g,W*.12,H*.43,6,W*.052);cap3(g,-W*.03,-H*.29);cap3(g,W*.34,H*.18);smd(g,W*.31,-H*.28,.12,.09);smd(g,W*.39,-H*.28,.12,.09);smd(g,-W*.27,H*.27,.12,.08);smd(g,-W*.13,H*.27,.1,.08);
 }else{
  chip(-W*.08,-H*.1,Math.min(.75,W*.3),Math.min(.42,H*.2),'main controller');
  g.add(bx(W*.24,.16,H*.42,'#20252b',W*.28,.17,-H*.02,{metalness:.45}));
  pinRow(g,-W*.43,-H*.42,Math.max(4,Math.floor(W*2)),W*.86/Math.max(3,Math.floor(W*2)-1));pinRow(g,-W*.43,H*.42,Math.max(4,Math.floor(W*2)),W*.86/Math.max(3,Math.floor(W*2)-1));smd(g,-W*.28,-H*.18);smd(g,W*.25,H*.18);cap3(g,W*.32,-H*.18);
  if(/esp32|cam|nodemcu|s2|s3|c3/.test(S.bt)){g.add(bx(W*.26,.06,H*.12,'#c9ced6',W*.27,.2,-H*.28,{metalness:.7}));g.add(bx(W*.08,.035,H*.22,'#c4ccd5',W*.39,.17,-H*.28,{metalness:.75}));g.add(bx(W*.22,.025,H*.09,'#9ca3af',W*.27,.245,-H*.28,{metalness:.8}));smd(g,-W*.28,H*.22,.12,.08);smd(g,-W*.18,H*.22,.1,.08)}
 }
 ['u','d'].forEach(d=>{const r=S.bp.filter(q=>q.d==d);if(r.length)g.add(bx((r[r.length-1].x-r[0].x+14)/K,.11,.2,'#101318',((r[0].x+r[r.length-1].x)/2-S.bw/2)/K,.16,(r[0].y-S.bh/2)/K))});
 S.bp.forEach(q=>g.add(bx(.065,.2,.065,'#e5c77a',(q.x-S.bw/2)/K,.23,(q.y-S.bh/2)/K,{metalness:.85})));
 // Four plated mounting holes with a subtle metal rim.
 [[-.44,-.4],[.44,-.4],[-.44,.4],[.44,.4]].forEach(([x,z])=>{pad(W*x,H*z);g.add(cy(.085,.025,'#8e9aa7',W*x,.14,H*z,{metalness:.8}));pad(W*x,H*z)});
 return g
}
function wire3(w){const r=wroute(w);let pts=r.map((p,j)=>new THREE.Vector3(p.x/K,j==0||j==r.length-1?.3:.45,p.y/K));if(!(w.pts&&w.pts.length)){const a=pts[0],b=pts[pts.length-1],d=a.distanceTo(b);pts=[a,new THREE.Vector3((a.x+b.x)/2,.3+Math.min(.5,d*.07),(a.z+b.z)/2),b]}
  const m=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),48,.034,10,false),M(w.c,{roughness:.35}));m.castShadow=true;return m}
 function disposeTree(root){root.traverse(o=>{if(o.geometry&&typeof o.geometry.dispose==='function')o.geometry.dispose();if(o.material){const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>{if(m&&typeof m.dispose==='function')m.dispose()})}})}
 function build(){grp.children.slice().forEach(o=>{disposeTree(o);grp.remove(o)});grp.add(board3());S.parts.forEach(p=>{try{grp.add(part3(p))}catch(e){const g=new THREE.Group();g.position.set((p.x+88)/K,.08,(p.y+52)/K);g.add(bx(.9,.16,.7,'#64748b',0,0,0));g.userData={p};grp.add(g);console.warn('[VOLTIX 3D] Fallback geometry for '+(p.t||'component'),e)}});S.wires.forEach(w=>{try{grp.add(wire3(w))}catch(e){console.warn('[VOLTIX 3D] Could not render wire',w,e)}})}
 function cam3(){cm.position.set(tg.x+dist*Math.cos(el)*Math.sin(az),tg.y+dist*Math.sin(el),tg.z+dist*Math.cos(el)*Math.cos(az));cm.lookAt(tg)}
 function init(){if(rn)return;rn=new THREE.WebGLRenderer({antialias:true});rn.setPixelRatio(Math.min(devicePixelRatio,2));rn.shadowMap.enabled=true;rn.shadowMap.type=THREE.PCFSoftShadowMap;box.appendChild(rn.domElement);sc=new THREE.Scene();sc.background=new THREE.Color('#0a0a0b');sc.fog=new THREE.Fog(0x0a0a0b,28,70);cm=new THREE.PerspectiveCamera(38,1,.1,200);tg=new THREE.Vector3();grp=new THREE.Group();sc.add(grp);
  sc.add(new THREE.HemisphereLight(0xf5f7fa,0x25282d,1.05));const dl=new THREE.DirectionalLight(0xffffff,2.1);dl.position.set(7,12,8);dl.castShadow=true;dl.shadow.mapSize.set(2048,2048);Object.assign(dl.shadow.camera,{left:-25,right:25,top:25,bottom:-25,near:1,far:60});sc.add(dl);const fill=new THREE.DirectionalLight(0xffffff,.75);fill.position.set(-8,5,-6);sc.add(fill);const rim=new THREE.PointLight(0xff7043,.8,30);rim.position.set(0,5,5);sc.add(rim);
  const gr=new THREE.Mesh(new THREE.PlaneGeometry(WS.w/K,WS.h/K),M('#111214',{roughness:.82}));gr.rotation.x=-Math.PI/2;gr.position.set(WS.w/K/2,-.001,WS.h/K/2);gr.receiveShadow=true;sc.add(gr);const gd=new THREE.GridHelper(30,60,0x4b4d51,0x25272b);gd.position.set(15,0,10);sc.add(gd);
  new ResizeObserver(()=>{const w=box.clientWidth,h=box.clientHeight;if(w&&h){rn.setSize(w,h);cm.aspect=w/h;cm.updateProjectionMatrix()}}).observe(box);
  box.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,b:e.button};box.setPointerCapture(e.pointerId)});box.addEventListener('pointerup',()=>drag=null);box.addEventListener('contextmenu',e=>e.preventDefault());
  box.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;if(drag.b==2||e.shiftKey){const s=dist*.0016;tg.x-=(dx*Math.cos(az)+dy*Math.sin(az)*Math.sin(el))*s;tg.z+=(dx*Math.sin(az)-dy*Math.cos(az)*Math.sin(el))*s}else{az-=dx*.006;el=Math.max(.08,Math.min(1.5,el+dy*.006))}cam3()});
  box.addEventListener('wheel',e=>{e.preventDefault();dist=Math.max(3,Math.min(40,dist*(e.deltaY>0?1.1:.9)));cam3()},{passive:false});
  box.querySelectorAll('[data-v3-camera]').forEach(b=>b.addEventListener('click',()=>{const v=b.dataset.v3Camera;if(v==='front'){az=0;el=.18}else if(v==='top'){az=0;el=1.48}else{az=.55;el=1.02}if(v==='reset'){const B=boxes(),x0=Math.min(...B.map(r=>r.x)),x1=Math.max(...B.map(r=>r.x+r.w)),y0=Math.min(...B.map(r=>r.y)),y1=Math.max(...B.map(r=>r.y+r.h));tg.set((x0+x1)/2/K,0,(y0+y1)/2/K);dist=Math.max(6,Math.max(x1-x0,y1-y0)/K*.95)}cam3()}))}
 function loop(){if(box.hidden)return;raf=requestAnimationFrame(loop);if(++fc%12==0){const sg=JSON.stringify([S.bt,S.bx,S.by,S.wires,S.parts.map(p=>[p.id,p.t,p.x,p.y,p.st.color,p.st.ohm,p.st.ctype])]);if(sg!==sig){sig=sg;build()}}
  grp.children.forEach(g=>{const u=g.userData,p=u.p;if(!p)return;const s=p.st;if(u.led)u.led.material.emissiveIntensity=s.burnt?0:Math.min(1,(MN.I[p.id]||0)/.012)*2.2;if(u.rot)u.rot.rotation.y=-(s.ang||0)*Math.PI/180;if(u.arm){const q=S.bp.find(q=>H.sv[q.n]&&SO.f('b:'+q.l)==SO.f(p.id+':SIG'));u.arm.rotation.y=(90-(q?H.sv[q.n].a:90))*Math.PI/180}});rn.render(sc,cm)}
 function open3(){try{init()}catch(e){return toast('WebGL is not available in this browser.',1)}box.hidden=false;$('#v3').textContent='Close 3D';sig='';build();const B=boxes(),x0=Math.min(...B.map(r=>r.x)),x1=Math.max(...B.map(r=>r.x+r.w)),y0=Math.min(...B.map(r=>r.y)),y1=Math.max(...B.map(r=>r.y+r.h));tg.set((x0+x1)/2/K,0,(y0+y1)/2/K);dist=Math.max(6,Math.max(x1-x0,y1-y0)/K*.95);az=.5;el=1.02;cam3();loop()}
 $('#v3').onclick=()=>{if(!box.hidden){box.hidden=true;cancelAnimationFrame(raf);$('#v3').textContent='3D view';return}if(window.THREE)return open3();const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.min.js';s.onload=open3;s.onerror=()=>toast('The 3D engine could not load (blocked or offline).',1);document.head.appendChild(s)}})();
