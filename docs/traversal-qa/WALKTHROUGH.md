# Whole-campus playable baseline

This task freezes the current art style and completes normal Act 1 traversal. It supersedes the earlier exact-topology restriction for the user-authorized room expansion; it does not assert the old photorealistic VISUAL_LOCK.

Implemented coverage: first-campus 1F, 2F ER and supporting rooms, 3F administration/316, 4F wards A–D and independent duty room, 8F bridge entrance; skybridge; second-campus 1F, special 2F, reusable numbered 3F–8F; hillside and ecology pond. There are sixteen production zones and thirty-seven newly enterable rooms.

Travel uses the production elevator selector and physical route entrances. First-campus stairs connect 3F/4F and second-campus stairs connect 1F/2F; the other defined floors use elevators. No unrequested first-campus 5F–7F or unspecified rooftop/balcony was invented.

The movement controller now follows supported floor surfaces, rejects unsupported steps and subdivides large movement steps before collision checks. Original spawn, doorway, wall, interaction and cleanup tests remain intact. The pond approach/deck gap is bridged by a floor surface.

Browser method: a fresh normal production entry, original key/log/HIS actions through E and modal buttons, movement through the same controller used by keyboard and double-click walking, actual elevator/stair UI selection, automatic physical entrances, all room visits and return to 3F. The harness sets heading and movement inputs; it does not directly write player position or call debug teleport/loadZone. This is an automated browser walkthrough with visual screenshot inspection, not a claim that every input was manually operated.

Local traversal baseline (LOCAL_BASELINE_BUILD.json): PASS; 16 zones, 37 room round trips, 10 directed physical portal crossings, 57 screenshots, and zero browser errors. All 14 engineering suites and the production build passed. Four resource cycles across 17 registered zones (16 production plus the legacy standard-floor alias) stabilize at 492 geometries and 52 textures. The same candidate passed both ward readers, a closed-gate W-key collision probe, door reopening, travel cancellation/Escape, task HUD completion and a complete return to 3F with the collected key absent. Published verification: PASS on the actual GitHub Pages site, from the local Chrome browser with a dedicated persistent network cache and a fresh game state. The full 16-zone/37-room loop returned to 3F with zero browser errors. [Live result](live/result.json), [deployment and matching bundle](DEPLOYMENT.json), [completion audit](COMPLETION_AUDIT.json). Pages run [35293315603](https://github.com/hsushuhao-lab/DutyNight/actions/runs/35293315603) succeeded; its bundle SHA-256 matches BUILD.json. Initial load took 2.5 seconds in this recorded run. [CI diagnostics](CI_ATTEMPTS.json) are preserved separately as incomplete and are not acceptance evidence.

Evidence: [local walkthrough](local-final/result.json), [engineering/build commands](engineering.json), [full log](engineering-and-browser.txt), [resource counts](resources.json), [local baseline provenance](LOCAL_BASELINE_BUILD.json).

Deferred beyond this traversal scope: photorealistic visual acceptance, final lighting refinement, NPC/Act 2/horror, persistence across a browser reload, and any new unspecified floors. Existing ceiling surface shimmer remains a cosmetic limitation of the frozen style; no traversal fix is claimed for it. [Cold startup measurements](COLD_LOAD.json) show that downloads can be slow on this test connection, and the production JavaScript bundle still triggers the build size warning.

## Final signage regression

After the local traversal baseline, physical backplates were extended to contact their buttons, labels and mounting walls. The second-campus 2F stair direction plaque was separated from its travel panel after the new overlap regression reproduced the defect. All 15 engineering suites, production build, 16 reachable-control closeups and four resource cycles passed on the final source in BUILD.json. Root and an independent reviewer inspected the corrected panel; all 16 panel closeups passed their specified mounting/overlap checks.

Evidence: [final engineering commands](final-engineering.json), [full final log](final-engineering.txt), [panel results](panels/result.json), [corrected 2F stairs](panels/second_campus_2f_stairs.jpg), [final runtime provenance](BUILD.json).

## Reproduce

From `prototype/`, run `npm ci`, `npm run build`, then:

```sh
node scripts/test-playable-walkthrough.mjs ../docs/traversal-qa/local-final
node scripts/test-playable-walkthrough.mjs ../docs/traversal-qa/live https://hsushuhao-lab.github.io/DutyNight/
node scripts/test-browser-resources.mjs ../docs/traversal-qa/resources.json
```

For an unstable connection, retain only the normal browser network cache in a dedicated QA profile:

```sh
DUTYNIGHT_QA_PROFILE=../.visual-work/live-chrome-profile node scripts/test-playable-walkthrough.mjs ../docs/traversal-qa/live https://hsushuhao-lab.github.io/DutyNight/
```

This opens a fresh page and verifies the initial locked lift and unfinished tasks. Cached assets still originate from the published site. It does not inject local assets or restore player progress.

Run browser scripts one at a time. The local scripts own preview port 4173. The live script uses the published URL. Chrome and Playwright are required. Live cold asset downloads exceeded the former 30-second navigation limit; the harness now allows 600 seconds and records initialLoadMs. The diagnostic GitHub Actions attempts used deviceScaleFactor 0.5 with the same 1280-by-800 CSS viewport for software rendering; the actual raster screenshots are 640-by-400. Both local baseline and final live screenshots use deviceScaleFactor 1. The incomplete CI runs are recorded in CI_ATTEMPTS.json; the unsuccessful experimental workflow was removed. This changes only the browser test timeout, with gameplay assertions unchanged. For engineering regression, execute every `prototype/test_*_qa.js` with Node.

## Known limitations and next priorities

No first-campus 5F–7F or roof/balcony is part of the supplied defined scope. Standard second-campus floors have shared baseline furnishings; floor labels and room identifiers differ. Doors preserve state during zone changes, not across page reloads. The gate starts open for staff traversal and can be closed from either side; no NPC authorization simulation was added.

Next five priorities: reduce startup asset payload and provide visible load/retry behavior; independent hardware/browser performance playtesting; save/resume design; navigation usability review with a first-time player; resume the separate visual-quality lock only after accepting this playable baseline. None of these is represented as an implemented feature in this release.

## Zone screenshots

| Zone | Local candidate | Published site |
| --- | --- | --- |
| first_campus_3f | [Screenshot](local-final/first_campus_3f.jpg) | [Screenshot](live/first_campus_3f.jpg) |
| first_campus_4f | [Screenshot](local-final/first_campus_4f.jpg) | [Screenshot](live/first_campus_4f.jpg) |
| first_campus_1f | [Screenshot](local-final/first_campus_1f.jpg) | [Screenshot](live/first_campus_1f.jpg) |
| first_campus_2f | [Screenshot](local-final/first_campus_2f.jpg) | [Screenshot](live/first_campus_2f.jpg) |
| first_campus_8f | [Screenshot](local-final/first_campus_8f.jpg) | [Screenshot](live/first_campus_8f.jpg) |
| skybridge | [Screenshot](local-final/skybridge.jpg) | [Screenshot](live/skybridge.jpg) |
| second_campus_2f | [Screenshot](local-final/second_campus_2f.jpg) | [Screenshot](live/second_campus_2f.jpg) |
| second_campus_3f | [Screenshot](local-final/second_campus_3f.jpg) | [Screenshot](live/second_campus_3f.jpg) |
| second_campus_4f | [Screenshot](local-final/second_campus_4f.jpg) | [Screenshot](live/second_campus_4f.jpg) |
| second_campus_5f | [Screenshot](local-final/second_campus_5f.jpg) | [Screenshot](live/second_campus_5f.jpg) |
| second_campus_6f | [Screenshot](local-final/second_campus_6f.jpg) | [Screenshot](live/second_campus_6f.jpg) |
| second_campus_7f | [Screenshot](local-final/second_campus_7f.jpg) | [Screenshot](live/second_campus_7f.jpg) |
| second_campus_8f | [Screenshot](local-final/second_campus_8f.jpg) | [Screenshot](live/second_campus_8f.jpg) |
| second_campus_1f | [Screenshot](local-final/second_campus_1f.jpg) | [Screenshot](live/second_campus_1f.jpg) |
| hillside_route | [Screenshot](local-final/hillside_route.jpg) | [Screenshot](live/hillside_route.jpg) |
| ecology_pond | [Screenshot](local-final/ecology_pond.jpg) | [Screenshot](live/ecology_pond.jpg) |

## Acceptance outcome

All named in-scope areas are implemented and verified. Incomplete in-scope areas: none. No blocking traversal bug was observed in the tested routes. Local network attempts failed during asset loading, including connection resets; those failures are preserved in COLD_LOAD.json and are not counted as passes. The successful final published route used the actual published URL in a local Chrome browser. Its dedicated network cache retained assets fetched from that same site; no requests were replaced by local files, and no player positions were written. Initial locked-lift and incomplete-task assertions verified fresh gameplay state. Slow startup and ceiling-surface shimmer remain limitations. The separate photorealistic visual overhaul remains paused.

The local traversal baseline is identified in LOCAL_BASELINE_BUILD.json. Two subsequent signage corrections were verified by 15 engineering suites, production build, 16 panel closeups, resource cycles and a fresh full published walkthrough against the final bundle in BUILD.json. Later test/report-only commits do not alter that runtime.
