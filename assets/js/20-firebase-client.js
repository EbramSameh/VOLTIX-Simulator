/* Firebase authentication and Firestore client integration. */

import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, updateProfile } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js';
import {
  getFirestore, collection, doc, getDoc, getDocs, setDoc, deleteDoc, onSnapshot,
  serverTimestamp, query, orderBy, limit, where
} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyBjSYxFm7x-Us-0QkbP8f5IHghBWXO2IeY",
  authDomain: "voltix-dc38e.firebaseapp.com",
  projectId: "voltix-dc38e",
  storageBucket: "voltix-dc38e.firebasestorage.app",
  messagingSenderId: "336638796384",
  appId: "1:336638796384:web:fa3a1505d6dc75c7ae5905",
  measurementId: "G-0XM4G5DSZY"
};

const bridge = window.VOLTIXFirebaseBridge;
const $vx = (id) => document.getElementById(id);
const signInBtn = $vx('vx-signin');
const saveBtn = $vx('vx-save-cloud');
const projectsBtn = $vx('vx-my-projects');
const shareBtn = $vx('vx-share-cloud');
const authLabel = $vx('vx-auth-label');
let auth, db, currentUser = null, activeProjectId = null, activeProjectTitle = '';
let cloudModal = null;
let leaderboardBtn = null;
let loginResolve = null;
let authGateActive = false;
let presenceUnsubscribe = null, presenceHeartbeat = null, presenceUid = null;
const storageGet = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
const storageSet = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
const storageRemove = (key) => { try { localStorage.removeItem(key); } catch {} };
const activeIdKey = (uid) => `vx-cloud-active:${uid}`;
const activeTitleKey = (uid) => `vx-cloud-title:${uid}`;

function setStatus(message, bad = false) {
  authLabel.textContent = message;
  authLabel.classList.toggle('bad', bad);
  if (cloudModal) {
    const msg = cloudModal.querySelector('.vx-cloud-message');
    if (msg) {
      msg.textContent = message;
      msg.classList.toggle('bad', bad);
    }
  }
}
function friendlyError(error) {
  const code = error && error.code ? error.code : '';
  if (code === 'auth/operation-not-allowed') return 'Google sign-in is not enabled yet. In Firebase, open Authentication → Sign-in method and enable Google.';
  if (code === 'auth/unauthorized-domain') return 'This website domain is not authorized. In Firebase Authentication settings, add ebramsameh.github.io under Authorized domains.';
  if (code === 'auth/popup-blocked') return 'The browser blocked the sign-in popup. Allow popups for this site and try again.';
  if (code === 'auth/popup-closed-by-user') return 'The sign-in window was closed before sign-in finished.';
  if (code === 'auth/network-request-failed' || code === 'unavailable') return 'Network connection failed. Check your internet connection and try again.';
  if (code === 'permission-denied' || code === 'firestore/permission-denied') return 'Firestore blocked this request. Open Firebase Console → Firestore Database → Rules, publish the rules from the repository file firestore.rules, then reload VOLTIX.';
  if (code === 'auth/invalid-api-key' || code === 'app/invalid-api-key') return 'Firebase rejected the web API key. Recheck the web app configuration in Project settings.';
  return (error && error.message) ? error.message : 'An unexpected Firebase error occurred.';
}
function showError(error) {
  const msg = friendlyError(error);
  setStatus(msg, true);
  console.error('[VOLTIX Firebase]', error);
  return msg;
}
function paintLiveUsers(count) {
  const el = $vx('vx-live-users-count');
  if (el) el.textContent = String(count);
}
function stopPresence() {
  if (presenceHeartbeat) clearInterval(presenceHeartbeat);
  presenceHeartbeat = null;
  if (presenceUnsubscribe) presenceUnsubscribe();
  presenceUnsubscribe = null;
  const oldUid = presenceUid;
  presenceUid = null;
  paintLiveUsers('—');
  if (oldUid && db) deleteDoc(doc(db, 'onlinePresence', oldUid)).catch(() => {});
}
function startPresence(user) {
  if (!db || !user) return;
  if (presenceUid === user.uid && presenceUnsubscribe) return;
  if (presenceUid) stopPresence();
  presenceUid = user.uid;
  const presenceRef = doc(db, 'onlinePresence', user.uid);
  const heartbeat = () => setDoc(presenceRef, {
    displayName: user.displayName || 'Builder',
    lastSeen: serverTimestamp()
  }, { merge: true }).catch(error => {
    console.warn('[VOLTIX presence] Could not update live status:', error);
    paintLiveUsers('—');
  });
  heartbeat();
  presenceHeartbeat = setInterval(heartbeat, 45000);
  presenceUnsubscribe = onSnapshot(collection(db, 'onlinePresence'), snapshot => {
    const now = Date.now();
    let active = 0;
    snapshot.forEach(item => {
      const seen = item.data().lastSeen;
      if (seen && typeof seen.toMillis === 'function' && now - seen.toMillis() < 120000) active++;
    });
    paintLiveUsers(active);
  }, error => {
    console.warn('[VOLTIX presence] Live counter unavailable. Check Firestore rules.', error);
    paintLiveUsers('—');
  });
}
function renderAuth() {
  let profileChip = $vx('vx-user-profile');
  if (!profileChip && $vx('vx-cloud-controls')) {
    profileChip = document.createElement('button');
    profileChip.id = 'vx-user-profile';
    profileChip.type = 'button';
    profileChip.className = 'vx-user-profile';
    profileChip.hidden = true;
    profileChip.setAttribute('aria-label', 'Google account profile');
    profileChip.innerHTML = '<span class="vx-user-avatar" aria-hidden="true"></span><span class="vx-user-name"></span><span class="vx-user-chevron" aria-hidden="true">⌄</span>';
    profileChip.addEventListener('click', () => {
      if (currentUser && typeof openProfileSettings === 'function') openProfileSettings();
    });
    const shareControl = $vx('vx-share-cloud');
    if (shareControl) shareControl.insertAdjacentElement('afterend', profileChip);
    else $vx('vx-cloud-controls').appendChild(profileChip);
  }
  if (currentUser) {
    const label = currentUser.displayName || currentUser.email || 'Signed in';
    signInBtn.textContent = 'Sign out';
    signInBtn.title = `Signed in as ${label}. Click to sign out.`;
    authLabel.textContent = `Signed in: ${label}`;
    authLabel.classList.remove('bad');
    if (profileChip) {
      profileChip.hidden = false;
      profileChip.title = `Google account: ${label}`;
      const avatar = profileChip.querySelector('.vx-user-avatar');
      avatar.replaceChildren();
      if (currentUser.photoURL) {
        const image = document.createElement('img');
        image.src = currentUser.photoURL;
        image.alt = '';
        image.referrerPolicy = 'no-referrer';
        image.onerror = () => { avatar.replaceChildren(); avatar.textContent = (currentUser.displayName || currentUser.email || 'V').trim().slice(0,1).toUpperCase(); };
        avatar.appendChild(image);
      } else {
        avatar.textContent = (currentUser.displayName || currentUser.email || 'V').trim().slice(0,1).toUpperCase();
      }
      profileChip.querySelector('.vx-user-name').textContent = currentUser.displayName || 'My profile';
    }
  } else {
    signInBtn.textContent = 'Sign in with Google';
    signInBtn.title = 'Sign in securely with Google to save and share projects';
    authLabel.textContent = 'Not signed in';
    authLabel.classList.remove('bad');
    if (profileChip) profileChip.hidden = true;
  }
}async function signIn() {
  if (currentUser) return currentUser;
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    currentUser = result.user;
    if (!activeProjectId) activeProjectId = storageGet(activeIdKey(currentUser.uid));
    if (!activeProjectTitle) activeProjectTitle = storageGet(activeTitleKey(currentUser.uid)) || '';
    renderAuth();
    setStatus(`Signed in as ${currentUser.displayName || currentUser.email || 'Google user'}.`);
    return currentUser;
  } catch (error) {
    showError(error);
    return null;
  }
}
async function requireUser() {
  if (currentUser) return currentUser;
  const signedInUser = await openLoginExperience();
  if (!signedInUser) throw new Error('Sign in was not completed.');
  return signedInUser;
}
function projectFromSimulator() {
  const p = bridge.getProject();
  bridge.validateProject(p);
  const bytes = new TextEncoder().encode(JSON.stringify(p)).length;
  if (bytes > 800000) throw new Error('This circuit is too large for one Firestore document. Try reducing the circuit or code size.');
  return p;
}
function projectTitleFallback(payload) {
  const board = bridge.getBoardName ? bridge.getBoardName() : (payload && payload.bt ? payload.bt : 'circuit');
  return `${board} circuit`;
}
function ensureCompetitionButton() {
  if (leaderboardBtn || !signInBtn || !signInBtn.parentElement) return;
  leaderboardBtn = document.createElement('button');
  leaderboardBtn.type = 'button';
  leaderboardBtn.id = 'vx-leaderboard';
  leaderboardBtn.className = signInBtn.className;
  leaderboardBtn.textContent = 'Leaderboard';
  leaderboardBtn.title = 'Open the VOLTIX Build Challenge leaderboard';
  leaderboardBtn.addEventListener('click', openLeaderboard);
  signInBtn.parentElement.insertBefore(leaderboardBtn, signInBtn);
}
const ACHIEVEMENTS=[
{id:'firstCircuit',name:'First Circuit',desc:'Save your first cloud project.',goal:1,metric:'projects'},
{id:'wireStarter',name:'Wire Starter',desc:'Create 5 saved wire connections.',goal:5,metric:'wires'},
{id:'wireArchitect',name:'Wire Architect',desc:'Reach 25 saved wire connections.',goal:25,metric:'wires'},
{id:'signalEngineer',name:'Signal Engineer',desc:'Reach 100 saved wire connections.',goal:100,metric:'wires'},
{id:'wiringSpecialist',name:'Wiring Specialist',desc:'Reach 250 saved wire connections.',goal:250,metric:'wires'},
{id:'codeAuthor',name:'Code Author',desc:'Save 50 non-empty code lines.',goal:50,metric:'codeLines'},
{id:'codeEngineer',name:'Code Engineer',desc:'Reach 250 non-empty code lines.',goal:250,metric:'codeLines'},
{id:'firmwareArchitect',name:'Firmware Architect',desc:'Reach 750 non-empty code lines.',goal:750,metric:'codeLines'},
{id:'embeddedVeteran',name:'Embedded Systems Veteran',desc:'Reach 1,500 non-empty code lines.',goal:1500,metric:'codeLines'},
{id:'componentCollector',name:'Component Collector',desc:'Use 20 components across saved projects.',goal:20,metric:'components'},
{id:'benchStock',name:'Bench Stock',desc:'Use 75 components across saved projects.',goal:75,metric:'components'},
{id:'labInventory',name:'Lab Inventory',desc:'Use 200 components across saved projects.',goal:200,metric:'components'},
{id:'sensorExplorer',name:'Sensor Explorer',desc:'Use 5 sensor modules across saved projects.',goal:5,metric:'sensors'},
{id:'sensorSpecialist',name:'Sensor Specialist',desc:'Use 15 sensor modules across saved projects.',goal:15,metric:'sensors'},
{id:'sensorArray',name:'Sensor Array',desc:'Use 30 sensor modules across saved projects.',goal:30,metric:'sensors'},
{id:'boardHopper',name:'Board Hopper',desc:'Save projects using 2 different board types.',goal:2,metric:'boards'},
{id:'crossPlatformBuilder',name:'Cross-Platform Builder',desc:'Experiment with 3 different board types.',goal:3,metric:'boards'},
{id:'universalTinkerer',name:'Universal Tinkerer',desc:'Experiment with 5 different board types.',goal:5,metric:'boards'},
{id:'prototypeMaker',name:'Prototype Maker',desc:'Save 3 projects with at least 5 components each.',goal:3,metric:'complexProjects'},
{id:'circuitArchitect',name:'Circuit Architect',desc:'Save 5 projects with at least 10 components each.',goal:5,metric:'advancedProjects'},
{id:'systemsEngineer',name:'Systems Engineer',desc:'Save 3 projects with at least 20 components each.',goal:3,metric:'expertProjects'},
{id:'wiringVeteran',name:'Wiring Veteran',desc:'Save 3 projects containing at least 10 wires each.',goal:3,metric:'wiredProjects10'},
{id:'harnessDesigner',name:'Harness Designer',desc:'Save 5 projects containing at least 25 wires each.',goal:5,metric:'wiredProjects25'},
{id:'firmwareSpecialist',name:'Firmware Specialist',desc:'Save 3 projects with at least 50 code lines each.',goal:3,metric:'codeProjects50'},
{id:'codebaseBuilder',name:'Codebase Builder',desc:'Save 5 projects with at least 150 code lines each.',goal:5,metric:'codeProjects150'},
{id:'integratedPrototype',name:'Integrated Prototype',desc:'Save one build with 10+ components, 20+ wires and 100+ code lines.',goal:1,metric:'integratedProjects'},
{id:'sensorFusion',name:'Sensor Fusion',desc:'Save 3 projects using at least 3 sensors each.',goal:3,metric:'sensorProjects'},
{id:'bigBuild',name:'Big Build',desc:'Put 30 or more components in a single saved project.',goal:30,metric:'peakComponents'},
{id:'denseWiring',name:'Dense Wiring',desc:'Create 75 or more wires in a single saved project.',goal:75,metric:'peakWires'},
{id:'marathonBuilder',name:'Marathon Builder',desc:'Save 25 cloud projects.',goal:25,metric:'projects'},
{id:'factoryFloor',name:'Factory Floor',desc:'Save 50 cloud projects.',goal:50,metric:'projects'},
{id:'achievementHunter',name:'Achievement Hunter',desc:'Unlock 20 other achievements.',goal:20,metric:'achievementPoints'}
];
function calculateBuilderStats(projectDocs){
 const projects=projectDocs.map(d=>d.data().payload||{}),
 allParts=projects.flatMap(p=>Array.isArray(p.parts)?p.parts:[]),
 allWires=projects.flatMap(p=>Array.isArray(p.wires)?p.wires:[]),
 boards=new Set(projects.map(p=>String(p.bt||'uno'))),
 codeCount=p=>typeof p.code==='string'?p.code.split('\\n').filter(x=>x.trim()).length:0,
 partsCount=p=>Array.isArray(p.parts)?p.parts.length:0,
 wiresCount=p=>Array.isArray(p.wires)?p.wires.length:0,
 sensorsCount=p=>(Array.isArray(p.parts)?p.parts:[]).filter(x=>/sensor|dht|hc.?sr04|ldr|pir|soil|mpu|gps|rfid|mq.?|max30|hx711|qmc|ds18|bmp|bme|ultra|therm|photoresistor|light/i.test(String(x.t||'')+' '+String(x.k||''))).length,
 codeLines=projects.reduce((n,p)=>n+codeCount(p),0),
 sensors=projects.reduce((n,p)=>n+sensorsCount(p),0),
 complexProjects=projects.filter(p=>partsCount(p)>=5).length,
 advancedProjects=projects.filter(p=>partsCount(p)>=10).length,
 expertProjects=projects.filter(p=>partsCount(p)>=20).length,
 wiredProjects10=projects.filter(p=>wiresCount(p)>=10).length,
 wiredProjects25=projects.filter(p=>wiresCount(p)>=25).length,
 codeProjects50=projects.filter(p=>codeCount(p)>=50).length,
 codeProjects150=projects.filter(p=>codeCount(p)>=150).length,
 integratedProjects=projects.filter(p=>partsCount(p)>=10&&wiresCount(p)>=20&&codeCount(p)>=100).length,
 sensorProjects=projects.filter(p=>sensorsCount(p)>=3).length,
 peakComponents=Math.max(0,...projects.map(partsCount)),
 peakWires=Math.max(0,...projects.map(wiresCount));
 const base={projects:projects.length,wires:allWires.length,codeLines,components:allParts.length,sensors,boards:boards.size,complexProjects,advancedProjects,expertProjects,wiredProjects10,wiredProjects25,codeProjects50,codeProjects150,integratedProjects,sensorProjects,peakComponents,peakWires};
 const unlocked=ACHIEVEMENTS.filter(a=>(base[a.metric]||0)>=a.goal).length;
 base.achievementPoints=unlocked;
 base.achievements=ACHIEVEMENTS.filter(a=>(base[a.metric]||0)>=a.goal).map(a=>a.id);
 base.totalScore=base.projects*100+base.wires*2+base.codeLines+base.components*3+base.sensors*10+base.boards*50+base.complexProjects*100+base.achievementPoints*75;
 return base;
}
async function syncCompetitionProfile(user){
 const projects=await getDocs(collection(db,'users',user.uid,'projects')),stats=calculateBuilderStats(projects.docs),profileRef=doc(db,'leaderboard',user.uid),old=await getDoc(profileRef),previous=old.exists()?old.data():{};
 await setDoc(profileRef,{uid:user.uid,displayName:user.displayName||previous.displayName||'VOLTIX Builder',photoURL:user.photoURL||previous.photoURL||'',bio:String(previous.bio||'').slice(0,180),projectCount:stats.projects,wireScore:stats.wires,codeScore:stats.codeLines,componentScore:stats.components,sensorScore:stats.sensors,boardScore:stats.boards,prototypeScore:stats.complexProjects,achievementPoints:stats.achievementPoints,totalScore:stats.totalScore,stats,achievements:stats.achievements,updatedAt:serverTimestamp()},{merge:true});
 return stats;
}

async function openLeaderboard(){
 const challenge=document.querySelector('#p-challenge'),sim=document.querySelector('#p-sim');
 if(typeof go==='function')go('challenge');
 if(window.VOLTIXLeaderboardRefresh)window.VOLTIXLeaderboardRefresh();
 if(!challenge&&sim)setStatus('Open Build Challenge from the top navigation to view all competition rankings.');
}
function askProjectDetails(defaultTitle,allowCopy=false){
 const modal=openModal('Save your project','Project names do not have to be unique. Reuse a name anytime; choose “Save as a new copy” to keep both projects.'),list=modal.querySelector('.vx-cloud-list');
 list.innerHTML=`<form class="vx-project-form"><label for="vx-project-title">PROJECT NAME</label><input id="vx-project-title" maxlength="120" required autocomplete="off" placeholder="e.g. Smart greenhouse controller"><small class="vx-project-name-note">Names can repeat. Use “Save as a new copy” to create another project with this same name.</small><div class="vx-project-preview"><span class="vx-preview-icon">⌘</span><div><b>VOLTIX circuit</b><small>Board, wiring, component settings and code</small></div><span class="vx-preview-live">READY TO SAVE</span></div>${allowCopy?'<label class="vx-copy-choice"><input id="vx-save-copy" type="checkbox"><span><b>Save as a new copy</b><small>Keep the current saved project unchanged.</small></span></label>':''}<div class="vx-project-actions"><button type="button" class="vx-secondary" data-project-cancel>Cancel</button><button type="submit" class="vx-primary">Save project</button></div></form>`;
 const input=list.querySelector('#vx-project-title');input.value=defaultTitle||'';
 return new Promise(resolve=>{const done=value=>{closeModal();resolve(value)};list.querySelector('[data-project-cancel]').addEventListener('click',()=>done(null));list.querySelector('form').addEventListener('submit',e=>{e.preventDefault();const title=input.value.trim().slice(0,120);if(!title){modalStatus('Enter a project name before saving.',true);input.focus();return}done({title,saveAsCopy:!!(list.querySelector('#vx-save-copy')&&list.querySelector('#vx-save-copy').checked)})});input.focus();input.select()});
}
function askShareConfirmation(title){
 const modal=openModal('Create a share link','Share a read-only link that opens a copy of this circuit.'),list=modal.querySelector('.vx-cloud-list');
 list.innerHTML=`<div class="vx-share-preview"><div class="vx-share-icon">↗</div><div><b></b><small>Anyone with the link can open the circuit and view its code.</small></div></div><div class="vx-share-notice"><span>i</span><p>Do not include passwords, private keys, or personal information in a public project. Your saved original remains in your account.</p></div><div class="vx-project-actions"><button type="button" class="vx-secondary" data-share-cancel>Cancel</button><button type="button" class="vx-primary" data-share-confirm>Create public link</button></div>`;
 list.querySelector('.vx-share-preview b').textContent=title||'VOLTIX project';
 return new Promise(resolve=>{list.querySelector('[data-share-cancel]').addEventListener('click',()=>{closeModal();resolve(false)});list.querySelector('[data-share-confirm]').addEventListener('click',()=>{closeModal();resolve(true)})});
}
function showShareLink(link){
 const modal=openModal('Your share link is ready','Anyone with this link can open a copy of your circuit.'),list=modal.querySelector('.vx-cloud-list');
 list.innerHTML=`<div class="vx-share-success"><span>✓</span><div><b>Project link created</b><small>Copy it and send it to your teammates.</small></div></div><label class="vx-link-label" for="vx-share-link">PUBLIC PROJECT LINK</label><div class="vx-link-row"><input id="vx-share-link" readonly><button type="button" class="vx-primary" data-copy-link>Copy link</button></div><div class="vx-project-actions"><button type="button" class="vx-secondary" data-share-done>Done</button></div>`;
 const input=list.querySelector('#vx-share-link');input.value=link;list.querySelector('[data-copy-link]').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(link);modalStatus('Copied! Your public share link is ready to send.')}catch{input.focus();input.select();modalStatus('Select the link and copy it with Ctrl+C (or ⌘C).')}});list.querySelector('[data-share-done]').addEventListener('click',closeModal);
}
function showSaveSuccess(saved){
 const modal=openModal('Project saved','Your circuit is now stored in your VOLTIX cloud projects.'),list=modal.querySelector('.vx-cloud-list');
 list.innerHTML=`<div class="vx-save-success"><span>✓</span><div><b class="vx-save-name"></b><small class="vx-save-meta"></small></div></div><div class="vx-save-summary"><span><b class="vx-save-parts"></b><small>Components</small></span><span><b class="vx-save-wires"></b><small>Wires</small></span><span><b class="vx-save-code"></b><small>Code lines</small></span></div><div class="vx-project-actions"><button type="button" class="vx-secondary" data-open-projects>My projects</button><button type="button" class="vx-primary" data-save-done>Done</button></div>`;
 list.querySelector('.vx-save-name').textContent=saved.title;list.querySelector('.vx-save-meta').textContent='Saved to your account · '+(saved.payload.bt||'Circuit');list.querySelector('.vx-save-parts').textContent=saved.payload.parts.length;list.querySelector('.vx-save-wires').textContent=saved.payload.wires.length;list.querySelector('.vx-save-code').textContent=saved.payload.code.split('\n').length;list.querySelector('[data-open-projects]').addEventListener('click',openCloudProjects);list.querySelector('[data-save-done]').addEventListener('click',closeModal);
}
async function openProfileSettings(){
 try{
  const user=await requireUser(),snap=await getDoc(doc(db,'leaderboard',user.uid)),profile=snap.exists()?snap.data():{},modal=openModal('Builder profile settings','Manage the public name and short bio shown on the VOLTIX Build Challenge leaderboard.'),list=modal.querySelector('.vx-cloud-list');
  list.innerHTML=`<div class="vx-settings-identity"><div class="vx-settings-avatar"></div><div><b class="vx-settings-account"></b><small>Profile photo is managed by your Google account.</small></div></div><form class="vx-project-form vx-profile-form"><label for="vx-public-name">PUBLIC DISPLAY NAME</label><input id="vx-public-name" maxlength="40" required><label for="vx-public-bio">BUILDER BIO</label><textarea id="vx-public-bio" maxlength="180" rows="3" placeholder="What are you building?"></textarea><small class="vx-profile-count">0 / 180 characters</small><div class="vx-project-actions"><button type="button" class="vx-secondary" data-profile-cancel>Cancel</button><button type="submit" class="vx-primary">Save profile</button></div></form>`;
  const avatar=list.querySelector('.vx-settings-avatar');if(user.photoURL){const img=document.createElement('img');img.src=user.photoURL;img.alt='';img.referrerPolicy='no-referrer';avatar.appendChild(img)}else avatar.textContent=(user.displayName||'V').trim().slice(0,1).toUpperCase();
  list.querySelector('.vx-settings-account').textContent=user.email||'Google account connected';const name=list.querySelector('#vx-public-name'),bio=list.querySelector('#vx-public-bio'),count=list.querySelector('.vx-profile-count');name.value=profile.displayName||user.displayName||'VOLTIX Builder';bio.value=profile.bio||'';const updateCount=()=>count.textContent=bio.value.length+' / 180 characters';bio.addEventListener('input',updateCount);updateCount();list.querySelector('[data-profile-cancel]').addEventListener('click',closeModal);
  list.querySelector('form').addEventListener('submit',async e=>{e.preventDefault();const displayName=name.value.trim().slice(0,40),cleanBio=bio.value.trim().slice(0,180);if(!displayName){modalStatus('Please enter a public display name.',true);name.focus();return}const submit=list.querySelector('[type=submit]');submit.disabled=true;submit.textContent='Saving…';try{await updateProfile(auth.currentUser,{displayName});const oldSnap=await getDoc(doc(db,'leaderboard',user.uid)),old=oldSnap.exists()?oldSnap.data():{},projects=await getDocs(collection(db,'users',user.uid,'projects'));await setDoc(doc(db,'leaderboard',user.uid),{uid:user.uid,displayName,photoURL:user.photoURL||old.photoURL||'',bio:cleanBio,projectCount:projects.size,updatedAt:serverTimestamp()},{merge:true});currentUser=auth.currentUser;renderAuth();closeModal();if(window.VOLTIXLeaderboardRefresh)window.VOLTIXLeaderboardRefresh();setStatus('Builder profile updated.')}catch(error){modalStatus(friendlyError(error),true);submit.disabled=false;submit.textContent='Save profile'}});
 }catch(error){showError(error);if(cloudModal)modalStatus(friendlyError(error),true)}
}

async function refreshLeaderboardSection(selectedBoard){
 const list=$vx('vx-leaderboard-list'),status=$vx('vx-challenge-status'),profileEl=$vx('vx-challenge-profile');if(!list||!status||!profileEl||!db)return;
 activeCompetitionBoard='overall';
 const board=COMPETITION_BOARDS[0];
 status.textContent='Loading overall builder rankings…';list.innerHTML='<div class="vx-leaderboard-loading"><span class="vx-loader"></span> Loading live rankings…</div>';
 try{
  let own={},stats={};if(currentUser){const ownSnap=await getDoc(doc(db,'leaderboard',currentUser.uid));if(ownSnap.exists())own=ownSnap.data();stats=own.stats||{};
   profileEl.innerHTML='<div class="vx-profile-avatar"></div><div class="vx-profile-main"><b class="vx-profile-name"></b><span class="vx-profile-email"></span><small class="vx-profile-bio"></small><small class="vx-profile-score"></small><small class="vx-profile-badges"></small></div><button id="vx-profile-settings" type="button">Edit profile</button>';
   const avatar=profileEl.querySelector('.vx-profile-avatar');if(currentUser.photoURL){const img=document.createElement('img');img.src=currentUser.photoURL;img.alt='';img.referrerPolicy='no-referrer';img.onerror=()=>{img.remove();avatar.textContent=(currentUser.displayName||'V').trim().slice(0,1).toUpperCase()};avatar.appendChild(img)}else avatar.textContent=(currentUser.displayName||'V').trim().slice(0,1).toUpperCase();
   profileEl.querySelector('.vx-profile-name').textContent=own.displayName||currentUser.displayName||'VOLTIX Builder';profileEl.querySelector('.vx-profile-email').textContent=currentUser.email||'Google account connected';profileEl.querySelector('.vx-profile-bio').textContent=own.bio||'Add a short bio in your profile settings.';profileEl.querySelector('.vx-profile-score').textContent=(stats.totalScore||0)+' builder points · '+(stats.projects||0)+' projects';profileEl.querySelector('.vx-profile-badges').textContent=(own.achievements||[]).length+' achievements unlocked';$vx('vx-profile-settings').addEventListener('click',openProfileSettings);
   const hero=$vx('vx-challenge-signin');if(hero){hero.textContent='Profile settings';hero.onclick=openProfileSettings}
  }else{
   profileEl.innerHTML='<div class="vx-profile-placeholder">V</div><div><b>Guest builder</b><span>Sign in to create your public profile and compete in the challenge boards.</span></div><button id="vx-challenge-profile-action" type="button">Sign in</button>';$vx('vx-challenge-profile-action').addEventListener('click',openLoginExperience);
   const hero=$vx('vx-challenge-signin');if(hero){hero.textContent='Sign in to join';hero.onclick=openLoginExperience}
  }
  const pointEl=$vx('vx-mission-points');if(pointEl)pointEl.textContent=String(stats.achievementPoints||0);
  const grid=$vx('vx-mission-grid');if(grid){grid.replaceChildren();ACHIEVEMENTS.forEach((a,i)=>{const score=Number(stats[a.metric])||0,done=score>=a.goal,card=document.createElement('article');card.className='vx-mission-card'+(done?' is-complete':'');const num=document.createElement('span');num.className='vx-mission-number';num.textContent=String(i+1).padStart(2,'0');const copy=document.createElement('div'),title=document.createElement('b'),desc=document.createElement('p'),progress=document.createElement('small');title.textContent=a.name;desc.textContent=a.desc;progress.className='vx-mission-progress';progress.textContent=Math.min(score,a.goal)+' / '+a.goal;copy.append(title,desc,progress);const state=document.createElement('span');state.className='vx-mission-state';state.textContent=done?'UNLOCKED':(currentUser?'IN PROGRESS':'SIGN IN');card.append(num,copy,state);grid.appendChild(card)})}
  const snap=await getDocs(collection(db,'leaderboard')),players=snap.docs.map(d=>{const p={uid:d.id,...d.data()},s=p.stats||{};p.totalScore=Number(p.totalScore)||((Number(s.projects||p.projectCount)||0)*100+(Number(s.wires||p.wireScore)||0)*2+(Number(s.codeLines||p.codeScore)||0)+(Number(s.components||p.componentScore)||0)*3+(Number(s.sensors||p.sensorScore)||0)*10+(Number(s.boards||p.boardScore)||0)*50+(Number(s.complexProjects||p.prototypeScore)||0)*100+(Number(s.achievementPoints||p.achievementPoints)||0)*75);return p;}).filter(p=>Number(p.totalScore)>0).sort((a,b)=>Number(b.totalScore)-Number(a.totalScore)).slice(0,50);
  list.replaceChildren();if(!players.length){list.innerHTML='<div class="vx-leaderboard-empty"><span>01</span><b>Be the first to compete</b><p>Save a project and make progress on this challenge board.</p></div>';status.textContent=board.label+' · Waiting for the first competitor';return}
  players.forEach((player,index)=>{const row=document.createElement('article');row.className='vx-leader-row'+(index<3?' vx-leader-podium':'');const rank=document.createElement('span');rank.className='vx-leader-rank';rank.textContent=String(index+1).padStart(2,'0');const avatar=document.createElement('div');avatar.className='vx-leader-avatar';if(player.photoURL){const img=document.createElement('img');img.src=player.photoURL;img.alt='';img.referrerPolicy='no-referrer';img.onerror=()=>{img.remove();avatar.textContent=(player.displayName||'V').trim().slice(0,1).toUpperCase()};avatar.appendChild(img)}else avatar.textContent=(player.displayName||'V').trim().slice(0,1).toUpperCase();const info=document.createElement('div');info.className='vx-leader-info';const name=document.createElement('b');name.textContent=player.displayName||'VOLTIX Builder';const sub=document.createElement('span');sub.textContent=player.bio||((player.achievements||[]).length+' achievements unlocked');info.append(name,sub);const score=document.createElement('div');score.className='vx-leader-score';const points=document.createElement('b');points.textContent=String(Number(player[board.field])||0);const label=document.createElement('span');label.textContent=board.unit.toUpperCase();score.append(points,label);row.append(rank,avatar,info,score);list.appendChild(row)});
  status.textContent=board.label+' · '+players.length+' ranked builder'+(players.length===1?'':'s')+' · Top 50';
 }catch(error){list.innerHTML='<div class="vx-leaderboard-empty"><b>Leaderboard temporarily unavailable</b><p></p></div>';list.querySelector('p').textContent=friendlyError(error);status.textContent='Could not load rankings.'}
}
const COMPETITION_BOARDS=[
{id:'overall',label:'Overall Builder',field:'totalScore',stat:'totalScore',unit:'builder points'}
];
let activeCompetitionBoard='overall';
window.VOLTIXLeaderboardRefresh=refreshLeaderboardSection;

async function saveCloudProject(options = {}) {
  const u = await requireUser();
  const payload = projectFromSimulator();
  let id = activeProjectId || storageGet(activeIdKey(u.uid));
  let prior = null;
  if (id) {
    try {
      const priorSnap = await getDoc(doc(db, 'users', u.uid, 'projects', id));
      if (priorSnap.exists()) prior = priorSnap.data();
      else id = null;
    } catch (error) {
      if (error.code === 'permission-denied') throw error;
      id = null;
    }
  }
  let title=activeProjectTitle||(prior&&prior.title)||storageGet(activeTitleKey(u.uid))||projectTitleFallback(payload);
  if(options.interactive!==false){const choice=await askProjectDetails(title,!!id);if(!choice)return null;title=choice.title;if(choice.saveAsCopy){id=null;prior=null}}
  else if(options.title)title=String(options.title).trim().slice(0,120);
  if(!title)throw new Error('Please enter a project name.');
  const ref = id ? doc(db, 'users', u.uid, 'projects', id) : doc(collection(db, 'users', u.uid, 'projects'));
  const record = {
    ownerUid: u.uid,
    title,
    payload,
    createdAt: (prior && prior.createdAt) || serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  await setDoc(ref, record);
  await syncCompetitionProfile(u);
  activeProjectId = ref.id;
  activeProjectTitle = title;
  storageSet(activeIdKey(u.uid), activeProjectId);
  storageSet(activeTitleKey(u.uid), activeProjectTitle);
  setStatus(`Saved “${title}” to your cloud projects.`);
  return { id: ref.id, title, payload };
}
function closeModal(result = null) {
  if (cloudModal) cloudModal.remove();
  if (result || currentUser) authGateActive = false;
  cloudModal = null;
  if (loginResolve) {
    const resolve = loginResolve;
    loginResolve = null;
    resolve(result);
  }
}
function openModal(title, description = '') {
  closeModal();
  const overlay = document.createElement('div');
  overlay.id = 'vx-cloud-modal';
  overlay.innerHTML = `<section class="vx-dialog" role="dialog" aria-modal="true" aria-labelledby="vx-cloud-heading"><div class="vx-dialog-head"><div><h2 id="vx-cloud-heading"></h2><p class="vx-cloud-description"></p></div><button class="vx-close" type="button" aria-label="Close">×</button></div><div class="vx-cloud-message" role="status" aria-live="polite"></div><div class="vx-cloud-list"></div></section>`;
  overlay.querySelector('#vx-cloud-heading').textContent = title;
  overlay.querySelector('.vx-cloud-description').textContent = description;
  overlay.querySelector('.vx-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', (event) => { if (event.target === overlay) closeModal(); });
  document.addEventListener('keydown', function esc(event) {
    if (event.key === 'Escape' && cloudModal === overlay) {
      closeModal(); document.removeEventListener('keydown', esc);
    }
  });
  document.body.appendChild(overlay);
  cloudModal = overlay;
  return overlay;
}
function modalStatus(message, bad = false) {
  if (!cloudModal) return;
  const el = cloudModal.querySelector('.vx-cloud-message');
  el.textContent = message;
  el.classList.toggle('bad', bad);
}
function makeButton(label, fn, className = '') {
  const button = document.createElement('button');
  button.type = 'button'; button.textContent = label;
  if (className) button.className = className;
  button.addEventListener('click', fn);
  return button;
}
async function openCloudProjects() {
  try {
    const u = await requireUser();
    const modal = openModal('My cloud projects', 'Saved to your VOLTIX account. Opening a project replaces the circuit currently on the canvas.');
    modalStatus('Loading your projects…');
    const list = modal.querySelector('.vx-cloud-list');
    const q = query(collection(db, 'users', u.uid, 'projects'), orderBy('updatedAt', 'desc'), limit(50));
    const result = await getDocs(q);
    if (cloudModal !== modal) return;
    list.replaceChildren();
    if (result.empty) {
      const empty = document.createElement('div');
      empty.className = 'vx-empty';
      empty.textContent = 'No cloud projects yet. Open the simulator and choose “Save to cloud”.';
      list.appendChild(empty);
      modalStatus('Cloud database connected. No saved projects found.');
      return;
    }
    for (const snap of result.docs) {
      const data = snap.data();
      const item = document.createElement('article'); item.className = 'vx-cloud-item';
      const main = document.createElement('div'); main.className = 'vx-cloud-item-main';
      const name = document.createElement('div'); name.className = 'vx-cloud-item-title'; name.textContent = data.title || 'Untitled project';
      const meta = document.createElement('div'); meta.className = 'vx-cloud-item-meta';
      const date = data.updatedAt && typeof data.updatedAt.toDate === 'function' ? data.updatedAt.toDate().toLocaleString() : 'Date unavailable';
      meta.textContent = `${data.payload && data.payload.bt ? data.payload.bt : 'board'} · Updated ${date}`;
      main.append(name, meta);
      const actions = document.createElement('div'); actions.className = 'vx-cloud-item-actions';
      actions.appendChild(makeButton('Open', async () => {
        try {
          if (!window.confirm('Open this cloud project? The circuit currently on your canvas will be replaced.')) return;
          bridge.applyProject(data.payload);
          activeProjectId = snap.id; activeProjectTitle = data.title || 'Untitled project';
          storageSet(activeIdKey(u.uid), activeProjectId); storageSet(activeTitleKey(u.uid), activeProjectTitle);
          closeModal(); setStatus(`Opened “${activeProjectTitle}”.`);
        } catch (error) { modalStatus(showError(error), true); }
      }));
      actions.appendChild(makeButton('Share', async () => {
        try { await createShareLink(data.payload, data.title || 'Untitled project'); }
        catch (error) { modalStatus(showError(error), true); }
      }));
      actions.appendChild(makeButton('Delete', async () => {
        if (!window.confirm(`Delete “${data.title || 'Untitled project'}” from your cloud account? This cannot be undone.`)) return;
        try {
          await deleteDoc(doc(db, 'users', u.uid, 'projects', snap.id));
          await syncCompetitionProfile(u);
          if(window.VOLTIXLeaderboardRefresh)window.VOLTIXLeaderboardRefresh();
          if (activeProjectId === snap.id) { activeProjectId = null; activeProjectTitle = ''; storageRemove(activeIdKey(u.uid)); storageRemove(activeTitleKey(u.uid)); }
          item.remove();
          if (!list.children.length) { const empty = document.createElement('div'); empty.className = 'vx-empty'; empty.textContent = 'No cloud projects left.'; list.appendChild(empty); }
          modalStatus('Project deleted from your cloud account.');
        } catch (error) { modalStatus(showError(error), true); }
      }, 'vx-danger'));
      item.append(main, actions); list.appendChild(item);
    }
    modalStatus(`Loaded ${result.size} project${result.size === 1 ? '' : 's'}.`);
  } catch (error) {
    showError(error);
    if (cloudModal) modalStatus(friendlyError(error), true);
  }
}
async function createShareLink(payload,title){
 const u=await requireUser();if(!await askShareConfirmation(title))return null;
  bridge.validateProject(payload);
  const bytes = new TextEncoder().encode(JSON.stringify(payload)).length;
  if (bytes > 800000) throw new Error('This circuit is too large to share in one Firestore document.');
  const ref = doc(collection(db, 'sharedProjects'));
  await setDoc(ref, {
    ownerUid: u.uid,
    title: String(title || 'VOLTIX project').slice(0, 120),
    visibility: 'public',
    payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  const link = new URL(window.location.href);
  link.searchParams.set('share', ref.id);
  link.hash = 'sim';
  setStatus('Public share link created.');showShareLink(link.toString());return link.toString();
}
async function shareCurrentProject(){try{const saved=await saveCloudProject({interactive:true});if(!saved)return;const link=await createShareLink(saved.payload,saved.title);if(link)setStatus('Public share link created.')}catch(error){showError(error);if(cloudModal)modalStatus(friendlyError(error),true)}}
async function loadSharedProjectFromUrl() {
  const shareId = new URLSearchParams(window.location.search).get('share');
  if (!shareId) return;
  try {
    setStatus('Loading shared circuit…');
    const snap = await getDoc(doc(db, 'sharedProjects', shareId));
    if (!snap.exists()) throw new Error('This share link was not found, or its owner removed access.');
    const data = snap.data();
    if (data.visibility !== 'public') throw new Error('This project is not publicly shared. Ask its owner for an accessible link.');
    if (!window.confirm(`Open the shared project “${data.title || 'VOLTIX project'}”? It will replace the circuit currently on your canvas.`)) {
      setStatus('Shared project was not opened. Your current circuit was kept.');
      return;
    }
    bridge.applyProject(data.payload);
    activeProjectId = null; activeProjectTitle = '';
    if (currentUser) {
      storageRemove(activeIdKey(currentUser.uid)); storageRemove(activeTitleKey(currentUser.uid));
    }
    setStatus(`Opened shared project “${data.title || 'VOLTIX project'}” as a local copy. Save it to your account to keep your own copy.`);
  } catch (error) {
    showError(error);
  }
}


function openLoginExperience(required = false) {
  if (currentUser) return Promise.resolve(currentUser);
  authGateActive = required || authGateActive;
  closeModal();
  return new Promise(resolve => {
  loginResolve = resolve;
  const overlay = document.createElement('div');
  overlay.id = 'vx-cloud-modal';
  if (authGateActive) overlay.classList.add('vx-required-login');
  overlay.innerHTML = `<section class="vx-dialog vx-login-dialog" role="dialog" aria-modal="true" aria-labelledby="vx-login-heading">
    <button class="vx-close" type="button" aria-label="Close sign-in">×</button>
    <div class="vx-login-brand">
      <div class="vx-login-brand-top"><span class="vx-login-mark">V</span><span>VOLTIX<span class="vx-brand-dot">.</span></span></div>
      <div class="vx-login-visual" aria-hidden="true">
        <div class="vx-orbit vx-orbit-one"></div><div class="vx-orbit vx-orbit-two"></div>
        <svg viewBox="0 0 220 160"><defs><linearGradient id="vx-login-line" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#a99aff"/></linearGradient></defs><path d="M25 80H65L85 42H122L145 80H195M85 42V18M122 42V18M145 80V122H185" fill="none" stroke="url(#vx-login-line)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="25" cy="80" r="5" fill="#22d3ee"/><circle cx="85" cy="42" r="5" fill="#a99aff"/><circle cx="122" cy="42" r="5" fill="#22d3ee"/><circle cx="145" cy="80" r="5" fill="#a99aff"/><circle cx="185" cy="122" r="5" fill="#22d3ee"/><rect x="72" y="62" width="55" height="36" rx="8" fill="#161e4c" stroke="#6265b8"/><path d="M91 80h17m-8-8v16" stroke="#e8e8ff" stroke-width="2" stroke-linecap="round"/></svg>
      </div>
      <div class="vx-login-brand-copy"><p class="vx-login-eyebrow">YOUR IDEAS, CONNECTED</p><h3>Build something<br><span>brilliant.</span></h3><p>Pick up where inspiration strikes. Your circuits and projects, all in one workspace.</p></div>
      <div class="vx-login-brand-foot"><span class="vx-status-dot"></span> Your personal electronics workspace</div>
    </div>
    <div class="vx-login-form">
      <div class="vx-login-mobile-mark"><span class="vx-login-mark">V</span><b>VOLTIX<span class="vx-brand-dot">.</span></b></div>
      <p class="vx-login-eyebrow">WELCOME BACK</p>
      <h2 id="vx-login-heading">Sign in to your workspace</h2>
      <p class="vx-login-copy">Access your saved circuits and continue building.</p>
      <button class="vx-google-login" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.52h3.24c1.9-1.75 2.98-4.33 2.98-7.37Z"/><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.4l-3.24-2.52c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.75-5.6-4.1H3.05v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 13.94a6 6 0 0 1 0-3.88v-2.6H3.05a10 10 0 0 0 0 9.08l3.35-2.6Z"/><path fill="#EA4335" d="M12 5.96c1.47 0 2.79.5 3.83 1.52l2.87-2.87C16.96 3.02 14.7 2 12 2a10 10 0 0 0-8.95 5.46l3.35 2.6c.8-2.35 3-4.1 5.6-4.1Z"/></svg><span>Continue with Google</span><span class="vx-login-arrow">→</span></button>
      <div class="vx-login-divider"><span>QUICK AND SECURE</span></div>
      <div class="vx-login-benefits"><div><span class="vx-benefit-icon">✓</span><span><b>Your projects, anywhere</b><small>Save and open your circuits across devices.</small></span></div><div><span class="vx-benefit-icon">↗</span><span><b>Share your work</b><small>Send a project link to your teammates.</small></span></div></div>
      <div class="vx-cloud-message" role="status" aria-live="polite">No password to remember. Google handles sign-in securely.</div>
      <p class="vx-login-terms">Sign in with your Google account to continue. Your email is used for account identity; VOLTIX does not access your inbox.</p>
    </div>
  </section>`;
  const close = (user = null) => { if (authGateActive && !currentUser && !user) return; if (cloudModal === overlay) closeModal(user); };
  overlay.querySelector('.vx-close').addEventListener('click', close);
  if (authGateActive) overlay.querySelector('.vx-close').hidden = true;
  overlay.addEventListener('click', event => { if (event.target === overlay && !authGateActive) close(); });
  const onKey = event => { if (event.key === 'Escape' && cloudModal === overlay && !authGateActive) { closeModal(); document.removeEventListener('keydown', onKey); } };
  document.addEventListener('keydown', onKey);
  overlay.querySelector('.vx-google-login').addEventListener('click', async event => {
    const button = event.currentTarget;
    button.disabled = true;
    button.querySelector('span:nth-of-type(1)').textContent = 'Connecting to Google…';
    const msg = overlay.querySelector('.vx-cloud-message');
    msg.textContent = 'Waiting for Google sign-in…';
    msg.classList.remove('bad');
    const user = await signIn();
    if (user) { document.removeEventListener('keydown', onKey); close(user); }
    else {
      button.disabled = false;
      button.querySelector('span:nth-of-type(1)').textContent = 'Try Google sign-in again';
      msg.textContent = authLabel.textContent || 'Sign-in did not finish. Please try again.';
      msg.classList.add('bad');
    }
  });
  document.body.appendChild(overlay);
  cloudModal = overlay;
  requestAnimationFrame(() => overlay.querySelector('.vx-google-login').focus());
  });
}

signInBtn.addEventListener('click', async () => {
  if (!currentUser) { openLoginExperience(); return; }
  try {
    await signOut(auth);
    currentUser = null; activeProjectId = null; activeProjectTitle = '';
    renderAuth(); setStatus('Signed out. Browser-local saving is still available.');
  } catch (error) { showError(error); }
});
saveBtn.addEventListener('click',async()=>{saveBtn.disabled=true;try{const saved=await saveCloudProject({interactive:true});if(saved){if(window.VOLTIXLeaderboardRefresh)window.VOLTIXLeaderboardRefresh();showSaveSuccess(saved)}}catch(error){showError(error);if(cloudModal)modalStatus(friendlyError(error),true)}finally{saveBtn.disabled=false}});
projectsBtn.addEventListener('click', openCloudProjects);
const challengeNav=$vx('vx-open-leaderboard');if(challengeNav)challengeNav.addEventListener('click',()=>{if(window.VOLTIXLeaderboardRefresh)window.VOLTIXLeaderboardRefresh()});
const challengeProfileAction=$vx('vx-challenge-profile-action'),challengeRefresh=$vx('vx-leaderboard-refresh');
if(challengeProfileAction)challengeProfileAction.addEventListener('click',openLoginExperience);if(challengeRefresh)challengeRefresh.addEventListener('click',refreshLeaderboardSection);

shareBtn.addEventListener('click', shareCurrentProject);

try {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  onAuthStateChanged(auth, (u) => {
    currentUser = u;
    if (u) {
      document.body.classList.add('vx-authenticated');
      authGateActive = false;
      if (cloudModal && cloudModal.classList.contains('vx-required-login')) closeModal(u);
      startPresence(u);
    } else {
      document.body.classList.remove('vx-authenticated');
      stopPresence();
    }
    if (u) {
      activeProjectId = activeProjectId || storageGet(activeIdKey(u.uid));
      activeProjectTitle = activeProjectTitle || storageGet(activeTitleKey(u.uid)) || '';
    } else {
      activeProjectId = null; activeProjectTitle = '';
    }
    renderAuth();
    if (u) syncCompetitionProfile(u).then(refreshLeaderboardSection).catch(() => refreshLeaderboardSection());
    else { refreshLeaderboardSection(); openLoginExperience(true); }
  }, (error) => showError(error));
  setStatus('Firebase initialized. Sign in to use cloud projects.');
  loadSharedProjectFromUrl();
} catch (error) {
  showError(error);
}
