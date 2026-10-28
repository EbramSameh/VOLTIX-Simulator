# VOLTIX Simulator — Architecture Baseline

> Audit date: 2026-10-28. This document describes the repository as it exists before the solver refactor. It is intentionally a baseline, not a claim that the proposed target architecture is already implemented.

## Runtime and deployment

- Static GitHub Pages site: `index.html` is the entry point. There is no build step or server-side application.
- Browser JavaScript is currently loaded as ordered classic scripts, not ES modules. Later scripts depend on globals declared by the inline engine or earlier scripts.
- Firebase Authentication / Firestore is integrated in the browser. `firestore.rules` is a deployment artifact; editing it in GitHub does not itself publish those rules to Firebase.
- Three.js and other browser libraries are loaded by the page as needed. The virtual gateway is not a bridge to physical hardware.

## Existing repository files

### Root and repository automation

| Path | Responsibility |
|---|---|
| `index.html` | Main markup, SVG circuit workspace, board/component catalogs, application state, circuit solve loop, electrical approximations, Arduino-style code runner, and ordered script references. This is still the largest and most tightly coupled file. |
| `README.md` | Short project overview. |
| `CODE_STRUCTURE.md` | Earlier map of the feature-oriented files and script-order constraints. |
| `firestore.rules` | Firestore security rules intended for deployment to Firebase. |
| `.github/workflows/validate.yml` | GitHub Actions checks JavaScript syntax, inline engine syntax, local asset references, and duplicate HTML IDs. |

### Stylesheets

| Path | Responsibility |
|---|---|
| `assets/css/voltix.css` | Earlier general VOLTIX styling. |
| `assets/css/voltix-core.css` | Base layout and theme. |
| `assets/css/voltix-components.css` | Component and feature styles. |
| `assets/css/voltix-studio-refresh.css` | Studio/workspace visual refresh. |
| `assets/css/voltix-v2.css` | Editor and newer interface overrides. |
| `assets/css/voltix-workflow.css` | Guided workflow component. |
| `assets/css/voltix-minimal-modern.css` | Latest professional UI refinement layer. Stylesheets intentionally cascade in the order declared in `index.html`. |

### JavaScript files

| Path | Responsibility |
|---|---|
| `assets/js/02-app-router-and-catalogs.js` | Page router, component catalog UI, board/component navigation, creator signature and page initialization. |
| `assets/js/03-code-editor.js` | Editor highlighting, autocomplete, variable/type hints and typo-oriented lint helpers. |
| `assets/js/04-component-menu-and-wiring.js` | Component palette, pin-role labels, add-part and wiring interactions. |
| `assets/js/05-raspberry-pi-targets.js` | Raspberry Pi and embedded AI target/model suitability helpers. |
| `assets/js/06-3d-view.js` | Three.js workspace and 3D representations. |
| `assets/js/07-pin-rendering.js` | Board/component pin drawing and pin interactions. |
| `assets/js/08-wire-rendering.js` | Wire rendering. |
| `assets/js/09-project-manager.js` | Project management UI. |
| `assets/js/10-circuit-diagnostics.js` | Rule-oriented wiring/connection diagnostics and wiring helper. |
| `assets/js/11-wiring-assistant.js` | Board-aware component and wiring knowledge/help. |
| `assets/js/12-model-knowledge-base.js` | Component/wiring explanations and knowledge rules. |
| `assets/js/13-board-catalog.js` | Board catalog and board metadata. |
| `assets/js/14-component-specifications.js` | Component specifications and per-part defaults/metadata. |
| `assets/js/15-board-expansion.js` | Additional board and component support. |
| `assets/js/16-wire-routing.js` | Wire routing and layout. |
| `assets/js/17-responsive-layout.js` | Responsive layout behavior. |
| `assets/js/17-workspace-enhancements.js` | Workspace interactions and enhancements. |
| `assets/js/18-firebase-bridge.js` | Firebase-related bridge/UI integration. |
| `assets/js/18-responsive-layout.js` | Additional responsive controls; the numbering overlap with `17-workspace-enhancements.js` is historical. |
| `assets/js/19-firebase-bridge.js` | Additional Firebase bridge compatibility layer. |
| `assets/js/20-firebase-client.js` | Firebase client, authentication, cloud projects, sharing, profiles/competition data. |
| `assets/js/21-guide-and-polish.js` | In-app guide and help content. |
| `assets/js/22-studio-controls.js` | Studio controls and UI behavior. |
| `assets/js/23-hardware-realism-and-theme.js` | Additional part pinouts and theme persistence. |
| `assets/js/24-guided-workflow.js` | Four-step workflow checklist and AI/Pi path. |
| `assets/voltix-brand.svg` | Brand artwork. |
| `assets/voltix-icon.svg` | Icon artwork. |

## Current circuit data model

The inline engine owns the main mutable state:

- `S`: selected board (`bt`), placed `parts`, `wires`, workspace coordinates, selected part and pending wire.
- `H`: simulated GPIO modes/values, timers, serial/network-related runtime state, and run token/speed.
- `BD`: board definitions, logic voltage, pin sets, ADC range and board capabilities.
- `PT`: component catalog entries. A typical entry is `[display name, category, icon, pin-label string, behavior/model key, optional color/variant]`.
- `PD`, `AN`, `SUPK` and related catalogs: part defaults/specifications, analog/behavior metadata, and model-status labels. `SUPK` currently explicitly marks a small set as Full; other entries may be Partial or Visual based on model metadata.

Pins are identified by strings such as `b:D13` for a board pin and `p3:A` for a component pin. Wires union these endpoint identifiers into electrical nets. Switches/buttons and relay contacts can also union pins when their state is closed.

## How the existing solver works

The current engine is a hybrid educational model, not a general SPICE solver:

1. `solve()` builds a union-find structure from wires and closed contacts. It collects ideal voltage drivers from board power pins, GPIO state, batteries, Pi pins and selected modeled outputs. It identifies conflicts/shorts and derives net voltages for that simplified model.
2. `mna(dt)` creates a narrower conductance network from supported passive parts. The current resistor/fuse branch is stamped as conductance; LEDs and diodes use a piecewise-linear forward-drop approximation; capacitors are currently represented by a conductance based on `C/dt` and a stored voltage-like state. Other parts are handled by separate per-part behavior code or modeled outputs rather than a unified device stamping interface.
3. `mnaSolve(known, res, leds)` builds a dense conductance matrix for unknown nets. It adds a small diagonal conductance (`1e-9` in the current implementation), solves it using `gauss(A,b)`, and iterates the LED on/off state. `gauss` uses maximum-magnitude row pivot selection and returns `null` for a near-zero pivot. It does not report a named floating node.
4. `tick(now)` calls `solve()` and `mna(dt)` repeatedly and updates visuals, component state, measurements, diagnostics and failure effects. This is animation-frame/time-delta driven; it is not a converged Newton-Raphson transient solver with adaptive retry.
5. Because source handling, union-find nets, passive MNA, and per-device animations live in separate paths, electrical interactions are not yet unified. AC analysis, full nonlinear device models, and a general MNA branch-current formulation are not present in this baseline.

## Current Arduino-style code runner

- `mkAPI()` exposes a hand-written JavaScript API object for supported board constants, GPIO, ADC/PWM, timing, Serial, Servo, Wire and several library stubs.
- `tx(source)` uses regular-expression substitutions to convert a subset of Arduino C++ syntax into JavaScript. It strips includes, maps `#define`, converts declarations and functions, and inserts `await` around delay and selected library calls.
- `runSim()` passes the translated source to `new Function(...apiNames, ...)`, calls `setup()` once, and repeatedly calls `loop()` while the run token remains active. `delay()` is currently based on wall-clock `setTimeout`, scaled by the speed setting, rather than a deterministic simulated clock.
- This is a practical supported subset, not a C++ parser/compiler. Generator-based scheduling, a statement debugger, full language coverage, and solver-coupled pin output resistance are not implemented in the baseline.

## Other systems and current limitations

- The Diagnostics tab and wiring assistant use rule-based checks/knowledge; they are not yet a unified electrical netlist linter backed by a solver result contract.
- The AI Lab includes browser webcam processing and a supported TensorFlow.js GraphModel path. It does not emulate Raspberry Pi OS or execute arbitrary Pi programs.
- Component rendering and component electrical behavior are separate concerns. A realistic SVG/3D drawing does not imply a full electrical model.
- The current app has no general AC/Bode analysis tab, universal scope, multimeter probe model, solver Web Worker, or modular `src/engine` API.
- UI assets and Firebase features are already integrated; this upgrade should preserve their DOM IDs, global contracts and existing behavior while modules are introduced incrementally.

## Refactor constraints

1. Keep the current public page and global contracts operational while extracting code.
2. Introduce ES modules behind explicit APIs; avoid converting the entire page at once.
3. Give each solver change an analytic regression test and report the real output.
4. Label each part honestly as Full, Partial or Visual based on implemented behavior, not its drawing.
5. Do not describe tests as passing unless they execute the actual implementation being claimed.
