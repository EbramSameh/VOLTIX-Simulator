/* VOLTIX Guide Center — plain-language help for the existing simulator. */
(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const guideData = [
    {cat:"Start here",icon:"✦",title:"Build your first circuit",desc:"A quick path from an empty workspace to a running circuit.",steps:["Choose a board at the top (Arduino Uno is the default).","Use the Components panel on the left, or search for a part.","Click a part to add it, then drag it into place.","Click a pin and then another pin to create a wire. Connect power and ground where required.","Open the Code tab, write or load a sketch, then press Run.","Use Diagnostics if the circuit does not behave as expected."],tip:"Try an LED and resistor first. Stop the simulation before changing wiring."},
    {cat:"Workspace & wiring",icon:"⌁",title:"Workspace, parts and wires",desc:"Place parts, connect pins, and keep a circuit organized.",steps:["Search parts with the search box above the component library.","Click a component in the library to add it to the workspace.","Drag components to move them. Use Delete part to remove the selected part.","Click one pin and then a second pin to draw a wire; press Escape to cancel a pending wire.","Fit frames the circuit in view. Zoom +/− changes the view. Tidy arranges parts; Undo can reverse supported changes.","Snap on aligns parts to the grid. Use Clear only when you want to remove all parts and wires."],tip:"A wire must connect to actual pins. A line that merely crosses another wire is not necessarily a connection."},
    {cat:"Code & simulation",icon:"▶",title:"Write and run code",desc:"Use the editor, examples, serial output, and simulation controls.",steps:["Choose a board, then select Load an example to start from a known sketch.","Write code in the Code tab. Autocomplete and diagnostics can help spot common mistakes.","Press Run to start the simulation and Stop to pause it.","Simulation speed changes how quickly virtual time advances; faster modes can make output harder to follow.","Open Serial to inspect printed output. Type in the serial input and press Enter when the sketch reads serial data.","Undo reverses supported recent edits. New circuit returns to a fresh default Arduino Uno setup."],tip:"VOLTIX simulates supported Arduino-style code and virtual components; it is not a complete replacement for every hardware library or physical board."},
    {cat:"Boards & components",icon:"▦",title:"Choose a board or component",desc:"Understand the parts library and board selector.",steps:["The board selector sets the active microcontroller target for the sketch.","The left library groups components by type. Search by name to find a sensor, driver, display, or passive component.","Select a placed component to inspect any available properties.","Use the Parts list to review what is in the current circuit.","Use 3D view for a perspective look at supported boards and components.","Some advanced parts are visual or simplified models; check their specifications and diagnostics for supported behavior."],tip:"Match signal voltage and supply voltage to the component's requirements. A realistic-looking part does not mean every physical detail is simulated."},
    {cat:"Analysis & tools",icon:"⌕",title:"Measurements, signals and diagnostics",desc:"Find wiring mistakes and inspect simulated behavior.",steps:["Diagnostics lists detected circuit problems and suggestions when available.","Measurements shows the values the simulator currently exposes for the circuit.","Signals displays supported changing signals over time.","The wiring assistant and component specifications can help explain pins and common connections.","Failure effects toggles visual failure feedback; it is a teaching aid, not a hardware safety certification.","Libraries lists the built-in helper functions and supported library stubs."],tip:"Treat results as an educational simulation. Verify critical designs with datasheets and real measurements before connecting physical hardware."},
    {cat:"Raspberry Pi",icon:"π",title:"Raspberry Pi workspace",desc:"Use virtual Pi board variants and GPIO-style circuit connections.",steps:["Open Raspberry Pi from the top navigation for Pi-focused information and tools.","Add a Raspberry Pi board from the Components library; supported variants expose a virtual 40-pin header.","Wire supported virtual components to the physical pin labels, and use the GPIO mapping when selecting a GPIO number.","The virtual Pi component can drive supported circuit outputs through its simulated GPIO state.","Use the AI Lab bridge to map a camera/model event to a selected board or Pi GPIO output."],tip:"This is a virtual GPIO abstraction, not a full Raspberry Pi OS environment. It does not boot Linux or execute arbitrary Raspberry Pi Python programs."},
    {cat:"AI Lab & webcam",icon:"◎",title:"Test camera and AI workflows",desc:"Try webcam-based vision and connect a detection event to a virtual output.",steps:["Open AI Lab and choose a camera mode such as motion, colour, brightness, or supported object detection.","Press Start camera and allow browser webcam permission. Keep the page open while testing.","For a supported custom TensorFlow.js image classifier, select model.json together with its weight-shard files and optionally provide labels.","Choose the correct input normalization for your model; its expected input shape and preprocessing must match the model you trained.","Choose an output pin and trigger, then Apply to circuit. Wire that output to a supported component and run the simulation.","Reset disables the automation and returns its output low."],tip:"Custom model upload is not universal: arbitrary PyTorch, ONNX, TFLite, and every detection model are not supported automatically. Model inference runs in the browser and may need an internet connection to load libraries."},
    {cat:"Save, share & compete",icon:"↗",title:"Projects, sharing and challenges",desc:"Keep projects, share a circuit, and explore community features.",steps:["Sign in with Google if a cloud feature asks you to authenticate.","Use Save to cloud to store a project under your account, and My projects to reopen saved work.","Use Share to create a shareable project link when the feature is available.","Build Challenge opens the community competition and leaderboard area; profile and leaderboard data may require the backend rules and sign-in to be configured.","If cloud actions fail, check your sign-in status and the project's Firebase configuration before assuming the circuit itself is broken."],tip:"Never include passwords, API keys, or private credentials in code or shared projects."},
    {cat:"Troubleshooting",icon:"?",title:"If something does not work",desc:"A short checklist before trying again.",steps:["Stop the simulation, then check the board selector and the current code.","Open Diagnostics and inspect unconnected pins, power, ground, or incompatible voltage warnings.","Make sure wires end on pins, not just nearby on the canvas.","If webcam access fails, check browser camera permission and close other apps using the camera.","If custom AI inference fails, verify the selected model files, expected input shape, normalization, and labels.","If cloud saving or leaderboards fail, sign in again and check that the project's Firebase rules are deployed.","Refresh the site with Ctrl+Shift+R after a new version appears."],tip:"Some advanced physical behaviors are simplified. Report the component and steps that caused the issue so it can be reproduced."}
  ];
  const quickActions = [
    ["bd","Board selector","Choose which microcontroller board the sketch targets."],
    ["ex","Load an example","Start with a known example sketch and circuit."],
    ["vx-new-circuit","New circuit","Reset to a clean Arduino Uno workspace and blank sketch."],
    ["run","Run","Start the current simulation."],["stop","Stop","Stop the simulation."],
    ["sp","Simulation speed","Change how quickly simulated time advances."],["v3","3D view","Switch to the supported 3D workspace view."],
    ["und","Undo","Reverse the latest supported edit."],["del","Delete part","Remove the currently selected component."],
    ["clr","Clear","Remove all parts and wires from the workspace."],["lib","Libraries","Review built-in library and helper support."],
    ["bom","Parts list","Review components currently used in the circuit."],
    ["fx","Failure effects","Toggle educational visual failure effects."],["bm","Beginner help","Toggle beginner hints when supported."],
    ["q","Search parts","Filter the component library by name."],["bfit","Fit","Fit the circuit into the visible workspace."],
    ["btidy","Tidy","Arrange parts neatly; Undo may restore the previous layout."],
    ["snap","Snap on","Toggle grid snapping for component placement."],
    ["bzo","Zoom out","Zoom the workspace out."],["bzi","Zoom in","Zoom the workspace in."],
    ["code","Code editor","Edit the sketch for the selected board."],["ss","Network name","Set the simulated Wi-Fi network name."],
    ["pw","Network password","Set the simulated Wi-Fi password; do not use real credentials."],
    ["kick","Disconnect device","Disconnect the simulated device from the virtual gateway."],
    ["url","Gateway URL","Enter a URL served by a simulated ESP web server."],["go","Go","Request the current URL from the simulated gateway."]
  ];
  let modal, search, list, currentCat="All";
  function getAllActions(){
    const byId=new Map(quickActions.map(a=>[a[0],a]));
    document.querySelectorAll("button,select,input,textarea").forEach(el=>{
      if(el.closest("#vx-guide-modal"))return;
      const id=el.id||el.dataset.add||el.dataset.go;
      if(!id||byId.has(id))return;
      const label=(el.getAttribute("aria-label")||el.title||el.innerText||el.getAttribute("placeholder")||el.value||id.replace(/[-_]/g," ")).trim().replace(/\\s+/g," ").slice(0,90);
      if(!label||label==="")return;
      const desc=el.title||el.getAttribute("aria-label")|| (el.matches("input,textarea")?(el.placeholder||"Enter or adjust this value."): "Open or use this control to access the "+label.toLowerCase()+" function.");
      byId.set(id,[id,label,desc]);
    });
    return [...byId.values()];
  }
  const esc = s => String(s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  function init(){
    if($("#vx-guide-open")) return;
    const nav=$(".tl");
    if(nav){const b=document.createElement("button");b.id="vx-guide-open";b.type="button";b.className="vx-guide-nav";b.innerHTML="Guide <span aria-hidden='true'>?</span>";b.setAttribute("aria-label","Open VOLTIX function guide");nav.appendChild(b);}
    modal=document.createElement("section");modal.id="vx-guide-modal";modal.hidden=true;modal.setAttribute("role","dialog");modal.setAttribute("aria-modal","true");modal.setAttribute("aria-labelledby","vx-guide-title");
    modal.innerHTML=`<div class="vx-guide-backdrop" data-guide-close></div><div class="vx-guide-panel"><header class="vx-guide-head"><div><span class="vx-guide-kicker">VOLTIX HELP CENTER</span><h2 id="vx-guide-title">Find your way around</h2><p>Plain-language guides for every main tool.</p></div><button type="button" class="vx-guide-close" aria-label="Close guide" data-guide-close>×</button></header><label class="vx-guide-search"><span aria-hidden="true">⌕</span><input id="vx-guide-search" type="search" placeholder="Search tools, features, or problems…" autocomplete="off"></label><div class="vx-guide-body"><nav class="vx-guide-cats" aria-label="Guide topics"></nav><div class="vx-guide-content"><div class="vx-guide-results" id="vx-guide-results"></div><div class="vx-guide-detail" id="vx-guide-detail"></div></div></div><footer class="vx-guide-foot"><span>Tip: press <kbd>?</kbd> to open this guide</span><button type="button" data-guide-close>Back to simulator</button></footer></div>`;
    document.body.appendChild(modal);search=$("#vx-guide-search",modal);list=$("#vx-guide-results",modal);
    $("#vx-guide-open").addEventListener("click",()=>open());
    modal.addEventListener("click",e=>{if(e.target.closest("[data-guide-close]"))close();const b=e.target.closest("[data-guide-topic]");if(b){currentCat=b.dataset.guideTopic;render();}});
    search.addEventListener("input",render);
    document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!modal.hidden)close();if(e.key==="?"&&!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)&&!e.ctrlKey&&!e.metaKey){e.preventDefault();open();}});
    render();
    // Add useful tooltips to main controls without changing their existing actions.
    quickActions.forEach(([id,label,help])=>{const el=$("#"+id);if(el&&!el.title)el.title=label+" — "+help;});
    document.querySelectorAll("button[data-go]").forEach(el=>{const route=el.dataset.go;const guide={home:"Return to the VOLTIX landing page.",sim:"Open the circuit workspace.",parts:"Browse supported components.",pi:"Open Raspberry Pi tools and GPIO guidance.",ai:"Open camera and AI workflow tools.",about:"Read about VOLTIX and its creator.",challenge:"Open build challenges and leaderboards."};if(guide[route]&&!el.title)el.title=guide[route];});
  }
  function open(){modal.hidden=false;document.body.classList.add("vx-guide-open");currentCat="All";render();search.value="";render();setTimeout(()=>search.focus(),20);}
  function close(){modal.hidden=true;document.body.classList.remove("vx-guide-open");$("#vx-guide-open")?.focus();}
  function render(){
    if(!modal)return;
    const q=(search?.value||"").trim().toLowerCase();
    const topics=["All",...new Set(guideData.map(g=>g.cat))];
    $(".vx-guide-cats",modal).innerHTML=topics.map(c=>`<button type="button" data-guide-topic="${esc(c)}" class="${currentCat===c?"active":""}>${esc(c)}<span>${c==="All"?guideData.length:guideData.filter(g=>g.cat===c).length}</span></button>`).join("");
    const matches=guideData.filter(g=>(currentCat==="All"||g.cat===currentCat)&&(!q||[g.cat,g.title,g.desc,...g.steps,g.tip].join(" ").toLowerCase().includes(q)));
    const actions=getAllActions().filter(a=>!q||a.join(" ").toLowerCase().includes(q));
    const cards=matches.map((g,i)=>`<button type="button" class="vx-guide-card" data-guide-index="${guideData.indexOf(g)}"><span class="vx-guide-icon">${g.icon}</span><span><b>${esc(g.title)}</b><small>${esc(g.desc)}</small><em>${esc(g.cat)}</em></span><span class="vx-guide-arrow">›</span></button>`).join("");
    const tools=actions.length?`<div class="vx-guide-section-label">TOOL QUICK REFERENCE</div>`+actions.map(a=>`<div class="vx-guide-tool"><b>${esc(a[1])}</b><span>${esc(a[2])}</span></div>`).join(""):"";
    list.innerHTML=(matches.length?cards:"<p class='vx-guide-empty'>No topic matches yet. Try a shorter search.</p>")+tools;
    list.querySelectorAll("[data-guide-index]").forEach(b=>b.addEventListener("click",()=>showDetail(guideData[+b.dataset.guideIndex])));
    const detail=$("#vx-guide-detail",modal);if(!detail.dataset.ready){detail.innerHTML=`<div class="vx-guide-welcome"><div class="vx-guide-welcome-mark">V</div><h3>Small steps. Better circuits.</h3><p>Choose a topic to see step-by-step instructions. Search also finds individual controls and common fixes.</p><div class="vx-guide-start"><b>Recommended first run</b><ol><li>Choose Arduino Uno.</li><li>Add an LED and resistor.</li><li>Connect the LED through the resistor to a digital pin and connect GND.</li><li>Load an example, then press Run.</li></ol></div></div>`;detail.dataset.ready="1";}
  }
  function showDetail(g){
    const detail=$("#vx-guide-detail",modal);
    detail.innerHTML=`<button type="button" class="vx-guide-back" id="vx-guide-back">← All guides</button><span class="vx-guide-kicker">${esc(g.cat)}</span><h3>${esc(g.title)}</h3><p class="vx-guide-detail-desc">${esc(g.desc)}</p><ol class="vx-guide-steps">${g.steps.map(s=>`<li>${esc(s)}</li>`).join("")}</ol><div class="vx-guide-tip"><b>Good to know</b><p>${esc(g.tip)}</p></div>`;
    $("#vx-guide-back",detail).onclick=()=>render();
    detail.scrollTop=0;
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();