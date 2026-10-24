/* Firebase authentication and Firestore client integration. */

import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js';
import {
  getFirestore, collection, doc, getDoc, getDocs, setDoc, deleteDoc,
  serverTimestamp, query, orderBy, limit
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
  if (code === 'permission-denied' || code === 'firestore/permission-denied') return 'Firestore denied this request. Check the published security rules in firestore.rules.';
  if (code === 'auth/invalid-api-key' || code === 'app/invalid-api-key') return 'Firebase rejected the web API key. Recheck the web app configuration in Project settings.';
  return (error && error.message) ? error.message : 'An unexpected Firebase error occurred.';
}
function showError(error) {
  const msg = friendlyError(error);
  setStatus(msg, true);
  console.error('[VOLTIX Firebase]', error);
  return msg;
}
function renderAuth() {
  if (currentUser) {
    const label = currentUser.displayName || currentUser.email || 'Signed in';
    signInBtn.textContent = 'Sign out';
    signInBtn.title = `Signed in as ${label}. Click to sign out.`;
    authLabel.textContent = `Signed in: ${label}`;
    authLabel.classList.remove('bad');
  } else {
    signInBtn.textContent = 'Sign in';
    signInBtn.title = 'Sign in securely with Google to save and share projects';
    authLabel.textContent = 'Not signed in';
    authLabel.classList.remove('bad');
  }
}
async function signIn() {
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
async function updateCompetitionProfile(user, projectCount) {
  const profileRef = doc(db, 'leaderboard', user.uid);
  const old = await getDoc(profileRef);
  const previous = old.exists() ? old.data() : {};
  await setDoc(profileRef, {
    uid: user.uid,
    displayName: user.displayName || 'VOLTIX Builder',
    photoURL: user.photoURL || '',
    projectCount: Math.max(Number(previous.projectCount) || 0, projectCount || 0),
    updatedAt: serverTimestamp()
  }, { merge: true });
}
async function openLeaderboard() {
  try {
    await requireUser();
    const modal = openModal('VOLTIX Build Challenge', 'Earn points by creating and saving unique cloud projects. One point per project; updating a project does not add points.');
    modalStatus('Loading live rankings…');
    const list = modal.querySelector('.vx-cloud-list');
    const q = query(collection(db, 'leaderboard'), orderBy('projectCount', 'desc'), limit(50));
    const result = await getDocs(q);
    if (cloudModal !== modal) return;
    list.replaceChildren();
    if (result.empty) {
      const empty = document.createElement('div');
      empty.className = 'vx-empty';
      empty.textContent = 'The competition starts with the first saved cloud project. Save a circuit to enter the leaderboard.';
      list.appendChild(empty);
      modalStatus('No players ranked yet. Be the first builder!');
      return;
    }
    result.docs.forEach((snap, index) => {
      const player = snap.data();
      const item = document.createElement('article');
      item.className = 'vx-rank-row' + (index < 3 ? ' vx-rank-top' : '');
      const rank = document.createElement('div');
      rank.className = 'vx-rank-number';
      rank.textContent = String(index + 1).padStart(2, '0');
      const avatar = document.createElement('img');
      avatar.className = 'vx-rank-avatar';
      avatar.alt = '';
      avatar.src = player.photoURL || '';
      avatar.referrerPolicy = 'no-referrer';
      avatar.onerror = () => { avatar.style.display = 'none'; };
      const name = document.createElement('div');
      name.className = 'vx-rank-name';
      name.textContent = player.displayName || 'VOLTIX Builder';
      const caption = document.createElement('div');
      caption.className = 'vx-rank-caption';
      caption.textContent = 'Cloud projects created';
      const score = document.createElement('div');
      score.className = 'vx-rank-score';
      score.textContent = String(Number(player.projectCount) || 0) + ' pts';
      const details = document.createElement('div');
      details.className = 'vx-rank-player';
      details.append(name, caption);
      item.append(rank, avatar, details, score);
      list.appendChild(item);
    });
    modalStatus('Live account data · Ranked by unique cloud projects · Top 50');
  } catch (error) {
    showError(error);
    if (cloudModal) modalStatus(friendlyError(error), true);
  }
}
async function saveCloudProject() {
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
  let title = activeProjectTitle || (prior && prior.title) || storageGet(activeTitleKey(u.uid)) || '';
  if (!id || !title) {
    const entered = window.prompt('Name this VOLTIX project:', title || projectTitleFallback(payload));
    if (entered === null) return null;
    title = entered.trim().slice(0, 120);
    if (!title) throw new Error('Please enter a project name.');
  }
  const ref = id ? doc(db, 'users', u.uid, 'projects', id) : doc(collection(db, 'users', u.uid, 'projects'));
  const record = {
    ownerUid: u.uid,
    title,
    payload,
    createdAt: (prior && prior.createdAt) || serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  await setDoc(ref, record);
  if (!prior) {
    const leaderboardRef = doc(db, 'leaderboard', u.uid);
    const leaderboardSnap = await getDoc(leaderboardRef);
    const leaderboardData = leaderboardSnap.exists() ? leaderboardSnap.data() : {};
    await setDoc(leaderboardRef, {
      uid: u.uid,
      displayName: u.displayName || 'VOLTIX Builder',
      photoURL: u.photoURL || '',
      projectCount: (Number(leaderboardData.projectCount) || 0) + 1,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } else {
    await updateCompetitionProfile(u, Number((await getDoc(doc(db, 'leaderboard', u.uid))).data()?.projectCount) || 0);
  }
  activeProjectId = ref.id;
  activeProjectTitle = title;
  storageSet(activeIdKey(u.uid), activeProjectId);
  storageSet(activeTitleKey(u.uid), activeProjectTitle);
  setStatus(`Saved “${title}” to your cloud projects.`);
  return { id: ref.id, title, payload };
}
function closeModal(result = null) {
  if (cloudModal) cloudModal.remove();
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
async function createShareLink(payload, title) {
  const u = await requireUser();
  if (!window.confirm('Anyone who has this link will be able to open a copy of this circuit, including its code. Do not share private information in the project. Create a public link?')) return null;
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
  try {
    await navigator.clipboard.writeText(link.toString());
    setStatus('Public share link copied to clipboard. Anyone with the link can open this circuit.');
    if (cloudModal) modalStatus('Public share link copied to clipboard. Anyone with the link can open the circuit.');
  } catch {
    window.prompt('Copy this public project link:', link.toString());
    setStatus('Share link created. Copy it from the dialog to send it to others.');
  }
  return link.toString();
}
async function shareCurrentProject() {
  try {
    const saved = await saveCloudProject();
    if (!saved) return;
    await createShareLink(saved.payload, saved.title);
  } catch (error) {
    showError(error);
  }
}
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


function openLoginExperience() {
  if (currentUser) return Promise.resolve(currentUser);
  closeModal();
  return new Promise(resolve => {
  loginResolve = resolve;
  const overlay = document.createElement('div');
  overlay.id = 'vx-cloud-modal';
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
      <p class="vx-login-terms">By continuing, you agree to use VOLTIX responsibly. <br/>You can explore the simulator without an account.</p>
    </div>
  </section>`;
  const close = (user = null) => { if (cloudModal === overlay) closeModal(user); };
  overlay.querySelector('.vx-close').addEventListener('click', close);
  overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
  const onKey = event => { if (event.key === 'Escape' && cloudModal === overlay) { closeModal(); document.removeEventListener('keydown', onKey); } };
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
saveBtn.addEventListener('click', async () => {
  saveBtn.disabled = true;
  try { const saved = await saveCloudProject(); if (saved) bridge.notify(`Saved “${saved.title}” to your cloud projects.`); }
  catch (error) { showError(error); bridge.notify(friendlyError(error), true); }
  finally { saveBtn.disabled = false; }
});
projectsBtn.addEventListener('click', openCloudProjects);
const challengeNav = $vx('vx-open-leaderboard');
if (challengeNav) challengeNav.addEventListener('click', openLeaderboard);
shareBtn.addEventListener('click', shareCurrentProject);

try {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  onAuthStateChanged(auth, (u) => {
    currentUser = u;
    if (u) {
      activeProjectId = activeProjectId || storageGet(activeIdKey(u.uid));
      activeProjectTitle = activeProjectTitle || storageGet(activeTitleKey(u.uid)) || '';
    } else {
      activeProjectId = null; activeProjectTitle = '';
    }
    renderAuth();
  }, (error) => showError(error));
  ensureCompetitionButton();
  setStatus('Firebase initialized. Sign in to use cloud projects.');
  loadSharedProjectFromUrl();
} catch (error) {
  showError(error);
}
