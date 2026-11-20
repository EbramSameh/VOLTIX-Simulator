/* VOLTIX wire interaction polish: accessible wire removal and a quieter canvas. */
(()=>{
  const $=s=>document.querySelector(s);
  const guide=$('#guide');
  if(guide){guide.hidden=true;guide.setAttribute('aria-hidden','true')}
  const toolbar=$('#wtb');
  if(toolbar){
    const labels={bfit:'Fit circuit to workspace',btidy:'Arrange components neatly',snap:'Toggle grid snapping',bzo:'Zoom out',bzi:'Zoom in'};
    Object.entries(labels).forEach(([id,label])=>{const el=document.getElementById(id);if(el){el.title=label;el.setAttribute('aria-label',label)}});
    const zoom=$('#zl');if(zoom)zoom.setAttribute('aria-label','Current workspace zoom');
  }
  const base=window.drawWires;
  if(typeof base==='function'){
    window.drawWires=function(){
      base();
      const layer=$('#wl');if(!layer)return;
      layer.querySelectorAll('.wire-hit').forEach(e=>e.remove());
      layer.querySelectorAll('path.wire').forEach((path,index)=>{
        const wire=window.S?.wires?.[index];
        if(!wire)return;
        path.setAttribute('role','button');
        path.setAttribute('tabindex','0');
        path.setAttribute('aria-label','Remove wire connecting '+wire.a+' to '+wire.b);
        let title=path.querySelector('title');
        if(!title){title=document.createElementNS('http://www.w3.org/2000/svg','title');path.prepend(title)}
        title.textContent='Click to remove this wire';
        const hit=document.createElementNS('http://www.w3.org/2000/svg','path');
        hit.setAttribute('class','wire-hit');
        hit.setAttribute('d',path.getAttribute('d')||'');
        hit.setAttribute('data-w',String(index));
        hit.setAttribute('tabindex','0');
        hit.setAttribute('role','button');
        hit.setAttribute('aria-label','Remove wire '+(index+1));
        layer.appendChild(hit);
      });
    };
  }
  const layer=$('#wl');
  if(layer){
    layer.addEventListener('keydown',event=>{
      const path=event.target.closest('.wire-hit,.wire');
      if(!path||(event.key!=='Enter'&&event.key!==' '))return;
      event.preventDefault();
      const index=Number(path.getAttribute('data-w'));
      if(!Number.isInteger(index)||!window.S?.wires?.[index])return;
      window.S.wires.splice(index,1);
      if(typeof window.drawWires==='function')window.drawWires();
      if(typeof window.save==='function')window.save();
      const toast=$('#toast');
      if(toast){toast.textContent='Wire removed';toast.className='show'}
    });
  }
  window.VOLTIXWireUX={version:'1.0',guideRemoved:true,clickToRemove:true,keyboardRemove:true};
})();
