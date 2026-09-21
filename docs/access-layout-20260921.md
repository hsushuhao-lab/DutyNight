# Screenshot-directed access corrections — 2026-09-21

This revision implements the user's latest screenshot request. It does not add normal-duty gameplay, horror events or an art overhaul.

- Elevator and stair menus: descending visual order, 1F at bottom; original permitted floors retained.
- 1F closed pharmacy/store and OPD: fixed opaque steel doors, no reader or opening action. Main public glass entrance and its night-duty dialogue remain closed and unchanged.
- Remove the old suspended directory board over the 1F lift-core opening.
- ER: one door assembly at the hillside entrance, never a generic propped wooden leaf plus controlled leaves. Nursing-station entry and direct nursing-to-beds link use transparent reinforced glass with card access on both sides.
- Both ward entrances: single boundary against the lift lobby, no parallel pre-ward corridor. Bed numbers and activity halls remain as approved.
- Second campus: lobby gate enters the nursing station; separate protected staff door leads to the activity hall. Reads follow the entrance through the station in the approved sketch. No public bypass around the admission boundary.
- Nursing-station reader controls: physically mounted on the left jamb above the counter, separate front/back faces, no floating stacked controls or decorative handles on card-operated sliding leaves.
- Duty-room cabinet: doors face the room instead of the back wall.

## Verification basis
The local baseline contained 21 passing Node suites. The new screenshot-access suite reproduced a failure before editing and adds 16 targeted assertions. All 22 local suites pass after the corrections. The browser script additionally verifies descending floor buttons, actual E interactions at locked zones and new glass passages, the admission sequence through the second-campus station, all nine ward rooms per campus, outdoor/pond return and retained key state.

Browser CI and public deployment results must be attached to the released SHA before claiming completion. Fixed images alone are not traversal proof. The local managed browser blocked loopback navigation, so local Node/build results are not presented as a local browser pass.
