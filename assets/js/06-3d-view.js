/* Three.js 3D workspace and camera controls. */

/* ===== MODULE 8: real 3D view (Three.js) ===== */
(()=>{let sc,cm,rn,grp,tg,az=.6,el=.85,dist=13,raf=0,sig='',fc=0,drag=null;const K=60;
 const css=document.createElement('style');css.textContent='#v3d{position:absolute;inset:0;z-index:7;background:radial-gradient(circle at 50% 30%,#10184a,#03051a)}#v3d canvas{position:absolute;inset:0;width:100%;height:100%}#v3d .hint{position:absolute;left:12px;top:12px;padding:6px 10px;border:1px solid var(--line);border-radius:8px;background:#10173aee;font-size:12px;color:var(--mute);z-index:1}';document.head.appendChild(css);
 const box=document.createElement('div');box.id='v3d';box.hidden=true;box.innerHTML='<div class="hint">Drag to orbit, scroll to zoom, right-drag to pan. Parts and wires are live.</div>';$('#cvw').appendChild(box);
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.55,metalness:.1},o||{}));
 const bx=(w,h,d,c,x,y,z,o)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c,o));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;return m};
 const cy=(r,h,c,x,y,z,o,hz)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,24),M(c,o));m.position.set(x,y,z);if(hz)m.rotation.z=Math.PI/2;m.castShadow=true;return m};
 function part3(p){const g=new THREE.Group(),k=p.k,s=p.st,ud={};g.position.set((p.x+88)/K,0,(p.y+52)/K);const lead=()=>g.add(cy(.012,.95,'#cbd5e1',0,.12,0,{metalness:.9},1));
  if(k=='led'){const col=LC[s.color||'red'][0];g.add(cy(.17,.14,'#d1d5db',0,.1,0));const dm=new THREE.Mesh(new THREE.SphereGeometry(.15,20,12,0,6.3,0,1.6),M(col,{transparent:true,opacity:.88,emissive:col,emissiveIntensity:0}));dm.position.y=.17;g.add(dm);ud.led=dm}
  else if(k=='res'){lead();g.add(cy(.075,.5,'#d9b88f',0,.12,0,{},1));bands(s.ohm||220).forEach((c,i)=>g.add(cy(.08,.045,c,-.13+i*.1,.12,0,{},1)))}
  else if(k=='cap'){if(s.ctype=='ceramic')g.add(cy(.17,.06,'#f59e0b',0,.25,0));else{g.add(cy(.16,.42,'#1e3a8a',0,.24,0));g.add(bx(.04,.4,.1,'#cbd5e1',-.14,.24,0))}}
  else if(k=='ind'){lead();g.add(cy(.1,.5,'#7c2d12',0,.12,0,{},1));for(let i=0;i<6;i++)g.add(cy(.105,.03,'#d97706',-.2+i*.08,.12,0,{metalness:.7},1))}
  else if(k=='dio'||k=='fuse'){lead();g.add(cy(.06,.38,k=='fuse'?'#bae6fd':'#111827',0,.12,0,k=='fuse'?{transparent:true,opacity:.5}:{},1));g.add(cy(.062,.05,'#e5e7eb',.12,.12,0,{},1))}
  else if(k=='out'||k=='stepc'||k=='step'||k=='a4988'){const r=new THREE.Group();g.add(cy(.28,.34,p.t=='fan'?'#1f2937':'#8a93c8',0,.2,0,{metalness:.6}));r.add(bx(.5,.03,.07,'#c4b5fd',0,.4,0),bx(.07,.03,.5,'#c4b5fd',0,.4,0));g.add(r);ud.rot=r}
  else if(k=='servo'){g.add(bx(.7,.35,.34,'#2f5fe0',0,.18,0));const arm=new THREE.Group();arm.add(bx(.55,.05,.1,'#f5f6ff',.2,0,0));arm.position.set(-.12,.4,0);g.add(arm);ud.arm=arm}
  else if(k=='bat'){g.add(bx(.7,.5,.4,'#111827',0,.26,0));g.add(bx(.7,.12,.4,'#f59e0b',0,.56,0))}
  else if(k=='disp'){g.add(bx(1.5,.1,.9,'#1b2166',0,.06,0));g.add(bx(1.2,.03,.62,p.t=='lcd'?'#a8e063':'#02040f',0,.13,-.02,{emissive:p.t=='lcd'?'#3b5a1a':'#06202a',emissiveIntensity:.8}))}
  else if(window.P3X&&window.P3X(p,g,K,M,bx,cy)){}else{const W=Math.max(1.1,PT[p.t][3].split(' ').length*12/K+.4);g.add(bx(W,.07,.95,MC(p.t),0,.06,.1));g.add(bx(.45,.09,.35,'#111827',0,.13,0));if(k=='hb')g.add(bx(.7,.35,.4,'#374151',0,.25,0))}
  const n=PT[p.t][3].split(' ').length;for(let i=0;i<n;i++){const q=pinPos(p,i);g.add(bx(.06,.22,.06,'#e8c26a',(q[0]-88)/K,.11,(q[1]-52)/K))}
  g.userData=Object.assign(ud,{p});return g}
 function board3(){
 const g=new THREE.Group(),W=S.bw/K,H=S.bh/K,uno=S.bt==='uno'||S.bt==='unor4',col={uno:'#087f86',unor4:'#087f86',mega:'#0a7c86',leo:'#0a7c86',nano:'#1f5fbf',pro:'#b3262f',pico:'#0b7a3d',esp32:'#176b52',cam:'#176b52'}[S.bt]||'#171b26';
 g.position.set((S.bx+S.bw/2)/K,0,(S.by+S.bh/2)/K);
 g.add(bx(W,.13,H,col,0,.065,0,{roughness:.48,metalness:.08}));
 const chip=(x,z,w,h,label)=>{g.add(bx(w,.17,h,'#20242b',x,.19,z,{roughness:.6}));g.add(bx(w*.72,.035,h*.7,'#11151b',x,.29,z,{roughness:.35}));for(let q=-2;q<=2;q++){g.add(bx(.035,.09,.045,'#c8ccd0',x+q*w*.15,.13,z-h*.52));g.add(bx(.035,.09,.045,'#c8ccd0',x+q*w*.15,.13,z+h*.52))}return label};
 const pad=(x,z)=>g.add(cy(.07,.018,'#0c1720',x,.14,z,{roughness:.8}));
 const header=(x,z,n,dx)=>{for(let q=0;q<n;q++){const px=x+q*dx;g.add(bx(.075,.12,.075,'#111318',px,.16,z));g.add(cy(.022,.14,'#d6b86b',px,.22,z,{metalness:.85}))}};
 if(uno){
  // USB-B connector, barrel jack, voltage regulator and USB interface.
  g.add(bx(.43,.28,.58,'#b9c0c9',-W*.42,.19,-H*.23,{metalness:.82,roughness:.28}));
  g.add(bx(.30,.12,.34,'#252a32',-W*.42,.37,-H*.23,{metalness:.25}));
  g.add(bx(.36,.27,.38,'#171b22',-W*.43,.18,H*.17,{roughness:.5}));
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
  header(-W*.35,-H*.43,8,W*.095);header(-W*.35,H*.43,8,W*.095);
 }else{
  chip(-W*.08,-H*.1,Math.min(.75,W*.3),Math.min(.42,H*.2),'main controller');
  g.add(bx(W*.24,.16,H*.42,'#20252b',W*.28,.17,-H*.02,{metalness:.45}));
  header(-W*.43,-H*.42,Math.max(4,Math.floor(W*2)),W*.86/Math.max(3,Math.floor(W*2)-1));
  header(-W*.43,H*.42,Math.max(4,Math.floor(W*2)),W*.86/Math.max(3,Math.floor(W*2)-1));
  if(/esp32|cam|nodemcu|s2|s3|c3/.test(S.bt)){g.add(bx(W*.26,.06,H*.12,'#c9ced6',W*.27,.2,-H*.28,{metalness:.7}));g.add(bx(W*.08,.035,H*.22,'#c4ccd5',W*.39,.17,-H*.28,{metalness:.75}))}
 }
 ['u','d'].forEach(d=>{const r=S.bp.filter(q=>q.d==d);if(r.length)g.add(bx((r[r.length-1].x-r[0].x+14)/K,.11,.2,'#101318',((r[0].x+r[r.length-1].x)/2-S.bw/2)/K,.16,(r[0].y-S.bh/2)/K))});
 S.bp.forEach(q=>g.add(bx(.065,.2,.065,'#e5c77a',(q.x-S.bw/2)/K,.23,(q.y-S.bh/2)/K,{metalness:.85})));
 // Four plated mounting holes with a subtle metal rim.
 [[-.44,-.4],[.44,-.4],[-.44,.4],[.44,.4]].forEach(([x,z])=>{pad(W*x,H*z);g.add(cy(.085,.025,'#8e9aa7',W*x,.14,H*z,{metalness:.8}));pad(W*x,H*z)});
 return g
}
function wire3(w){const r=wroute(w);let pts=r.map((p,j)=>new THREE.Vector3(p.x/K,j==0||j==r.length-1?.3:.45,p.y/K));if(!(w.pts&&w.pts.length)){const a=pts[0],b=pts[pts.length-1],d=a.distanceTo(b);pts=[a,new THREE.Vector3((a.x+b.x)/2,.3+Math.min(.5,d*.07),(a.z+b.z)/2),b]}
  const m=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),48,.034,10,false),M(w.c,{roughness:.35}));m.castShadow=true;return m}
 function build(){grp.clear();grp.add(board3());S.parts.forEach(p=>{try{grp.add(part3(p))}catch(e){}});S.wires.forEach(w=>{try{grp.add(wire3(w))}catch(e){}})}
 function cam3(){cm.position.set(tg.x+dist*Math.cos(el)*Math.sin(az),tg.y+dist*Math.sin(el),tg.z+dist*Math.cos(el)*Math.cos(az));cm.lookAt(tg)}
 function init(){if(rn)return;rn=new THREE.WebGLRenderer({antialias:true});rn.setPixelRatio(Math.min(devicePixelRatio,2));rn.shadowMap.enabled=true;rn.shadowMap.type=THREE.PCFSoftShadowMap;box.appendChild(rn.domElement);sc=new THREE.Scene();sc.fog=new THREE.Fog(0x03051a,28,70);cm=new THREE.PerspectiveCamera(45,1,.1,200);tg=new THREE.Vector3();grp=new THREE.Group();sc.add(grp);
  sc.add(new THREE.HemisphereLight(0xbcd0ff,0x0b1130,.75));const dl=new THREE.DirectionalLight(0xffffff,1.1);dl.position.set(8,14,6);dl.castShadow=true;dl.shadow.mapSize.set(2048,2048);Object.assign(dl.shadow.camera,{left:-25,right:25,top:25,bottom:-25,near:1,far:60});sc.add(dl);
  const gr=new THREE.Mesh(new THREE.PlaneGeometry(WS.w/K,WS.h/K),M('#0b1130',{roughness:.9}));gr.rotation.x=-Math.PI/2;gr.position.set(WS.w/K/2,-.001,WS.h/K/2);gr.receiveShadow=true;sc.add(gr);const gd=new THREE.GridHelper(30,60,0x3a4496,0x1b2260);gd.position.set(15,0,10);sc.add(gd);
  new ResizeObserver(()=>{const w=box.clientWidth,h=box.clientHeight;if(w&&h){rn.setSize(w,h);cm.aspect=w/h;cm.updateProjectionMatrix()}}).observe(box);
  box.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,b:e.button};box.setPointerCapture(e.pointerId)});box.addEventListener('pointerup',()=>drag=null);box.addEventListener('contextmenu',e=>e.preventDefault());
  box.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;if(drag.b==2||e.shiftKey){const s=dist*.0016;tg.x-=(dx*Math.cos(az)+dy*Math.sin(az)*Math.sin(el))*s;tg.z+=(dx*Math.sin(az)-dy*Math.cos(az)*Math.sin(el))*s}else{az-=dx*.006;el=Math.max(.08,Math.min(1.5,el+dy*.006))}cam3()});
  box.addEventListener('wheel',e=>{e.preventDefault();dist=Math.max(3,Math.min(40,dist*(e.deltaY>0?1.1:.9)));cam3()},{passive:false})}
 function loop(){if(box.hidden)return;raf=requestAnimationFrame(loop);if(++fc%12==0){const sg=JSON.stringify([S.bt,S.bx,S.by,S.wires,S.parts.map(p=>[p.id,p.t,p.x,p.y,p.st.color,p.st.ohm,p.st.ctype])]);if(sg!==sig){sig=sg;build()}}
  grp.children.forEach(g=>{const u=g.userData,p=u.p;if(!p)return;const s=p.st;if(u.led)u.led.material.emissiveIntensity=s.burnt?0:Math.min(1,(MN.I[p.id]||0)/.012)*2.2;if(u.rot)u.rot.rotation.y=-(s.ang||0)*Math.PI/180;if(u.arm){const q=S.bp.find(q=>H.sv[q.n]&&SO.f('b:'+q.l)==SO.f(p.id+':SIG'));u.arm.rotation.y=(90-(q?H.sv[q.n].a:90))*Math.PI/180}});rn.render(sc,cm)}
 function open3(){try{init()}catch(e){return toast('WebGL is not available in this browser.',1)}box.hidden=false;$('#v3').textContent='Edit mode';sig='';build();const B=boxes(),x0=Math.min(...B.map(r=>r.x)),x1=Math.max(...B.map(r=>r.x+r.w)),y0=Math.min(...B.map(r=>r.y)),y1=Math.max(...B.map(r=>r.y+r.h));tg.set((x0+x1)/2/K,0,(y0+y1)/2/K);dist=Math.max(6,Math.max(x1-x0,y1-y0)/K*.95);az=.5;el=1.02;cam3();loop()}
 $('#v3').onclick=()=>{if(!box.hidden){box.hidden=true;cancelAnimationFrame(raf);$('#v3').textContent='3D view';return}if(window.THREE)return open3();const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.min.js';s.onload=open3;s.onerror=()=>toast('The 3D engine could not load (blocked or offline).',1);document.head.appendChild(s)}})();
