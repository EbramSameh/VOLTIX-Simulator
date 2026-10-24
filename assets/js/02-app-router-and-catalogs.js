/* Application router, creator signature, and page navigation. */
/* ===== MODULE 1: units, signature, page router ===== */
const SIM={p:1e-12,n:1e-9,u:1e-6,'µ':1e-6,m:1e-3,k:1e3,K:1e3,M:1e6,G:1e9};
const parseSI=s=>{const m=/^\s*(\d*\.?\d+)\s*([pnuµmkKMG]?)/.exec(s);return m?+m[1]*(SIM[m[2]]||1):NaN};
const fmtSI=(v,u)=>{const a=Math.abs(v),[k,p]=a>=1?[1,'']:a>=1e-3?[1e3,'m']:a>=1e-6?[1e6,'µ']:a>=1e-9?[1e9,'n']:[1e12,'p'];return +(v*k).toPrecision(3)+' '+p+u};
const SIG=`<div class='sigcard'><svg viewBox='0 0 64 64' width='56' height='56'><defs><linearGradient id='sgd' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#22d3ee'/><stop offset='1' stop-color='#8b6cff'/></linearGradient></defs><circle cx='32' cy='32' r='29' fill='#0b1130' stroke='url(#sgd)' stroke-width='3'/><path d='M10 42H20L25 31H39L44 42H54' fill='none' stroke='url(#sgd)' stroke-width='1.5' stroke-opacity='.7'/><text x='32' y='37' text-anchor='middle' font-family='Space Grotesk,sans-serif' font-weight='700' font-size='19' fill='#fff'>ES</text></svg><div><small>Made by</small><b>Ebram Sameh</b><span>S’28 · Red Sea STEM</span></div></div>`;
document.querySelectorAll('.sigslot').forEach(e=>e.innerHTML=SIG);
const PAGES=['home','sim','parts','pi','ai','about'],mods={};
function go(r){if(!PAGES.includes(r))r='home';if(r!='ai')camStop();document.body.dataset.r=r;document.querySelectorAll('#top .tl [data-go]').forEach(b=>b.classList.toggle('on',b.dataset.go==r));document.querySelectorAll('.pg').forEach(p=>p.classList.toggle('on',p.id=='p-'+r));try{history.replaceState(null,'','#'+r)}catch{}
 if(r=='sim')requestAnimationFrame(()=>{setVB();if(!go.f){go.f=1;fit()}});$('#pages').scrollTop=0;if(mods[r])mods[r]()}
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
/* ===== MODULE 2: components catalog ===== */
const SUPK={res:'Full',led:'Full',bat:'Full',cap:'Full',ind:'Full',dio:'Full',fuse:'Full',dmm:'Full',btn:'Full',sw:'Full'};let pcat='All';
function partsPage(){const q=$('#pq').value.toLowerCase(),cats=['All',...new Set(Object.values(PT).map(d=>d[1]))];
 $('#pchips').innerHTML=cats.map(c=>`<button class='${c==pcat?'on':''}' data-c='${c}'>${c}</button>`).join('');
 $('#pcards').innerHTML=Object.entries(PT).filter(([k,d])=>!/^led[rgbywopk]$/.test(k)&&(pcat=='All'||d[1]==pcat)&&(d[0]+d[1]).toLowerCase().includes(q)).map(([k,d])=>{const lv=SUPK[d[4]]||'Partial';return`<div class='card'><svg viewBox='52 20 72 66'>${shape(k,d[4],null,d)}</svg><h4>${d[0]}</h4><small>${d[1]} · ${d[3].split(' ').length} pins: ${d[3]}</small><span class='lvl ${lv}'>${lv}</span><button data-add='${k}' style='float:right;padding:2px 10px'>Add</button></div>`}).join('')}
mods.parts=partsPage;$('#pq').oninput=partsPage;
$('#pchips').addEventListener('click',e=>{const c=e.target.dataset.c;if(c){pcat=c;partsPage()}});
$('#pcards').addEventListener('click',e=>{const k=e.target.dataset.add;if(k){go('sim');addPart(k);draw()}});
/* ===== MODULE 3: Raspberry Pi catalog ===== */
const PI=[
['Raspberry Pi 5','Standard','BCM2712, 4x Cortex-A76 2.4 GHz','1, 2, 4, 8 or 16 GB','40-pin','2 x 22-pin CSI/DSI','PCIe connector for the AI HAT+, power button'],
['Raspberry Pi 4 Model B','Standard','BCM2711, 4x Cortex-A72 1.5 GHz (1.8 GHz on later boards)','2, 4 or 8 GB (sizes vary by date)','40-pin','1 x 15-pin CSI, 1 x DSI','USB 3.0, gigabit Ethernet'],
['Raspberry Pi 3 Model B+','Standard','BCM2837B0, 4x Cortex-A53 1.4 GHz','1 GB','40-pin','1 x 15-pin CSI','Dual-band Wi-Fi, Bluetooth 4.2'],
['Raspberry Pi 3 Model B','Standard','BCM2837, 4x Cortex-A53 1.2 GHz','1 GB','40-pin','1 x 15-pin CSI','Wi-Fi, Bluetooth'],
['Raspberry Pi 3 Model A+','Standard','BCM2837B0, 4x Cortex-A53 1.4 GHz','512 MB','40-pin','1 x 15-pin CSI','Smaller board, one USB port'],
['Raspberry Pi 2 Model B','Standard','BCM2836, 4x Cortex-A7 900 MHz','1 GB','40-pin','1 x 15-pin CSI','Older model'],
['Raspberry Pi 1 Model B+','Standard','BCM2835, ARM1176 700 MHz','512 MB','40-pin','1 x 15-pin CSI','Older model'],
['Raspberry Pi 1 Model A+','Standard','BCM2835, ARM1176 700 MHz','256 MB','40-pin','1 x 15-pin CSI','Older model'],
['Raspberry Pi 1 Model B','Standard','BCM2835, ARM1176 700 MHz','256 or 512 MB','26-pin','1 x 15-pin CSI','Original header has 26 pins'],
['Raspberry Pi 1 Model A','Standard','BCM2835, ARM1176 700 MHz','256 MB','26-pin','1 x 15-pin CSI','Original header has 26 pins'],
['Raspberry Pi Zero','Zero','BCM2835, ARM1176 1 GHz','512 MB','40-pin (unpopulated)','CSI on v1.3 and later (22-pin mini)','No wireless'],
['Raspberry Pi Zero W / WH','Zero','BCM2835, ARM1176 1 GHz','512 MB','40-pin (WH is pre-soldered)','22-pin mini CSI','Wi-Fi, Bluetooth'],
['Raspberry Pi Zero 2 W / WH','Zero','RP3A0 (BCM2710A1), 4x Cortex-A53 1 GHz','512 MB','40-pin (WH is pre-soldered)','22-pin mini CSI','Wi-Fi, Bluetooth'],
['Raspberry Pi 400','Keyboard computer','BCM2711, 4x Cortex-A72 1.8 GHz','4 GB','40-pin (rear)','None','Built into a keyboard'],
['Raspberry Pi 500','Keyboard computer','BCM2712, 4x Cortex-A76 2.4 GHz','8 GB','40-pin (rear)','None','Built into a keyboard'],
['Raspberry Pi 500+','Keyboard computer','BCM2712','16 GB (see official docs)','40-pin (rear)','None','Mechanical keyboard with built-in SSD (check docs)'],
['Compute Module 5','Compute Module','BCM2712','2 to 16 GB (see official docs)','No header (carrier board)','On the carrier board','Needs an IO board or custom carrier'],
['Compute Module 4','Compute Module','BCM2711','1 to 8 GB (see official docs)','No header (carrier board)','On the carrier board','Optional eMMC and wireless'],
['Compute Module 4S','Compute Module','BCM2711','See official docs','No header (carrier board)','On the carrier board','SODIMM form factor like CM3'],
['Compute Module 3+','Compute Module','BCM2837B0','1 GB','No header (carrier board)','On the carrier board','SODIMM form factor'],
['Compute Module 3','Compute Module','BCM2837','1 GB','No header (carrier board)','On the carrier board','SODIMM form factor']];
const PINS=['3V3','5V','GPIO2 SDA1','5V','GPIO3 SCL1','GND','GPIO4 1-Wire','GPIO14 TXD','GND','GPIO15 RXD','GPIO17','GPIO18 PWM0','GPIO27','GND','GPIO22','GPIO23','3V3','GPIO24','GPIO10 MOSI','GND','GPIO9 MISO','GPIO25','GPIO11 SCLK','GPIO8 CE0','GND','GPIO7 CE1','ID_SD','ID_SC','GPIO5','GND','GPIO6','GPIO12 PWM0','GPIO13 PWM1','GND','GPIO19 PWM1','GPIO16','GPIO26','GPIO20','GND','GPIO21'];
const CAMS=[['Camera Module 1','OmniVision OV5647','5 MP','15-pin','Fixed focus, older'],['Camera Module 2 / 2 NoIR','Sony IMX219','8 MP','15-pin','Fixed focus. NoIR has no infrared filter'],['Camera Module 3 / 3 NoIR','Sony IMX708','12 MP','15-pin','Autofocus'],['Camera Module 3 Wide / Wide NoIR','Sony IMX708','12 MP','15-pin','Autofocus, wide field of view'],['High Quality Camera','Sony IMX477','12.3 MP','15-pin','C/CS-mount lenses'],['Global Shutter Camera','Sony IMX296','1.6 MP','15-pin','Global shutter, C/CS mount'],['AI Camera','Sony IMX500','12.3 MP','15-pin','Runs a neural network on the sensor'],['USB webcam','Varies','Varies','USB','Works on any Pi with a USB port']];
function piPage(){const sel=$('#pisel');if(!sel.options.length){sel.innerHTML=PI.map((p,i)=>`<option value='${i}'>${p[0]}</option>`).join('');sel.onchange=piPage;
 $('#pitab').innerHTML='<tr><th>Board</th><th>Family</th><th>SoC</th><th>Memory</th><th>GPIO</th><th>Camera</th></tr>'+PI.map(p=>`<tr><td>${p[0]}</td><td>${p[1]}</td><td>${p[2]}</td><td>${p[3]}</td><td>${p[4]}</td><td>${p[5]}</td></tr>`).join('');
 $('#camtab').innerHTML='<tr><th>Camera</th><th>Sensor</th><th>Resolution</th><th>Connector</th><th>Notes</th></tr>'+CAMS.map(c=>`<tr>${c.map(x=>'<td>'+x+'</td>').join('')}</tr>`).join('')+'<tr><td colspan="5">Pi 5 and Zero boards use the smaller 22-pin connector, so older cameras need an adapter cable. Details: raspberrypi.com/documentation/accessories/camera.html</td></tr>'}
 const p=PI[+sel.value||0],n=p[4].startsWith('40')?40:p[4].startsWith('26')?26:0;
 $('#piinfo').innerHTML=`<table><tr><th>SoC</th><td>${p[2]}</td></tr><tr><th>Memory</th><td>${p[3]}</td></tr><tr><th>GPIO</th><td>${p[4]}</td></tr><tr><th>Camera</th><td>${p[5]}</td></tr><tr><th>Notes</th><td>${p[6]}</td></tr></table>`;
 $('#pipins').innerHTML=n?PINS.slice(0,n).map((x,i)=>`<div><i style='background:${/3V3/.test(x)?'#f97316':/5V/.test(x)?'#ef4444':x=='GND'?'#4b5563':/^ID/.test(x)?'#6b7280':'#3b82f6'}'></i>${i+1}: ${x}</div>`).join(''):'<div>No GPIO header. Pins come from the carrier board you use.</div>'}
mods.pi=piPage;
/* ===== MODULE 4: AI Lab (browser vision + Raspberry Pi commands) ===== */
const MD=[
['YOLOv8n','Object detection','640 x 640','.pt (export to ONNX or TFLite)','AGPL-3.0','https://github.com/ultralytics/ultralytics','CPU (ONNX / LiteRT). Hailo needs a compiled HEF.'],
['EfficientDet-Lite0','Object detection','320 x 320','.tflite','Apache-2.0','https://ai.google.dev/edge/mediapipe/solutions/vision/object_detector','CPU (LiteRT)'],
['MobileNetV2','Image classification','224 x 224','.tflite','Apache-2.0','https://ai.google.dev/edge/mediapipe/solutions/vision/image_classifier','CPU (LiteRT)'],
['MoveNet Lightning','Pose estimation','192 x 192','.tflite','Apache-2.0','https://www.tensorflow.org/hub/tutorials/movenet','CPU (LiteRT)'],
['MobileNet-SSD (IMX500 package)','Object detection','Packaged by Raspberry Pi','.rpk','See Raspberry Pi docs','https://www.raspberrypi.com/documentation/accessories/ai-camera.html','AI Camera only']];
const PY=(f,usb)=>`import time, cv2, numpy as np
from ai_edge_litert.interpreter import Interpreter
${usb?'':'from picamera2 import Picamera2'}

MODEL = '${f}'
interp = Interpreter(model_path=MODEL); interp.allocate_tensors()
inp = interp.get_input_details()[0]; out = interp.get_output_details()
h, w = inp['shape'][1], inp['shape'][2]
${usb?`cap = cv2.VideoCapture(0)`:`cam = Picamera2()\ncam.configure(cam.create_preview_configuration(main={'size': (640, 480), 'format': 'RGB888'}))\ncam.start()`}
while True:
    t0 = time.time()
    ${usb?`ok, frame = cap.read()\n    if not ok: break`:`frame = cam.capture_array()`}
    x = cv2.resize(frame, (w, h))[None, ...]
    x = (x / 255.0).astype(np.float32) if inp['dtype'] == np.float32 else x.astype(inp['dtype'])
    interp.set_tensor(inp['index'], x); interp.invoke()
    res = [interp.get_tensor(o['index']) for o in out]
    print(f'{(time.time() - t0) * 1000:.0f} ms', [r.shape for r in res])`;
function aiState(){return{p:PI[+$('#aipi').value],acc:$('#aiacc').value,usb:$('#aicam').value=='USB webcam',m:MD[+$('#aimodel').value]}}
function aiChk(){const{p,acc,usb,m}=aiState(),bad=[],note=[],csi=!/^None/.test(p[5]);
 if(!usb&&!csi)bad.push(p[0]+' has no camera connector. Choose a USB webcam.');
 if(acc.startsWith('AI HAT')&&p[0]!='Raspberry Pi 5')bad.push('The AI HAT+ needs a Raspberry Pi 5 (PCIe connector).');
 if(acc.startsWith('AI Camera')){if(!csi)bad.push('The AI Camera connects to a CSI port, which '+p[0]+' does not have.');if(!m[3].includes('rpk'))bad.push('This model must be converted and packaged for the IMX500 first (see the AI Camera docs).')}
 else if(m[3].includes('rpk'))bad.push('This model only runs on the AI Camera.');
 if(acc.startsWith('AI HAT'))note.push('Hailo runs compiled HEF models. Compile the model on a PC with the Hailo toolchain first.');
 if(p[1]=='Compute Module')note.push('Compute Modules need a carrier board; connectors depend on the board you use.');
 $('#aichk').innerHTML=(bad.length?bad.map(x=>`<p style='color:#fda4af'>✖ ${x}</p>`).join(''):`<p style='color:#86efac'>✔ This combination is supported on paper. Run the commands below on the Pi to confirm.</p>`)+note.map(x=>`<p>${x}</p>`).join('')}
function aiCmd(){const{p,acc,usb,m}=aiState(),lc=m[3].toLowerCase(),file=m[0].toLowerCase().replace(/[^a-z0-9]+/g,'_')+(lc.includes('rpk')?'.rpk':lc.includes('tflite')?'.tflite':'.onnx');
 let s=`# Target: ${p[0]} | accelerator: ${acc} | camera: ${usb?'USB webcam':'CSI camera'}\n# Run these ON the Raspberry Pi. VOLTIX does not run them for you.\n\n`;
 if(!usb)s+=`# 1. Check that the camera is detected\nrpicam-hello --list-cameras\n\n`;
 s+=`# 2. Update and install the tools\nsudo apt update && sudo apt full-upgrade -y\nsudo apt install -y python3-picamera2 python3-opencv python3-numpy\n`;
 if(acc.startsWith('AI HAT'))s+=`sudo apt install -y hailo-all && sudo reboot\n\n# 3. Run a Hailo demo pipeline (docs: raspberrypi.com/documentation/computers/ai.html)\nrpicam-hello -t 0 --post-process-file /usr/share/rpi-camera-assets/hailo_yolov8_inference.json\n`;
 else if(acc.startsWith('AI Camera'))s+=`sudo apt install -y imx500-all && sudo reboot\n\n# 3. Run the IMX500 demo (docs: raspberrypi.com/documentation/accessories/ai-camera.html)\nrpicam-hello -t 0 --post-process-file /usr/share/rpi-camera-assets/imx500_mobilenet_ssd.json --viewfinder-mode 4056:3040:10 --width 4056 --height 3040 --framerate 30\n`;
 else s+=`python3 -m venv --system-site-packages ~/voltix-venv && source ~/voltix-venv/bin/activate\npip install ai-edge-litert   # LiteRT, successor of tflite-runtime (check it supports your Python version)\n\n${m[0]=='YOLOv8n'?`# On a PC: pip install ultralytics && yolo export model=yolov8n.pt format=tflite\n# then copy the .tflite file to the Pi\n\n`:''}# 3. Save the script below as run_model.py next to ${file}, then run: python3 run_model.py\n\n${PY(file,usb)}\n`;
 return s}
function aiUpd(){const m=MD[+$('#aimodel').value];$('#aimeta').innerHTML=`<table><tr><th>Task</th><td>${m[1]}</td></tr><tr><th>Input</th><td>${m[2]}</td></tr><tr><th>Format</th><td>${m[3]}</td></tr><tr><th>License</th><td>${m[4]}</td></tr><tr><th>Runs on</th><td>${m[6]}</td></tr></table>`;aiChk();$('#aicmd').textContent=aiCmd()}
function aiPage(){const sp=$('#aipi');if(!sp.options.length){sp.innerHTML=PI.map((p,i)=>`<option value='${i}'>${p[0]}</option>`).join('');$('#aimodel').innerHTML=MD.map((m,i)=>`<option value='${i}'>${m[0]}</option>`).join('');['aipi','aiacc','aicam','aimodel'].forEach(id=>$('#'+id).onchange=aiUpd);
 $('#mdtab').innerHTML='<tr><th>Model</th><th>Task</th><th>Input</th><th>Format</th><th>License</th><th>Runs on</th></tr>'+MD.map(m=>`<tr><td><a href='${m[5]}' target='_blank' rel='noopener' style='color:#c4b5fd'>${m[0]}</a></td><td>${m[1]}</td><td>${m[2]}</td><td>${m[3]}</td><td>${m[4]}</td><td>${m[6]}</td></tr>`).join('')}aiUpd()}
mods.ai=aiPage;$('#aicopy').onclick=()=>navigator.clipboard.writeText($('#aicmd').textContent).then(()=>toast('Commands copied.')).catch(()=>toast('Copy was blocked. Select the text and copy it by hand.',1));
let cst=null,craf=0,cprev=null,cfn=0,cft=0,cfps=0;const AV=$('#av'),AO=$('#aov'),WC=document.createElement('canvas');WC.width=160;WC.height=120;const WX=WC.getContext('2d',{willReadFrequently:true});
function rec(on,msg){const r=$('#acrec');r.classList.toggle('live',!!on);r.lastChild.textContent=msg}
async function camStart(){try{cst=await navigator.mediaDevices.getUserMedia({video:{deviceId:$('#acdev').value?{exact:$('#acdev').value}:undefined,width:{ideal:640},height:{ideal:480}}});AV.srcObject=cst;await AV.play();
 const dv=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind=='videoinput');if(dv.length){const cur=cst.getVideoTracks()[0].getSettings().deviceId;$('#acdev').innerHTML=dv.map((d,i)=>`<option value='${d.deviceId}'${d.deviceId==cur?' selected':''}>${d.label||'Camera '+(i+1)}</option>`).join('')}
 rec(1,'Camera ON. Frames are processed in this browser and never uploaded.');cvLoop()}catch(e){rec(0,e.name=='NotAllowedError'?'Permission denied. Allow camera access in the browser, then press Start camera again.':'Camera unavailable ('+e.name+').')}}
function camStop(){cancelAnimationFrame(craf);if(cst)cst.getTracks().forEach(t=>t.stop());cst=null;AV.srcObject=null;AO.getContext('2d').clearRect(0,0,AO.width,AO.height);cprev=null;rec(0,'Camera off');$('#airead').textContent='Camera off.'}
function cvLoop(){craf=requestAnimationFrame(t=>{if(!cst)return;if(t-(cvLoop.l||0)>80){cvLoop.l=t;const t0=performance.now(),txt=cvAnalyse(),ms=performance.now()-t0;cfn++;if(t-cft>1000){cfps=cfn;cfn=0;cft=t}$('#airead').textContent=txt+`\nanalysis ${ms.toFixed(1)} ms | ${cfps} fps | measured in this browser, not on a Raspberry Pi`}cvLoop()})}
function cvAnalyse(){const W=160,H=120;WX.drawImage(AV,0,0,W,H);const d=WX.getImageData(0,0,W,H).data,g=new Uint8Array(W*H),mode=$('#amode').value,th=+$('#amth').value,o=AO.getContext('2d'),S=AO.width/W;o.clearRect(0,0,AO.width,AO.height);let sum=0,n=0,x0=W,y0=H,x1=0,y1=0,sx=0,sy=0;
 const cc=$('#acol').value,tr=parseInt(cc.slice(1,3),16),tg=parseInt(cc.slice(3,5),16),tb=parseInt(cc.slice(5,7),16);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x,r=d[i*4],gg=d[i*4+1],b=d[i*4+2];g[i]=(r*.3+gg*.59+b*.11)|0;sum+=g[i];let hit=false;
  if(mode=='motion')hit=cprev&&Math.abs(g[i]-cprev[i])>th;else if(mode=='color')hit=Math.hypot(r-tr,gg-tg,b-tb)<th*3;
  if(hit){n++;sx+=x;sy+=y;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}}
 cprev=g;if(mode=='light')return`Mean brightness ${(sum/g.length/2.55).toFixed(0)} %`;
 const pct=n/g.length*100,found=n>40;if(found){o.strokeStyle='#22d3ee';o.lineWidth=3;o.strokeRect(x0*S,y0*S,(x1-x0)*S,(y1-y0)*S);o.fillStyle='#22d3ee';o.beginPath();o.arc(sx/n*S,sy/n*S,5,0,7);o.fill()}
 return(mode=='motion'?'Motion detection':'Colour tracker')+` | ${found?`${pct.toFixed(1)} % of the frame, box ${x0},${y0} to ${x1},${y1}`:'nothing found'}`}
$('#acstart').onclick=camStart;$('#acstop').onclick=camStop;$('#acdev').onchange=()=>{if(cst){camStop();camStart()}};
$('#acsnap').onclick=()=>{if(!cst)return toast('Start the camera first.',1);const c=document.createElement('canvas');c.width=AV.videoWidth;c.height=AV.videoHeight;c.getContext('2d').drawImage(AV,0,0);$('#asnap').src=c.toDataURL('image/png');toast('Snapshot taken. It stays on this page only.')};
go('home');\ntry{history.replaceState(null,'',location.pathname+location.search)}catch{}
