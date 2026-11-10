/* VOLTIX navigation — keeps the circuit workspace's original DOM and layout intact. */
(()=> {
 const $=s=>document.querySelector(s),body=document.body,top=$('#top');
 if(!top||$('#vx-app-sidebar'))return;
 const links=[
  ['home','Overview','⌂','START'],
  ['sim','Circuit simulator','▦','BUILD'],
  ['parts','Component library','▤','BUILD'],
  ['ai','AI Lab','⌘','EXPLORE'],
  ['pi','Raspberry Pi','◫','EXPLORE'],
  ['challenge','Challenges','◇','EXPLORE'],
  ['about','About VOLTIX','ⓘ','MORE']
 ];
 const sidebar=document.createElement('aside');sidebar.id='vx-app-sidebar';sidebar.setAttribute('aria-label','VOLTIX navigation');
 sidebar.innerHTML='<a class="vx-brand" href="#home"><img src="assets/voltix-brand.svg" alt=""><span><strong>VOLTIX</strong><small>ENGINEERING STUDIO</small></span></a><nav class="vx-page-nav" aria-label="Main sections"></nav><div class="vx-side-account"><div class="vx-nav-caption" style="padding:0 10px 9px">Your account</div><div id="vx-account-slot"></div><div class="vx-side-footer">Build. Test. Understand.<br>Engineering tools in your browser.</div></div>';
 const nav=sidebar.querySelector('nav');let group='';
 links.forEach(([id,label,icon,section])=>{
  if(section!==group){group=section;const cap=document.createElement('div');cap.className='vx-nav-caption';cap.textContent=section;nav.append(cap)}
  const button=document.createElement('button');button.type='button';button.dataset.route=id;button.innerHTML='<span class="vx-nav-icon" aria-hidden="true">'+icon+'</span><span>'+label+'</span>';
  button.addEventListener('click',()=>{if(typeof window.go==='function')window.go(id);body.classList.remove('vx-nav-open')});nav.append(button);
 });
 body.insertBefore(sidebar,top);
 const backdrop=document.createElement('div');backdrop.id='vx-nav-backdrop';backdrop.addEventListener('click',()=>body.classList.remove('vx-nav-open'));body.append(backdrop);
 const toggle=document.createElement('button');toggle.type='button';toggle.className='vx-mobile-nav-toggle';toggle.setAttribute('aria-label','Open navigation');toggle.setAttribute('aria-expanded','false');toggle.textContent='☰';
 toggle.addEventListener('click',()=>{const open=body.classList.toggle('vx-nav-open');toggle.setAttribute('aria-expanded',String(open))});top.prepend(toggle);
 const heading=document.createElement('div');heading.className='vx-page-heading';heading.innerHTML='<span id="vx-page-title">Overview</span><small id="vx-page-subtitle">Your engineering workspace</small>';
 top.append(heading);
 const account=$('#vx-cloud-controls'),accountSlot=$('#vx-account-slot');
 const names={home:['Overview','Your engineering workspace'],sim:['Circuit simulator','Design, wire and test a circuit'],parts:['Component library','Find parts and check simulation support'],ai:['AI Lab','Explore browser vision and model workflows'],pi:['Raspberry Pi','Boards, GPIO and camera reference'],challenge:['Challenges','Practice with guided engineering tasks'],about:['About VOLTIX','Project information and scope']};
 function sync(){
  const route=body.dataset.r||'home',isSim=route==='sim';
  body.classList.toggle('vx-in-simulator',isSim);
  sidebar.hidden=isSim;backdrop.hidden=isSim;toggle.hidden=isSim;heading.hidden=isSim;
  top.classList.toggle('vx-pages-top',!isSim);
  if(account){if(isSim){if(account.parentElement!==top)top.append(account)}else if(account.parentElement!==accountSlot)accountSlot.append(account)}
  nav.querySelectorAll('[data-route]').forEach(b=>{const active=b.dataset.route===route;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
  const data=names[route]||names.home;$('#vx-page-title').textContent=data[0];$('#vx-page-subtitle').textContent=data[1];
  body.classList.remove('vx-nav-open');toggle.setAttribute('aria-expanded','false');
 }
 const observer=new MutationObserver(sync);observer.observe(body,{attributes:true,attributeFilter:['data-r']});
 sidebar.querySelector('.vx-brand').addEventListener('click',e=>{e.preventDefault();window.go?.('home')});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){body.classList.remove('vx-nav-open');toggle.setAttribute('aria-expanded','false')}});
 sync();
})();
