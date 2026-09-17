# DutyNight Progress Report — 2026-09-17

## Scope completed in this pass

1. Reduced first-person mouse sensitivity and camera FOV for comfort.
2. Reduced head-bob amplitude and walk/run speed to lower motion sickness.
3. Confirmed and preserved both WASD and arrow-key movement.
4. Added double-click auto-walk to interactable objects and walkable floor surfaces.
5. Auto-walk respects the existing collider system and cancels on manual movement or collision.
6. Corrected the 3F duty check-in location from the old placeholder room 302 to the user-confirmed 316 chief-resident office.
7. Removed the unconfirmed 402 duty-room number and replaced it with the confirmed concept: an independent 4F duty room.
8. Applied Act 1 warm visual direction: warmer dusk lighting, lower visual harshness, hospital tile material, wood rails, seating, plant, end-of-corridor dusk lightbox and a subtle cinematic vignette.
9. Updated on-screen control hints for arrow keys and double-click movement.

## Validation

- `node --check` PASS for:
  - `prototype/src/player/FPSController.js`
  - `prototype/src/world/Level3FBlockout.js`
  - `prototype/src/main.js`
  - `prototype/src/ui/UIManager.js`
- Linux container Vite build was not used as the final build gate because the uploaded project contains Windows-native Rollup binaries. A Windows `npm run build` remains the required final runtime/build check on the user's machine.

## GitHub status

The uploaded Git repository has no remote configured. The currently connected GitHub account exposes `hsushuhao-lab/hao_hw` and `hsushuhao-lab/commuter-hero-taipei`, but no `DutyNight` repository. This pass is committed locally and ready to push as soon as a DutyNight repository is created/connected.
