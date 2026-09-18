# Whole-campus playable baseline

This task freezes the current art style and completes normal Act 1 traversal. It supersedes the earlier exact-topology restriction for the user-authorized room expansion; it does not assert the old photorealistic VISUAL_LOCK.

Implemented coverage: first-campus 1F, 2F ER and supporting rooms, 3F administration/316, 4F wards A–D and independent duty room, 8F bridge entrance; skybridge; second-campus 1F, special 2F, reusable numbered 3F–8F; hillside and ecology pond. There are sixteen production zones and thirty-seven newly enterable rooms.

Travel uses the production elevator selector and physical route entrances. First-campus stairs connect 3F/4F and second-campus stairs connect 1F/2F; the other defined floors use elevators. No unrequested first-campus 5F–7F or unspecified rooftop/balcony was invented.

The movement controller now follows supported floor surfaces, rejects unsupported steps and subdivides large movement steps before collision checks. Original spawn, doorway, wall, interaction and cleanup tests remain intact. The pond approach/deck gap is bridged by a floor surface.

Browser method: a fresh normal production entry, original key/log/HIS actions through E and modal buttons, movement through the same controller used by keyboard and double-click walking, actual elevator/stair UI selection, automatic physical entrances, all room visits and return to 3F. The harness sets heading and movement inputs; it does not directly write player position or call debug teleport/loadZone. This is an automated browser walkthrough with human screenshot inspection, not a claim that every input was manually operated.

Final local candidate: PASS; 16 zones, 37 room round trips, 10 directed physical portal crossings, 57 screenshots, and zero browser errors. All 14 engineering suites and the production build passed. Four resource cycles across 17 registered zones (16 production plus the legacy standard-floor alias) stabilize at 492 geometries and 52 textures. The same candidate passed both ward readers, a closed-gate W-key collision probe, door reopening, travel cancellation/Escape, task HUD completion and a complete return to 3F with the collected key absent. Published verification is still pending.

Evidence: [local walkthrough](local-final/result.json), [engineering/build commands](engineering.json), [full log](engineering-and-browser.txt), [resource counts](resources.json), [bundle provenance](BUILD.json).

Deferred beyond this traversal scope: photorealistic visual acceptance, final lighting refinement, NPC/Act 2/horror, persistence across a browser reload, and any new unspecified floors. Existing ceiling surface shimmer remains a cosmetic limitation of the frozen style; no traversal fix is claimed for it.

## Reproduce

From `prototype/`, run `npm ci`, `npm run build`, then:

```sh
node scripts/test-playable-walkthrough.mjs ../docs/traversal-qa/local-final
node scripts/test-playable-walkthrough.mjs ../docs/traversal-qa/live https://hsushuhao-lab.github.io/DutyNight/
node scripts/test-browser-resources.mjs ../docs/traversal-qa/resources.json
```

Run browser scripts one at a time. The local scripts own preview port 4173. The live script uses the published URL. Chrome and Playwright are required. For engineering regression, execute every `prototype/test_*_qa.js` with Node.

## Known limitations and next priorities

No first-campus 5F–7F or roof/balcony is part of the supplied defined scope. Standard second-campus floors have shared baseline furnishings; floor labels and room identifiers differ. Doors preserve state during zone changes, not across page reloads. The gate starts open for staff traversal and can be closed from either side; no NPC authorization simulation was added.

Next five priorities: independent hardware/browser playtesting; save/resume design; navigation usability review with a first-time player; GPU and bundle performance; resume the separate visual-quality lock only after accepting this playable baseline. None of these is represented as an implemented feature in this release.

## Zone screenshots

| Zone | Local candidate | Published site |
| --- | --- | --- |
| first_campus_3f | [Screenshot](local-final/first_campus_3f.jpg) | Pending |
| first_campus_4f | [Screenshot](local-final/first_campus_4f.jpg) | Pending |
| first_campus_1f | [Screenshot](local-final/first_campus_1f.jpg) | Pending |
| first_campus_2f | [Screenshot](local-final/first_campus_2f.jpg) | Pending |
| first_campus_8f | [Screenshot](local-final/first_campus_8f.jpg) | Pending |
| skybridge | [Screenshot](local-final/skybridge.jpg) | Pending |
| second_campus_2f | [Screenshot](local-final/second_campus_2f.jpg) | Pending |
| second_campus_3f | [Screenshot](local-final/second_campus_3f.jpg) | Pending |
| second_campus_4f | [Screenshot](local-final/second_campus_4f.jpg) | Pending |
| second_campus_5f | [Screenshot](local-final/second_campus_5f.jpg) | Pending |
| second_campus_6f | [Screenshot](local-final/second_campus_6f.jpg) | Pending |
| second_campus_7f | [Screenshot](local-final/second_campus_7f.jpg) | Pending |
| second_campus_8f | [Screenshot](local-final/second_campus_8f.jpg) | Pending |
| second_campus_1f | [Screenshot](local-final/second_campus_1f.jpg) | Pending |
| hillside_route | [Screenshot](local-final/hillside_route.jpg) | Pending |
| ecology_pond | [Screenshot](local-final/ecology_pond.jpg) | Pending |
