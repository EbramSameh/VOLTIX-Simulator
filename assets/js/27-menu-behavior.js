/* Keep VOLTIX dropdowns predictable: one menu open at a time. */
(()=> {
 const menus=[...document.querySelectorAll('#top details,.vx-workbar details')];
 menus.forEach(menu=>{
  menu.addEventListener('toggle',()=>{
   if(!menu.open)return;
   menus.forEach(other=>{if(other!==menu&&other.open)other.open=false});
  });
 });
 document.addEventListener('pointerdown',event=>{
  if(event.target.closest('#top details,.vx-workbar details'))return;
  menus.forEach(menu=>{if(menu.open)menu.open=false});
 });
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape')menus.forEach(menu=>{if(menu.open)menu.open=false});
 });
})();
