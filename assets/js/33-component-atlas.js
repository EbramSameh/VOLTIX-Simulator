/* VOLTIX component atlas: detailed PCB finish and integrated sensor inspector. */
(()=>{
 if(typeof drawPart!=="function"||typeof PT==="undefined")return;
 const panel=document.getElementById("vx-sensor-panel"),inspector=document.getElementById("props");
 if(panel&&inspector&&!inspector.contains(panel)){
  const label=inspector.querySelector(".vx-inspector-controls-label");
  if(label)label.after(panel);else inspector.append(panel);
  panel.classList.add("vx-inspector-sensor-panel");
 }
 window.VOLTIXComponentAtlas={version:"2.0",style:"component-specific-package-art",genericOverlay:false};
 const panel=document.getElementById("vx-sensor-panel"),inspector=document.getElementById("props");
 if(panel&&inspector&&!inspector.contains(panel)){
  const label=inspector.querySelector(".vx-inspector-controls-label");
  if(label)label.after(panel);else inspector.append(panel);
  panel.classList.add("vx-inspector-sensor-panel");
 }
 if(typeof draw==="function")draw();
})();