/* VOLTIX new application navigation. Additive: existing go(), pages and simulator controls remain authoritative. */
(()=> {
 const $=s=>document.querySelector(s),body=document.body,top=$('#top');
 if(!top||$('#vx-app-sidebar'))return;
 const destinations=[
  {id:'home',label:'Overview',icon:'⌂',group:'BUILD'},
  {id:'sim',label:'Circuit workspace',icon:'▦',group:'BUILD'},
  {id:'parts',label:'Component library',icon:'▤',group:'DESIGN'},
  {id:'ai',label:'AI Lab',icon:'⌘',group:'DESIGN'},
  {id:'pi',label:'Raspberry Pi',icon:'◫',group:'PLATFORM'},
  {id:'challenge',label:'Challenges',icon:'◇',group:'PLATFORM'},
  {id:'about',label:'About VOLTIX',icon:'ⓘ',group:'OTHER'}
 ];
 const side=document.createElement('aside');side.id='vx-app-sidebar';side.setAttribute('aria-label','Application navigation');
 side.innerHTML=`<a class="vx-side-brand" href="#home"><img src="assets/voltix-brand.svg" alt=""><span>VOLTIX<small>ENGINEERING STUDIO</small></span></a><div class="vx-side-label">Workspace</div><nav class="vx-side-nav" id="vx-primary-nav"></nav><div class="vx-side-bottom"><div class="vx-side-label" style="padding-top:8px">Account</div><div id="vx-account-slot"></div><div class="vx-side-foot">VOLTIX Simulator<br>Build · Test · Learn</div></div>`;
 const nav=$('#vx-primary-nav');let group='';
 destinations.forEach(item=>{
  if(item.group!==group){group=item.group;const label=document.createElement('div');label.className='vx-side-label';label.textContent=group;nav.append(label)}
  const b=document.createElement('button');b.type='button';b.dataset.route=item.id;b.innerHTML=`<span class="vx-nav-icon" aria-hidden="true">${item.icon}</span><span>${item.label}</span>`;b.addEventListener('click',()=>{if(typeof window.go==='function')window.go(item.id);else document.querySelector('[data-go="'+item.id+'"]')?.click();body.classList.remove('vx-nav-open')});nav.append(b);
 });
 document.body.insertBefore(side,top);
 side.querySelector('.vx-side-brand').addEventListener('click',e=>{e.preventDefault();window.go?.('home');body.classList.remove('vx-nav-open')});
 const cloud=$('#vx-cloud-controls');if(cloud)$('#vx-account-slot').append(cloud);
 top.classList.add('vx-new-top');
 const mobile=document.createElement('button');mobile.className='vx-mobile-menu';mobile.type='button';mobile.setAttribute('aria-label','Open navigation');mobile.setAttribute('aria-expanded','false');mobile.textContent='☰';top.prepend(mobile);
 mobile.addEventListener('click',()=>{const open=body.classList.toggle('vx-nav-open');mobile.setAttribute('aria-expanded',String(open))});
 const context=document.createElement('div');context.className='vx-top-context';context.innerHTML='<strong id="vx-current-section">Overview</strong><span class="vx-top-divider"></span><span id="vx-current-description">Your engineering workspace</span>';
 top.append(context);
 const home=document.createElement('button');home.type='button';home.className='vx-top-home';home.textContent='＋ New circuit';home.addEventListener('click',()=>{if(body.dataset.r!=='sim')window.go?.('sim');$('#vx-new-circuit')?.click()});
 top.append(home);
 const desc={home:'Your engineering workspace',sim:'Design, wire and simulate circuits',parts:'Explore supported hardware and components',ai:'Experiment with browser-based vision and models',pi:'Explore Raspberry Pi boards and GPIO',challenge:'Practice engineering through challenges',about:'Learn about the VOLTIX project'};
 const title={home:'Overview',sim:'Circuit workspace',parts:'Component library',ai:'AI Lab',pi:'Raspberry Pi',challenge:'Challenges',about:'About VOLTIX'};
 const sync=()=>{
  const route=body.dataset.r||'home';
  nav.querySelectorAll('[data-route]').forEach(b=>{const active=b.dataset.route===route;b.classList.toggle('active',active);b.setAttribute('aria-current',active?'page':'false')});
  const t=$('#vx-current-section'),d=$('#vx-current-description');if(t)t.textContent=title[route]||'VOLTIX';if(d)d.textContent=desc[route]||'Engineering workspace';
 };
 const observer=new MutationObserver(sync);observer.observe(body,{attributes:true,attributeFilter:['data-r']});sync();
 document.addEventListener('click',e=>{if(!e.target.closest('#vx-app-sidebar,.vx-mobile-menu')&&body.classList.contains('vx-nav-open')){body.classList.remove('vx-nav-open');mobile.setAttribute('aria-expanded','false')}});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){body.classList.remove('vx-nav-open');mobile.setAttribute('aria-expanded','false')}});
 const projectMenu=$('.vx-project-menu');if(projectMenu){projectMenu.addEventListener('toggle',()=>{if(projectMenu.open){document.addEventListener('click',function close(e){if(!projectMenu.contains(e.target)){projectMenu.open=false;document.removeEventListener('click',close)}},{once:false})}})}
})();
