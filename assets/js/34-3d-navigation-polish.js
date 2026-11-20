/* VOLTIX navigation and 3D entry-point refinement. */
(()=> {
 const view=document.getElementById('v3');
 const controls=document.querySelector('.vx-run-controls');
 if(view&&controls&&!controls.contains(view)){
  view.textContent='3D View';
  view.title='Open the interactive 3D hardware view';
  view.setAttribute('aria-label','Open the interactive 3D hardware view');
  view.classList.add('vx-3d-launch');
  controls.insertBefore(view,controls.firstChild);
 }
 document.querySelectorAll('#top [data-go]').forEach(button=>{
  button.addEventListener('click',()=>{
   document.querySelectorAll('#top [data-go]').forEach(x=>x.classList.remove('vx-nav-current'));
   button.classList.add('vx-nav-current');
  });
 });
 document.querySelectorAll('.vx-nav-more,.vx-project-menu,.vx-tools-menu').forEach(menu=>{
  menu.addEventListener('toggle',()=>{
   if(!menu.open)return;
   document.querySelectorAll('.vx-nav-more[open],.vx-project-menu[open],.vx-tools-menu[open]').forEach(other=>{
    if(other!==menu)other.open=false;
   });
  });
 });
})();
