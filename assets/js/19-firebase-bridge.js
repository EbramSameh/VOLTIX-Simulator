/* Bridge between simulator state and Firebase client. */

// Bridge between the existing simulator state and the separate Firebase module.
// Keeping this adapter separate preserves the simulator's original local autosave.
window.VOLTIXFirebaseBridge = {
  getBoardName() { return BD[S.bt] ? BD[S.bt][0] : 'Circuit'; },
  getProject() {
    return JSON.parse(JSON.stringify({
      schemaVersion: 1,
      bt: S.bt,
      parts: S.parts,
      wires: S.wires,
      bx: S.bx,
      by: S.by,
      n: S.n,
      code: $('#code').value
    }));
  },
  validateProject(p) {
    if (!p || typeof p !== 'object' || !BD[p.bt]) throw new Error('This project has an unknown board type.');
    if (!Array.isArray(p.parts) || !Array.isArray(p.wires)) throw new Error('This project is missing its parts or wires list.');
    if (p.parts.length > 500 || p.wires.length > 2000) throw new Error('This project is larger than the simulator safety limits.');
    if (typeof p.code !== 'string') p.code = '';
    for (const part of p.parts) {
      if (!part || typeof part.id !== 'string' || !PT[part.t] || !part.st || typeof part.st !== 'object' || !Number.isFinite(Number(part.x)) || !Number.isFinite(Number(part.y))) {
        throw new Error('This project contains a component the simulator cannot load.');
      }
    }
    for (const wire of p.wires) {
      if (!wire || typeof wire.a !== 'string' || typeof wire.b !== 'string' || typeof wire.c !== 'string') {
        throw new Error('This project contains a wire the simulator cannot load.');
      }
    }
    return p;
  },
  applyProject(project) {
    const p = this.validateProject(project);
    stop();
    Object.assign(S, {
      bt: p.bt,
      parts: JSON.parse(JSON.stringify(p.parts)),
      wires: JSON.parse(JSON.stringify(p.wires)),
      bx: Number.isFinite(Number(p.bx)) ? Number(p.bx) : 30,
      by: Number.isFinite(Number(p.by)) ? Number(p.by) : 40,
      n: Number.isFinite(Number(p.n)) ? Number(p.n) : p.parts.length,
      sel: null,
      pend: null
    });
    layout();
    $('#bd').value = S.bt;
    $('#code').value = p.code || '';
    draw();
    tab('code');
    lnu();
    fit();
    go('sim');
    return true;
  },
  notify(message, bad = false) { toast(message, bad ? 1 : 0); }
};
window.setTimeout(() => {
  const label = document.getElementById('vx-auth-label');
  if (label && label.textContent === 'Starting cloud tools…') {
    label.textContent = 'Firebase SDK did not start. Check the connection and reload.';
    label.classList.add('bad');
  }
}, 12000);
