/* Project manager and saved-project UI. */

(()=>{const $q=s=>document.querySelector(s);
// ---- wire delete: fat hit-area, right-click, button, hint
const dw=window.drawWires,del=()=>{if(S.sw==null)return toast('Click a wire first, then delete it.',1);S.wires.splice(S.sw,1);S.sw=null;draw();toast('Wire deleted.')};
window.drawWires=function(){dw();let h='';$q('#wl').querySelectorAll('path.wire').forEach(p=>h+=`<path class="wh2" data-w="${p.dataset.w}" d="${p.getAttribute('d')}" fill="none" stroke="transparent" stroke-width="16" style="pointer-events:stroke;cursor:pointer"/>`);$q('#wl').insertAdjacentHTML('afterbegin',h)};
const sv=$q('#pl').ownerSVGElement||svg;
sv.addEventListener('contextmenu',e=>{const w=e.target.dataset&&e.target.dataset.w;if(w===undefined)return;e.preventDefault();S.sw=+w;del()});
sv.addEventListener('click',e=>{if(e.target.dataset&&e.target.dataset.w!==undefined)toast('Wire selected: press Delete, right-click it, or tap 🗑 Delete wire.')});
const db=document.createElement('button');db.textContent='🗑 Delete wire';db.onclick=del;$q('#awb').after(db);
// ---- auto-wire EVERY pin of the part (selected part, else the last one added)
$q('#awb').onclick=()=>{const p=S.parts.find(q=>q.id==S.sel)||S.parts[S.parts.length-1];if(!p)return toast('Add a part first.',1);
 const bp=S.bp,used=new Set(S.wires.flatMap(w=>[w.a,w.b])),ref=q=>'b:'+q.l,[sd,sc]=(I2P[S.bt]||[]),io=bp.filter(q=>q.k=='io'),
 pwr=bp.filter(q=>q.k!='io'),v33=BD[S.bt][1]<4,
 vq=pwr.find(q=>q.n==(v33?'3V3':'5V'))||pwr.find(q=>/5V|3V3|VIN/.test(q.n)),gq=pwr.find(q=>/^GND/.test(q.n)),
 ok=a=>q=>!used.has(ref(q))&&(a?/^A\d|^G(32|33|34|35|36|39)$/.test(q.n):true),
 sig=a=>io.find(q=>ok(a)(q)&&!/^(D0|D1|G0|G1|G3)$/.test(q.n))||io.find(ok(a))||io.find(ok(0));let n=0,miss=[];
 pinsOf(p).forEach(l=>{const pr=p.id+':'+l;if(used.has(pr))return;let q;
  if(/^(VCC|VIN|VS|VM|VMOT|V\+|VDD|5V|3V3|\+|IN\+)$/.test(l))q=vq;else if(/^(GND|G|C|K|-|IN-)$/.test(l))q=gq;
  else if(/SDA/.test(l))q=bp.find(x=>x.n==sd);else if(/SCL/.test(l))q=bp.find(x=>x.n==sc);
  else q=sig(p.k=='sx'||p.k=='an'||/^(A0|AO|AOUT|OUT|SIG|VRX|VRY)$/.test(l));
  if(q){connect(pr,ref(q));used.add(pr);if(q.k=='io')used.add(ref(q));n++}else miss.push(l)});
 draw();toast(miss.length?`Wired ${n} pins. No free board pin for: ${miss.join(', ')}`:`Wired all ${n} pins of ${PT[p.t][0]}.`,!n)};
// ---- 3D: type-specific models for the Three.js view
window.P3X=function(p,g,K,M,bx,cy){const t=p.t,rot=(m,x,z)=>{m.rotation.x=x||0;m.rotation.z=z||0;return m},A=(...a)=>a.forEach(m=>g.add(m)),
 pc=(w,d,c)=>A(bx(w,.07,d,c,0,.06,0,{roughness:.4})),chip=(x,z,w=.3,d=.3)=>A(bx(w,.07,d,'#15151c',x,.14,z)),
 BL='#1553b8',GR='#0b7a3e',RD='#b3202a',PU='#5b2a86',BK='#17171f',pins=(n,z)=>{for(let i=0;i<n;i++)A(bx(.05,.12,.05,'#e8c26a',(i-(n-1)/2)*.1,.12,z))},
 TO=()=>{A(cy(.1,.34,BK,0,.2,0));A(bx(.2,.34,.1,BK,0,.2,.05,{transparent:true,opacity:0}))};
 switch(t){
 case'us':pc(1.5,.7,BL);A(rot(cy(.22,.3,'#c0c4cc',-.4,.25,.05),Math.PI/2),rot(cy(.22,.3,'#c0c4cc',.4,.25,.05),Math.PI/2));chip(0,-.2,.25,.2);pins(4,.3);break;
 case'dht11':A(bx(.5,.62,.28,'#2f80d6',0,.34,0));for(let i=0;i<6;i++)A(bx(.4,.02,.3,'#1d5aa8',0,.18+i*.08,0));pins(4,.2);break;
 case'mq135':pc(.9,.8,BL);A(cy(.3,.34,'#aab0bd',0,.26,0),cy(.22,.04,'#6b7080',0,.45,0));pins(4,.34);break;
 case'ds18':case'hallx':TO();for(let i=-1;i<2;i++)A(bx(.02,.3,.02,'#cbd5e1',i*.07,.0,.0));break;
 case'lm7805':A(bx(.5,.38,.12,BK,0,.22,0),bx(.5,.3,.04,'#bfc4d0',0,.5,-.04),cy(.05,.06,'#222',0,.55,-.07,{},0));for(let i=-1;i<2;i++)A(bx(.04,.3,.03,'#cbd5e1',i*.17,0,0));break;
 case'ams1117':A(bx(.4,.12,.3,BK,0,.1,0),bx(.28,.05,.12,'#bfc4d0',0,.12,-.2));break;
 case'lm2596':case'mt3608':pc(1.1,.8,BL);A(bx(.32,.22,.32,'#222',-.2,.2,0),cy(.14,.3,'#222',.25,.25,.05),bx(.18,.14,.12,'#2fae66',-.35,.17,.3),bx(.18,.14,.12,'#2fae66',.35,.17,.3));break;
 case'a4988':case'drv8825':pc(.75,1.0,t=='a4988'?RD:PU);A(bx(.3,.16,.3,'#2b2b33',0,.2,-.1),chip(0,.2,.2,.2));pins(8,.45);break;
 case'enc':pc(.9,.8,BL);A(cy(.22,.3,'#bcc2cf',0,.28,0),cy(.14,.1,'#8f96a6',0,.46,0));pins(5,.34);break;
 case'joy':pc(.9,.9,BL);A(bx(.45,.16,.45,'#222',0,.18,0),cy(.1,.3,'#333',0,.38,0),cy(.18,.1,'#111',0,.58,0));pins(5,.4);break;
 case'keypad':A(bx(1.1,.1,1.1,'#d7dae3',0,.07,0));for(let i=0;i<16;i++)A(bx(.2,.06,.2,'#4b5370',-.37+(i%4)*.25,.14,-.37+Math.floor(i/4)*.25));break;
 case'irr':A(bx(.3,.4,.2,BK,0,.22,0),cy(.08,.1,'#222',0,.2,.1));break;
 case'rtc':pc(1.1,.8,BL);A(cy(.3,.1,'#d5d9e2',0,.18,0),chip(-.45,.25,.2,.15));pins(6,.34);break;
 case'sdc':pc(1.1,.9,BL);A(bx(.8,.15,.5,'#aab0bd',0,.18,-.1),bx(.6,.04,.4,'#111',0,.28,-.1));pins(6,.4);break;
 case'gps':pc(1.0,1.0,'#0a4aa3');A(bx(.55,.12,.55,'#e9d9a6',-.05,.17,-.15),chip(.3,.3,.25,.2));pins(5,.45);break;
 case'rfid':pc(1.5,1.0,BL);A(bx(.6,.02,.6,'#eee',-.3,.12,0),bx(.4,.02,.4,BL,-.3,.14,0),chip(.4,.1,.3,.3));pins(8,.46);break;
 case'hc05':pc(.8,1.2,GR);A(bx(.45,.14,.5,'#c7ccd6',0,.17,-.2),chip(0,.3,.25,.2));pins(6,.55);break;
 case'nrf':pc(.8,1.2,GR);A(bx(.4,.14,.4,'#c7ccd6',.1,.17,.1));A(bx(.04,.03,.4,'#d9b45a',-.2,.1,-.45),bx(.3,.03,.04,'#d9b45a',-.05,.1,-.45));pins(8,.5);break;
 case'lora':pc(1.1,.9,BL);A(bx(.6,.14,.5,'#c7ccd6',0,.17,-.05));A(cy(.04,.5,'#d9b45a',.45,.35,.2));pins(8,.4);break;
 case'hx711':pc(.9,.5,RD);chip(0,0,.4,.2);pins(4,.2);break;
 case'ads':case'dac':case'pca':case'max485':case'acs712':pc(1.1,.7,t=='dac'?PU:BL);chip(0,0,.4,.25);if(t=='acs712'||t=='max485')A(bx(.3,.22,.25,'#2fae66',-.4,.2,.2));pins(6,.3);break;
 case'bme280':case'sht31':case'vl53':case'apds':case'tcs':case'qmc':case'mpu9250':case'max30':pc(.7,.7,t=='tcs'?'#f1f1f1':t=='sht31'||t=='qmc'?BL:PU);A(bx(.3,.1,.3,t=='bme280'?'#c7ccd6':BK,0,.15,0));if(t=='vl53'||t=='apds')A(cy(.05,.04,'#533',-.08,.2,0),cy(.05,.04,'#533',.08,.2,0));pins(6,.28);break;
 case'soilc':case'wlevel':A(bx(.55,.05,1.7,t=='soilc'?BK:GR,0,.06,.4),bx(.55,.06,.5,GR,0,.07,-.35));for(let i=0;i<6;i++)A(bx(.4,.01,.08,'#e0b84f',0,.1,.1+i*.18));break;
 case'ph':case'tds':case'turb':case'npk':pc(1,.8,t=='ph'?BL:GR);A(cy(.12,.3,'#c8ccd6',-.3,.25,.3),bx(.1,.5,.1,'#dfe6ee',.35,.1,0));chip(0,-.1,.3,.2);pins(3,.34);break;
 default:return false}
 return true};
// hook it into the three.js part builder (patched below), and fix wire/part pin glow
})();
