# ACT1 Realism Rework Report (2026-09-17)

## Scope
Local corrective rework focused on visual/spec alignment and a more grounded realistic presentation for the Act 1 prototype.

## Key fixes completed
1. Replaced the flat orange exterior plane with a softer dusk gradient backdrop.
2. Reduced overly stylized signage and removed emoji-style wayfinding in 3F elevator signage.
3. Normalized 316 office naming and added a fixed wall-mounted 316 plaque.
4. Added a more realistic office doorway with door leaf and small glazed panel.
5. Kept corridor handrails aligned to the walls only; no obstruction at the office entrance.
6. Simplified the 4F key wording to avoid incorrect/over-specified room numbering.
7. Reworked workstation monitor visuals to resemble a grounded HIS-style screen instead of flat glowing color blocks.
8. Replaced the elevator-arrival prototype milestone list with in-world next-step text.
9. Cleaned up UI copy to read more like a believable hospital prototype and less like a debug showcase.
10. Replaced the anomalous 4A33 placeholder row with a more plausible occupied-bed example.
11. Softened HUD / panel colors toward a more muted clinical palette.

## Files changed
- `prototype/src/world/Level3FBlockout.js`
- `prototype/src/ui/UIManager.js`
- `prototype/src/main.js`
- `prototype/index.html`
- `prototype/style.css`

## Verification completed in this environment
- `node --check prototype/src/world/Level3FBlockout.js` ✅
- `node --check prototype/src/ui/UIManager.js` ✅
- `node --check prototype/src/main.js` ✅

## Verification not completed here
- Full `npm run build` could not be executed in this container because the prototype dependencies are not installed locally.
- GitHub push/deployment was not performed from this interface.
