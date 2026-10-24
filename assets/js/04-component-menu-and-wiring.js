/* Component palette, pin roles, and wiring interactions. */

/* ===== MODULE 6: component menu, pin roles, wires with bends ===== */
SUPK.vis='Visual';
const pinRole=n=>/^(SDA|SCL)$/.test(n)?'I2C':/^(TX|RX|TXD|RXD)$/.test(n)?'UART':/^(MOSI|MISO|SCK|CS|CSN|NSS|SCLK)$/.test(n)?'SPI':/^(VCC|VS|VM|VMOT|VDD|VIN|\+|IN\+|5V|3V3|V\+)$/.test(n)?'power in':/^(GND|-|IN-)$/.test(n)?'ground':/^(OUT|AOUT|SIG|V|VRX|VRY|OUT\+)$/.test(n)?'signal out':'signal';
const lvlOf=k=>SUPK[k]||'Partial';
function palBuild(){const P=$('#pal');P.querySelectorAll('h4,.gr,details').forEach(e=>e.remove());const cats=[...new Set(Object.values(PT).map(d=>d[1]))];
 P.insertAdjacentHTML('beforeend',cats.map(c=>{const it=Object.entries(PT).filter(([k,d])=>d[1]==c&&!/^led[rgbywopk]$/.test(k));return`<details open><summary>${c} <small>${it.length}</small></summary><div class='gr'>`+it.map(([k,d])=>`<button data-add='${k}' data-s='${(d[0]+' '+c+' '+d[3]).toLowerCase()}' title='${d[0]}&#10;Pins: ${d[3]}&#10;Simulation: ${lvlOf(d[4])}'><svg viewBox='52 22 72 62' width='32' height='28'>${shape(k,d[4],null,d)}</svg><span>${d[0]}</span><i class='dot ${lvlOf(d[4])}'></i></button>`).join('')+'</div></details>'}).join(''))}
function palFilter(){const q=$('#q').value.toLowerCase().trim();document.querySelectorAll('#pal [data-add]').forEach(b=>b.hidden=!!q&&!b.dataset.s.includes(q));document.querySelectorAll('#pal details').forEach(d=>{const any=[...d.querySelectorAll('[data-add]')].some(b=>!b.hidden);d.hidden=!any;if(q)d.open=any})}
$('#q').oninput=palFilter;$('#q').placeholder='Search name, category or pin';palBuild();
S.pp=[];S.sw=null;let WD=null;
const sn=v=>Math.round(v/13)*13,uv=r=>{const d=dv(r);return[Math.sign(d[0]),Math.sign(d[1])]};
const segD=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/l));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy)};
function wroute(w){const a=pp(w.a),b=pp(w.b);if(w.pts&&w.pts.length)return[a,...w.pts,b];const ua=uv(w.a),ub=uv(w.b),sa={x:a.x+ua[0]*18,y:a.y+ua[1]*18},sb={x:b.x+ub[0]*18,y:b.y+ub[1]*18};return ua[1]!==0?[a,sa,{x:sb.x,y:sa.y},sb,b]:[a,sa,{x:sa.x,y:sb.y},sb,b]}
function drawWires(){const bad=new Set(SO.bad.map(b=>b.r));let h='',hs='';S.wires.forEach((w,i)=>{const r=wroute(w),sel=S.sw===i;h+=`<path class='wire${sel?' wsel':''}' data-w='${i}' stroke='${bad.has(SO.f(w.a))?'#ff3b6b':w.c}' d='M${r.map(p=>p.x+','+p.y).join('L')}'/>`;if(sel)(w.pts||[]).forEach((p,j)=>hs+=`<circle class='wh' data-wi='${i}' data-hi='${j}' cx='${p.x}' cy='${p.y}' r='6'/>`)});$('#wl').innerHTML=h+hs}
function mark(){document.querySelectorAll('.pin.act').forEach(e=>e.classList.remove('act'));$('#pv').setAttribute('d','');if(S.pend){const e=document.querySelector(`[data-pin="${S.pend}"]`);e&&e.classList.add('act')}else S.pp=[]}
function connect(a,b){if(a==b)return;if(a[0]!='b'&&a.split(':')[0]==b.split(':')[0])return toast('Both ends are on the same part. Connect to something else.',1);if(S.wires.some(w=>(w.a==a&&w.b==b)||(w.a==b&&w.b==a)))return toast('Those pins are already connected.',1);if(bad2(kc(a),kc(b)))return toast('That would short the power supply (5V or 3V3 straight to GND). Wire blocked.',1);S.wires.push({a,b,c:wc(a,b),pts:(S.pp||[]).slice()});S.pp=[];drawWires();save()}
svg.addEventListener('pointerdown',e=>{const t=e.target.dataset||{};
 if(t.hi!==undefined){e.stopPropagation();WD={i:+t.wi,j:+t.hi};return}
 if(t.w!==undefined&&!S.pend){e.stopPropagation();S.sw=+t.w;S.sel=null;drawWires();return}
 if(S.pend&&!t.pin&&t.w===undefined&&!t.ico&&!t.drag&&!e.target.closest('foreignObject')){e.stopPropagation();const m=pt(e),a=S.pp.length?S.pp[S.pp.length-1]:pp(S.pend);let x=sn(m.x),y=sn(m.y);if(!e.shiftKey){if(Math.abs(x-a.x)>=Math.abs(y-a.y))y=a.y;else x=a.x}S.pp.push({x,y});mark();return}
 if(S.sw!==null&&t.w===undefined&&t.hi===undefined){S.sw=null;drawWires()}},true);
svg.addEventListener('dblclick',e=>{const t=e.target.dataset||{};if(t.w===undefined)return;e.stopPropagation();const i=+t.w,w=S.wires[i],r=wroute(w),m=pt(e);let best=0,bd=1e9;for(let k=0;k<r.length-1;k++){const d=segD(m,r[k],r[k+1]);if(d<bd){bd=d;best=k}}if(!(w.pts&&w.pts.length))w.pts=r.slice(1,-1);w.pts.splice(best,0,{x:sn(m.x),y:sn(m.y)});S.sw=i;drawWires();save()},true);
window.addEventListener('pointermove',e=>{if(WD){const m=pt(e);S.wires[WD.i].pts[WD.j]={x:sn(m.x),y:sn(m.y)};drawWires()}if(S.pend){const a=pp(S.pend),m=pt(e),q=[a,...S.pp,m];$('#pv').setAttribute('d','M'+q.map(p=>p.x+','+p.y).join('L'))}});
window.addEventListener('pointerup',()=>{if(WD){WD=null;save()}});
document.addEventListener('keydown',e=>{if((e.key=='Delete'||e.key=='Backspace')&&S.sw!==null&&!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)){e.preventDefault();e.stopPropagation();S.wires.splice(S.sw,1);S.sw=null;drawWires();save()}},true);
drawWires();
