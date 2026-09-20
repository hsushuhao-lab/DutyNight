# Floorplan and controlled access revision — 2026-09-20

## Authority and scope
The user's latest hand-drawn layout and corrections supersede the older 4A–4D blockout. This is a game layout, not a scale survey of a real hospital. Do not upload personal photographs or real hospital evacuation maps.

- First-campus 4F: 401–409 around an activity hall, gender-friendly WC in the northwest, protected nursing station southeast. Independent duty suite outside the ward gate, next to the elevator lobby.
- Second-campus 5F: 501–509 around an activity hall, protected nursing station to the south, doctor office southeast outside the ward gate. The unlabelled northwest block remains unlabelled.
- 402 is an approved WARD number in the new drawing, not an invented duty-room number.
- Both nursing stations use the same six-metre module, with clear reinforced glass, a staff door and screens facing operator chairs. Their placements follow their respective diagrams.
- Same per-campus elevator/stair local layout on each floor, real side-wall lift button. Stairs are menu-only doors.
- First public floors: 1, 2, 3, 4, 8. Second public floors: 1, 2, 5. Second 4F remains story-only, absent from ordinary buttons.
- ER observation-bed zone and hillside entrance have normally closed card doors with controls on both sides.
- Bridge boundaries use normally closed opaque card doors and a short covered zone transition; proximity alone never changes zones.
- Elevator movement displays direction and origin/destination BEFORE arrival.
- Existing 1F night closures and 316 key/log/HIS remain. No new horror, normal-duty system, or art overhaul in this release.

## Implementation
`WardFloorplan`, `PlanArchitecture`, `AccessDoor` and `VerticalCore` provide explicit wall apertures, shared protected-station geometry, door state/collision, and one common local transport layout. Existing floor shells only receive the required connection openings. All geometry belongs to its zone root and follows the existing disposal policy.

## Verification
Run in `prototype`:

```
node scripts/run-floorplan-regressions.mjs
npm run build
node scripts/capture-floorplan.mjs
node scripts/test-floorplan-browser.mjs
```

The old coordinate-specific `test_world_traversal_qa.js` now invokes the new floorplan suite rather than claiming obsolete 18-route numbers. Other existing regression suites remain separate. Static picture presets are visual evidence only. The continuous browser script uses actual controller collision steps, real E/card input and real floor-selection UI; it does not directly teleport or complete tasks.

Evidence is uploaded by `Floorplan validation` and the deployment workflow. A successful production deployment additionally checks `build-info.json` against the deployed commit. Local test success alone is not a deployment or final visual-acceptance claim.
