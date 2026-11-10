/* VOLTIX guided wiring and universal sensor stimulus panel. */
(()=>{
  if(window.VOLTIXBuilderUX)return;
  const $=s=>document.querySelector(s),root=$('#cvw')||$('#sim')||document.body;
  const style=document.createElement('style');
  style.textContent=`
  #vx-builder-dock{position:absolute;z-index:35;left:12px;top:12px;display:flex;gap:6px;align-items:center;flex-wrap:wrap;max-width:min(540px,calc(100% - 24px));padding:7px;background:#101a24eF;border:1px solid #3a4b5c;border-radius:11px;box-shadow:0 8px 24px #0006;backdrop-filter:blur(10px)}
  #vx-builder-dock button{border:1px solid #415367;background:#1b2936;color:#e7f0f8;border-radius:7px;padding:7px 10px;font:600 11px Inter, sans-serif;cursor:pointer}
  #vx-builder-dock button:hover,#vx-builder-dock button.active{border-color:#55d9d0;background:#183c43;color:#d7fffb}
  #vx-builder-status{font:11px Inter,sans-serif;color:#a8bdcd;min-width:130px}
  #vx-sensor-panel{position:absolute;z-index:34;right:12px;bottom:12px;width:min(280px,calc(100% - 24px));max-height:min(52%,390px);overflow:auto;background:#111c27f2;border:1px solid #3b4e60;border-radius:12px;padding:12px;color:#e5edf5;box-shadow:0 12px 30px #0008;backdrop-filter:blur(12px);display:none}
  #vx-sensor-panel.open{display:block}
  #vx-sensor-panel h3{font:700 13px Inter,sans-serif;margin:0 0 4px}
  #vx-sensor-panel p{font:11px Inter,sans-serif;color:#9fb2c3;margin:0 0 10px;line-height:1.45}
  #vx-sensor-panel label{display:block;font:11px Inter,sans-serif;color:#c8d6e2;margin:9px 0 4px}
  #vx-sensor-panel input,#vx-sensor-panel select{width:100%;accent-color:#52d6ce}
  #vx-sensor-panel .vx-sensor-value{font:10px 'JetBrains Mono',monospace;color:#70e4d8;float:right}
  #vx-sensor-panel .vx-sensor-head{display:flex;justify-content:space-between;gap:8px;align-items:center}
  #vx-sensor-panel button{border:1px solid #415367;background:#1b2936;color:#e7f0f8;border-radius:7px;padding:5px 8px;font-size:11px;cursor:pointer}
  #vx-sensor-panel .vx-sensor-note{padding:7px;background:#1b2b38;border-radius:7px;color:#9fc6d1}
  @media(max-width:700px){#vx-builder-dock{position:relative;left:auto;top:auto;margin:6px;max-width:calc(100% - 12px)}#vx-sensor-panel{position:relative;right:auto;bottom:auto;width:auto;max-height:240px;margin:6px}}
  `;
  document.head.appendChild(style);
  const dock=document.createElement('div');dock.id='vx-builder-dock';
  dock.innerHTML='<button id="vx-wire-help" class="active">Wire: click pin → pin</button><button id="vx-auto-wire">Auto-wire selected</button><button id="vx-undo-wire">Undo wire</button><button id="vx-clear-wires">Clear wires</button><span id="vx-builder-status">Select a pin to begin wiring.</span>';
  const panel=document.createElement('section');panel.id='vx-sensor-panel';
  panel.innerHTML='<div class="vx-sensor-head"><h3>Sensor controls</h3><button id="vx-sensor-close">Close</button></div><p>Select a sensor on the workspace to adjust its simulated input.</p><div id="vx-sensor-controls"></div>';
  root.append(dock,panel);
  const status=t=>{const e=$('#vx-builder-status');if(e)e.textContent=t};
  const sensorTypes=()=>Object.keys(PT).filter(t=>/sensor|camera|biomedical|liquid|soil/i.test(PT[t][1]||'')||['pot','ldr','ntc','soil','gas','snd','pir','aicam','ir','flame','touch','hall','us','dht11','dht22','loadc','fsr','flex','rain','vibs','mpu6050','adxl345','bmp280','ina219','tmp36','lm35','acs712','vsens','uvs','ph','max30','emg','eeg','ecg','turb','tds','soilc','wlevel','mq135','sndl','lux','press','hallx','tcs','apds','qmc','npk'].includes(t));
  const isSensor=p=>!!p&&sensorTypes().includes(p.t);
  function renderSensor(){
    const host=$('#vx-sensor-controls'),p=typeof S!=='undefined'&&S.sel&&S.parts.find(x=>x.id===S.sel);
    if(!isSensor(p)){panel.classList.remove('open');return}
    panel.classList.add('open');
    const controls=(PR[p.t]||[]).filter(c=>['rng','num','sel','ohm','si'].includes(c.t));
    const fallback=[];
    if((p.k==='an'||p.k==='sx'||p.k==='vis')&&!AN[p.t]){if(p.st.val==null)p.st.val=50;AN[p.t]=(st,supply)=>supply*(Number(st.val||0)/100)}
    if(!controls.length){
      if(p.k==='dig'||p.k==='sw')fallback.push({k:'on',l:'Sensor state',t:'sel',o:['0 · inactive','1 · active']});
      else if(p.k==='an'||p.k==='sx'||p.k==='vis')fallback.push({k:'val',l:'Sensor level (%)',t:'rng',min:0,max:100,step:1});
      else if(p.k==='dht')fallback.push({k:'v',l:'Temperature (°C)',t:'rng',min:0,max:60,step:1},{k:'v2',l:'Humidity (%)',t:'rng',min:0,max:100,step:1});
      else if(p.k==='us')fallback.push({k:'v',l:'Distance (cm)',t:'rng',min:2,max:400,step:1});
    }
    const list=controls.length?controls:fallback;
    host.innerHTML='<div class="vx-sensor-note">'+PT[p.t][0]+' · '+(SUP[p.t]||'Interactive stimulus controls')+'</div>'+list.map(c=>{
      const defaults={val:50,v:p.k==='us'?100:25,v2:50,on:0};const val=p.st[c.k]??(c.d??defaults[c.k]??c.min??0),num=typeof val==='number'?val:0;
      if(c.t==='sel')return '<label>'+c.l+'</label><select data-sensor-key="'+c.k+'">'+c.o.map(o=>'<option '+(String(val)===String(o)||String(val)===String(o).split(' · ')[0]?'selected':'')+'>'+o+'</option>').join('')+'</select>';
      const min=c.min??0,max=c.max??100,step=c.step??((max-min)/200||1);
      return '<label>'+c.l+' <span class="vx-sensor-value" data-value="'+c.k+'">'+num+'</span></label><input type="range" min="'+min+'" max="'+max+'" step="'+step+'" value="'+Math.min(max,Math.max(min,num))+'" data-sensor-key="'+c.k+'">';
    }).join('')+(list.length?'':'<p>No editable stimulus is configured for this part yet.</p>');
    host.querySelectorAll('[data-sensor-key]').forEach(el=>el.addEventListener('input',()=>{
      const key=el.dataset.sensorKey;let value=el.value;
      const c=list.find(x=>x.k===key);if(c&&c.t!=='sel')value=Number(value);
      if(c&&c.t==='sel'&&key==='on')value=Number(value.split(' · ')[0]);
      p.st[key]=value;
      if((p.k==='an'||p.k==='sx'||p.k==='vis')&&key==='val'&&!AN[p.t])AN[p.t]=(st,supply)=>supply*(Number(st.val||0)/100);
      const out=host.querySelector('[data-value="'+key+'"]');if(out)out.textContent=value;
      if(typeof save==='function')try{save()}catch(e){}
    }));
  }
  $('#vx-sensor-close').onclick=()=>panel.classList.remove('open');
  dock.addEventListener('click',e=>{
    const id=e.target.id;
    if(id==='vx-wire-help'){S.pend=null;mark();status('Click one pin, then the pin it connects to. Press Esc to cancel.')}
    if(id==='vx-auto-wire'){const b=$('#awb');if(b)b.click();else status('Select a part first.')}
    if(id==='vx-undo-wire'){if(!S.wires.length)return status('There are no wires to undo.');S.wires.pop();S.pend=null;drawWires();draw();status('Last wire removed.')}
    if(id==='vx-clear-wires'){if(!S.wires.length)return status('There are no wires to clear.');if(!confirm('Remove every wire from this circuit?'))return;S.wires=[];S.pend=null;drawWires();draw();status('All wires cleared.')}
  });
  const priorConnect=connect;
  const pinObserver=e=>{
    const pin=e.target.closest&&e.target.closest('[data-pin]');
    if(pin){const name=pin.dataset.pin;status(S.pend?'Choose the destination pin.':'Start: '+name);setTimeout(()=>{if(!S.pend)status('Wire complete. Click another pin to start a new wire.')},80)}
  };
  svg.addEventListener('pointerdown',pinObserver);
  svg.addEventListener('click',e=>{if(e.target.closest('[data-pin]'))setTimeout(renderSensor,0);},true);
  const oldDraw=draw;
  draw=function(){oldDraw();renderSensor()};
  $('#vx-wire-help').title='Click a source pin and then a destination pin. Escape cancels.';
  window.VOLTIXBuilderUX={renderSensor,version:'1.0',sensorTypes:sensorTypes()};
  renderSensor();
})();