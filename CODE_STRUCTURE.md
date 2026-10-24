# VOLTIX Simulator — code structure

The original page has been split into smaller feature-oriented files. The script order in `index.html` is intentional: later modules depend on globals created by earlier modules.

## Entry point
- `index.html` — metadata, markup, the core simulator engine, and ordered asset references.

## Stylesheets
- `assets/css/voltix-core.css` — original base theme and layout styles.
- `assets/css/voltix-components.css` — component and feature overrides, preserving original cascade order.

## JavaScript modules
- `assets/js/02-app-router-and-catalogs.js` — application router, creator signature, and page navigation.
- `assets/js/03-code-editor.js` — code editor, autocomplete, syntax highlighting, and lint helpers.
- `assets/js/04-component-menu-and-wiring.js` — component palette and wiring interactions.
- `assets/js/05-raspberry-pi-targets.js` — Raspberry Pi, ESP32-CAM, and AI target support.
- `assets/js/06-3d-view.js` — Three.js 3D workspace.
- `assets/js/07-pin-rendering.js` and `08-wire-rendering.js` — pin and wire rendering.
- `assets/js/09-project-manager.js` — project management UI.
- `assets/js/10-circuit-diagnostics.js` — circuit diagnostics.
- `assets/js/11-wiring-assistant.js` — role-aware wiring assistant.
- `assets/js/12-model-knowledge-base.js` — component knowledge base.
- `assets/js/13-board-catalog.js`, `14-component-specifications.js`, and `15-board-expansion.js` — board and component data.
- `assets/js/16-wire-routing.js` and `17-workspace-enhancements.js` — wire routing and workspace enhancements.
- `assets/js/18-responsive-layout.js` — responsive layout and controls.
- `assets/js/19-firebase-bridge.js` and `20-firebase-client.js` — Firebase bridge, authentication, and Firestore integration.

## Notes
- The main simulation engine is still inline in `index.html` to avoid changing its tightly coupled declarations during this organization pass.
- The virtual gateway's navigation function is named `gatewayNavigate` so it does not collide with the app's page-router function `go`.
- The visible creator credit is **Made by Ebram Sameh**.
- The gateway remains a virtual browser simulation, not a bridge to a physical ESP32 or local network.
- Verify Google sign-in, Firestore reads/writes, sharing, and camera inference on the deployed site.
