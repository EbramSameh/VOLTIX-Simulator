/* VOLTIX Studio controls: theme preferences, accessibility options and keyboard shortcuts. */
(()=>{
  const $=s=>document.querySelector(s);
  const body=document.body;
  const safeGet=(k,f)=>{try{return localStorage.getItem(k)||f}catch{return f}};
  const safeSet=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
  const themes={crimson:'Crimson / studio',teal:'Teal / lab',violet:'Violet / classic'};
  const applyTheme=t=>{const theme=themes[t]?t:'crimson';body.dataset.vxTheme=theme==='crimson'?'crimson':theme;safeSet('voltix-theme',theme);const s=$('#vx-theme-select');if(s)s.value=theme};
  const applyToggle=(key,cls,on)=>{body.classList.toggle(cls,on);safeSet(key,on?'1':'0');const e=$('#'+key.replace('voltix-','vx-'));if(e)e.checked=on};
  const mount=()=>{
    const nav=$('#top .tl');
    if(!nav||$('#vx-studio-controls'))return;
    const wrap=document.createElement('div');wrap.id='vx-studio-controls';
    wrap.innerHTML='<button id="vx-studio-open" type="button" aria-expanded="false" aria-controls="vx-studio-panel">Studio settings ▾</button><section id="vx-studio-panel" hidden aria-label="Studio settings"><h3>Studio controls</h3><p>Personalize the workspace. Your preferences stay in this browser.</p><label for="vx-theme-select"><span>Color theme</span><select id="vx-theme-select"><option value="crimson">Crimson / studio</option><option value="teal">Teal / lab</option><option value="violet">Violet / classic</option></select></label><label for="vx-compact-mode"><span>Compact controls</span><input id="vx-compact-mode" type="checkbox"></label><label for="vx-reduced-motion"><span>Reduce animations</span><input id="vx-reduced-motion" type="checkbox"></label><div style="margin-top:12px"><h3>Keyboard shortcuts</h3><div class="vx-shortcut"><span>Run simulation</span><kbd>Ctrl / ⌘ + Enter</kbd></div><div class="vx-shortcut"><span>Open studio settings</span><kbd>Ctrl / ⌘ + Shift + P</kbd></div><div class="vx-shortcut"><span>Close settings / cancel wire</span><kbd>Esc</kbd></div><div class="vx-shortcut"><span>Undo last action</span><kbd>Ctrl / ⌘ + Z</kbd></div></div></section>';
    nav.parentNode.insertBefore(wrap,nav.nextSibling);
    const panel=$('#vx-studio-panel'),btn=$('#vx-studio-open');
    const open=v=>{panel.hidden=!v;btn.setAttribute('aria-expanded',String(v))};
    btn.addEventListener('click',()=>open(panel.hidden));
    $('#vx-theme-select').addEventListener('change',e=>applyTheme(e.target.value));
    $('#vx-compact-mode').addEventListener('change',e=>applyToggle('voltix-compact','vx-compact',e.target.checked));
    $('#vx-reduced-motion').addEventListener('change',e=>applyToggle('voltix-motion','vx-reduced-motion',e.target.checked));
    document.addEventListener('pointerdown',e=>{if(!wrap.contains(e.target))open(false)});
    document.addEventListener('keydown',e=>{
      const typing=/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.target.isContentEditable;
      if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();const run=$('#run');if(run&&body.dataset.r==='sim')run.click();else{const goSim=$('[data-go="sim"]');if(goSim)goSim.click()}return}
      if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='p'){e.preventDefault();open(panel.hidden);if(!panel.hidden)$('#vx-theme-select').focus();return}
      if(e.key==='Escape')open(false);
      if(!typing&&(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'&&body.dataset.r==='sim'){e.preventDefault();const save=$('#vx-save-cloud');if(save)save.click()}
    });
    applyTheme(safeGet('voltix-theme','crimson'));
    $('#vx-compact-mode').checked=safeGet('voltix-compact','0')==='1';body.classList.toggle('vx-compact',$('#vx-compact-mode').checked);
    $('#vx-reduced-motion').checked=safeGet('voltix-motion','0')==='1';body.classList.toggle('vx-reduced-motion',$('#vx-reduced-motion').checked);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
