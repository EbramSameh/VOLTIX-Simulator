/* VOLTIX guided project workflow. Additive module: existing simulator controls remain unchanged. */
(() => {
  'use strict';
  const key = 'voltix-workflow-complete-v1';
  const steps = [
    {title:'Choose components',desc:'Open the library, find the board and parts your project needs.',route:'parts',action:'Browse components'},
    {title:'Build the circuit',desc:'Place components and connect the pins, power and ground.',route:'sim',action:'Open workspace'},
    {title:'Code and simulate',desc:'Write or load a sketch, then run the virtual circuit.',route:'sim',action:'Open workspace'},
    {title:'Inspect and save',desc:'Check diagnostics and 3D, then save or share when ready.',route:'sim',action:'Review project'}
  ];
  const $ = (s, root=document) => root.querySelector(s);
  const read = () => { try { const value=JSON.parse(localStorage.getItem(key)||'[]'); return Array.isArray(value)?value.filter(n=>Number.isInteger(n)&&n>=0&&n<steps.length):[]; } catch { return []; } };
  const write = value => { try { localStorage.setItem(key,JSON.stringify(value)); } catch {} };
  const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function mount(){
    const home=$('#p-home');
    if(!home||$('#vx-workflow')) return;
    const anchor=$('.cta',home);
    const panel=document.createElement('section');
    panel.id='vx-workflow';panel.className='vx-workflow';panel.setAttribute('aria-labelledby','vx-workflow-title');
    panel.innerHTML='<div class="vx-workflow-head"><div><span class="vx-workflow-kicker">YOUR PROJECT, STEP BY STEP</span><h2 id="vx-workflow-title">A clearer path from idea to simulation</h2><p>Follow the circuit workflow in order, or jump straight to the step you need. Your checklist stays saved in this browser.</p></div><span class="vx-workflow-count" id="vx-workflow-count" aria-live="polite">0 of 4 complete</span></div><div class="vx-workflow-grid" id="vx-workflow-grid"></div><div class="vx-workflow-bottom"><span id="vx-workflow-hint">Start with your components. You can revisit any step at any time.</span><button class="vx-workflow-reset" type="button" id="vx-workflow-reset">Reset checklist</button></div><div class="vx-ai-path"><h3>Working with computer vision or Raspberry Pi?</h3><p>Test supported camera and browser-based AI workflows separately from the circuit simulator. Browser previews do not emulate a full Raspberry Pi OS or guarantee that a model will run on physical hardware.</p><div class="vx-ai-path-actions"><button type="button" data-go="pi">Choose Raspberry Pi</button><button type="button" data-go="ai">Open AI Lab</button></div></div>';
    if(anchor) anchor.insertAdjacentElement('afterend',panel); else home.prepend(panel);
    panel.addEventListener('click',event=>{
      const stepButton=event.target.closest('[data-workflow-step]');
      if(stepButton){const i=Number(stepButton.dataset.workflowStep);if(!Number.isInteger(i)||!steps[i])return;const done=new Set(read());done.has(i)?done.delete(i):done.add(i);write([...done]);render();return;}
      const goButton=event.target.closest('[data-workflow-go]');
      if(goButton){const route=goButton.dataset.workflowGo;const nav=document.querySelector('[data-go="'+route+'"]');if(nav)nav.click();return;}
      if(event.target.closest('#vx-workflow-reset')){write([]);render();}
    });
    render();
  }
  function render(){
    const grid=$('#vx-workflow-grid');if(!grid)return;
    const done=new Set(read());
    grid.innerHTML=steps.map((s,i)=>'<article class="vx-workflow-step"><span class="vx-workflow-num">'+(done.has(i)?'✓':i+1)+'</span><b>'+escape(s.title)+'</b><small>'+escape(s.desc)+'</small><div class="vx-workflow-card-actions"><button type="button" data-workflow-go="'+escape(s.route)+'">'+escape(s.action)+'</button><button type="button" data-workflow-step="'+i+'" aria-pressed="'+done.has(i)+'">'+(done.has(i)?'✓ Completed · undo':'Mark complete')+'</button></div></article>').join('');
    const count=done.size;
    const counter=$('#vx-workflow-count');if(counter)counter.textContent=count+' of '+steps.length+' complete';
    const hint=$('#vx-workflow-hint');if(hint)hint.textContent=count===steps.length?'Workflow complete — start another project or revisit any step.':count===0?'Start with your components. You can revisit any step at any time.':steps.find((_,i)=>!done.has(i)).title+' is your next suggested step.';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
