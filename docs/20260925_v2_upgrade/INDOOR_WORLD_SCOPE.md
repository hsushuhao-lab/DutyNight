# V2 enclosed-world contract

The production traversal is a closed indoor hospital world. Exterior scenery may appear through windows or as a distant rainy/night backdrop; there is no playable outdoor route.

## Reachable production map

| Area | Production role |
|---|---|
| First campus 1F, 2F ER, 3F, 4F, 8F bridge lobby | Normal work, story evidence, guard post, and bridge access |
| Enclosed skybridge | Only inter-campus route, both outbound and M5 return |
| Second campus 1F, 2F, 5F | Guard/access point, bridge landing, ordinary M4 consult |
| Phantom 6F | Story-only elevator hijack; never a normal floor choice |
| B2 | Story-only service-lift archive |

## Not reachable in production

- `hillside_route`, `ecology_pond`, outdoor return gameplay, and any task/choice offering them.
- The second-campus hillside door and the first-campus ER hillside portal remain closed/background only.
- Stairs cannot trigger Phantom 6F. 6F is absent from ordinary floor panels and pre-event task text.

Keep the legacy `HillsideRoute.js` and `EcologyPond.js` source unless deletion is required to close a real reachability path. Tests may instantiate them directly for bounded historical geometry checks, but `WorldRoutes`, production portals, task text, and production navigation must not lead to them.

## Acceptance proof

1. Enumerate every production portal and vertical-core destination; none targets either outdoor zone.
2. Test that ordinary story choices and M5 expose only the enclosed skybridge trip.
3. Test that outdoor zone identifiers are absent from production `WorldRouter` reachability and public selector data.
4. Preserve the existing closed exterior access doors as geometry; do not hide a live portal behind an opaque door.
5. Verify M4 outbound and M5 return over the same skybridge, with midpoint door lock on return.
