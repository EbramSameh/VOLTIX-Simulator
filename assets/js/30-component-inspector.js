/* VOLTIX selected-component inspector */
(()=>{
  const root=document.getElementById('props');
  const canvas=document.getElementById('cv');
  if(!root||!canvas)return;
  root.classList.add('vx-component-inspector');
  const pc=document.getElementById('pc');
  if(!pc)return;
  const head=document.createElement('div');
  head.className='vx-inspector-head';
  head.innerHTML='<div class="vx-inspector-kicker">COMPONENT INSPECTOR</div><button type="button" class="vx-inspector-close" aria-label="Close component inspector" title="Close">×</button>';
  const hero=document.createElement('div');
  hero.className='vx-inspector-hero';
  hero.innerHTML='<div class="vx-inspector-art"><svg viewBox="52 20 72 66" aria-hidden="true"></svg></div><div class="vx-inspector-title"><span class="vx-inspector-category"></span><strong></strong><small></small></div>';
  const meta=document.createElement('div');
  meta.className='vx-inspector-meta';
  const pins=document.createElement('div');
  pins.className='vx-inspector-pins';
  const controls=document.createElement('div');
  controls.className='vx-inspector-controls-label';
  controls.textContent='CONFIGURATION';
  root.insertBefore(head,pc);
  root.insertBefore(hero,pc);
  root.insertBefore(meta,pc);
  root.insertBefore(pins,pc);
  root.insertBefore(controls,pc);
  head.querySelector('button').addEventListener('click',()=>{
    if(typeof S!=='undefined'){S.sel=null;if(typeof draw==='function')draw();else root.hidden=true}
  });
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function render(){
    if(typeof S==='undefined'||typeof PT==='undefined')return;
    const p=S.parts.find(x=>x.id===S.sel);
    if(!p){root.hidden=true;return}
    const d=PT[p.t];
    if(!d){root.hidden=true;return}
    root.hidden=false;
    const art=hero.querySelector('svg');
    try{
      if(typeof shape==='function')art.innerHTML=shape(p.t,d[4],null,d);
      else art.innerHTML='';
    }catch(e){art.innerHTML=''}
    hero.querySelector('.vx-inspector-category').textContent=d[1]||'Component';
    hero.querySelector('strong').textContent=d[0]||p.t;
    hero.querySelector('small').textContent=(d[3]||'').toString()+' · '+(typeof SUP!=='undefined'&&SUP[p.t]?SUP[p.t]:'Component model');
    const status=typeof SUP!=='undefined'&&SUP[p.t]?SUP[p.t]:'Model information';
    const n=Array.isArray(d[3])?d[3].length:String(d[3]||'').split(/[ ,|]+/).filter(Boolean).length;
    meta.innerHTML='<span><b>'+esc(status)+'</b><small>SIMULATION STATUS</small></span><span><b>'+n+'</b><small>PIN COUNT</small></span><span><b>'+esc(d[1]||'General')+'</b><small>PART FAMILY</small></span>';
    const labels=Array.isArray(d[3])?d[3]:String(d[3]||'').split(/[ ,|]+/).filter(Boolean);
    pins.innerHTML='<div class="vx-inspector-section-title">PINOUT</div><div class="vx-inspector-pin-list">'+labels.map(x=>'<span>'+esc(x)+'</span>').join('')+'</div>';
  }
  const observer=new MutationObserver(render);
  observer.observe(pc,{childList:true,subtree:true});
  observer.observe(root,{attributes:true,attributeFilter:['hidden']});
  canvas.addEventListener('pointerdown',()=>requestAnimationFrame(render));
  window.addEventListener('pointerup',()=>requestAnimationFrame(render));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!root.hidden){if(typeof S!=='undefined')S.sel=null;render()}});
  if(typeof draw==='function'){
    const prior=draw;
    window.draw=function(){const result=prior.apply(this,arguments);render();return result};
  }
  render();
})();
