/* VOLTIX 2.0 workspace preferences and keyboard shortcuts. */
(()=>{
 const $=s=>document.querySelector(s),body=document.body;
 const get=(k,d)=>{try{return localStorage.getItem(k)||d}catch{return d}};
 const set=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
 const themes=['ember','ocean','violet'];
 const theme=t=>{if(!themes.includes(t))t='crimson';body.dataset.vxTheme=t;set('voltix-theme',t);const s=$('#vx-theme-select');if(s)s.value=t};
 const toggle=(key,cls,on)=>{body.classList.toggle(cls,on);set(key,on?'1':'0')};
 function mount(){
  const nav=$('#top .tl');if(!nav||$('#vx-studio-controls'))return;
  const box=document.createElement('div');box.id='vx-studio-controls';
  box.innerHTML='<button id="vx-studio-open" type="button" aria-expanded="false" aria-controls="vx-studio-panel">Preferences</button><section id="vx-studio-panel" hidden aria-label="Workspace preferences"><h3>Workspace preferences</h3><p>Make VOLTIX comfortable for your workflow. Preferences are saved in this browser.</p><label for="vx-theme-select"><span>Accent theme</span><select id="vx-theme-select"><option value="ember">Ember / coral</option><option value="ocean">Ocean / blue</option><option value="violet">Violet</option></select></label><label for="vx-compact-mode"><span>Compact workspace</span><input id="vx-compact-mode" type="checkbox"></label><label for="vx-reduced-motion"><span>Reduce motion</span><input id="vx-reduced-motion" type="checkbox"></label><div style="margin-top:13px"><h3>Shortcuts</h3><div class="vx-shortcut"><span>Run simulation</span><kbd>Ctrl / ⌘ + Enter</kbd></div><div class="vx-shortcut"><span>Open preferences</span><kbd>Ctrl / ⌘ + Shift + P</kbd></div><div class="vx-shortcut"><span>Undo</span><kbd>Ctrl / ⌘ + Z</kbd></div><div class="vx-shortcut"><span>Cancel / close</span><kbd>Esc</kbd></div><div class="vx-shortcut"><span>Delete selected part</span><kbd>Delete</kbd></div></div></section>';
  nav.parentNode.insertBefore(box,nav.nextSibling);
  const panel=$('#vx-studio-panel'),btn=$('#vx-studio-open');
  const open=v=>{panel.hidden=!v;btn.setAttribute('aria-expanded',String(v))};
  btn.addEventListener('click',()=>open(panel.hidden));
  $('#vx-theme-select').addEventListener('change',e=>theme(e.target.value));
  $('#vx-compact-mode').addEventListener('change',e=>toggle('voltix-compact','vx-compact',e.target.checked));
  $('#vx-reduced-motion').addEventListener('change',e=>toggle('voltix-motion','vx-reduced-motion',e.target.checked));
  document.addEventListener('pointerdown',e=>{if(!box.contains(e.target))open(false)});
  document.addEventListener('keydown',e=>{
   const typing=/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.target.isContentEditable;
   if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();if(body.dataset.r==='sim')$('#run')?.click();else $('[data-go="sim"]')?.click();return}
   if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='p'){e.preventDefault();open(panel.hidden);if(!panel.hidden)$('#vx-theme-select').focus();return}
   if(e.key==='Escape')open(false);
   if(!typing&&(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'&&body.dataset.r==='sim'){e.preventDefault();$('#vx-save-cloud')?.click()}
  });
  theme(get('voltix-theme','ember'));
  $('#vx-compact-mode').checked=get('voltix-compact','0')==='1';body.classList.toggle('vx-compact',$('#vx-compact-mode').checked);
  $('#vx-reduced-motion').checked=get('voltix-motion','0')==='1';body.classList.toggle('vx-reduced-motion',$('#vx-reduced-motion').checked);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
