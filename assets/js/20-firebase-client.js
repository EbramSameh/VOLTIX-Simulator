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
    signInBtn.textContent = 'Sign in with Google';
    signInBtn.title = 'Sign in to save and open cloud projects';
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
  const signedInUser = await signIn();
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
  activeProjectId = ref.id;
  activeProjectTitle = title;
  storageSet(activeIdKey(u.uid), activeProjectId);
  storageSet(activeTitleKey(u.uid), activeProjectTitle);
  setStatus(`Saved “${title}” to your cloud projects.`);
  return { id: ref.id, title, payload };
}
function closeModal() {
  if (cloudModal) cloudModal.remove();
  cloudModal = null;
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

signInBtn.addEventListener('click', async () => {
  if (!currentUser) { await signIn(); return; }
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
  setStatus('Firebase initialized. Sign in to use cloud projects.');
  loadSharedProjectFromUrl();
} catch (error) {
  showError(error);
}
