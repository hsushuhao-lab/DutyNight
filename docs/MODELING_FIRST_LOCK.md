# DutyNight — Modeling-First Lock

## Status

`MODELING_FIRST = ACTIVE`

From this point forward, the project must establish **complete spatial modeling and collision/topology correctness before further art-direction polish**.

## Required order

1. **Geometry / topology** — rooms, corridors, doorways, walls, floors, ceilings, elevators, bridges, exterior paths.
2. **Collision / traversal** — no invisible blockers, no walk-through walls, no accidental voids, no inaccessible required rooms.
3. **Wayfinding / room identity** — every sign must match the actual modeled destination and route.
4. **Gameplay anchors** — interaction points, workstations, key locations, nursing stations, duty room, ER, bridge access, etc.
5. **Only after the above are frozen:** materials, lighting, props, atmospheric dressing, final UI and visual polish.

## Hard rule

Do not use final-looking art to hide incorrect geometry. If a wall, doorway, corridor, room boundary, or route is wrong, fix the model first.

## Modeling targets

### First campus
- 3F administrative / doctor area, including room 316.
- 4F psychiatric ward arrival, nursing-station direction and independent duty room.
- 2F ER / acute-care area.
- 1F public lobby / exit logic.
- 8F skybridge entrance.

### Inter-campus
- Enclosed skybridge with correct route continuity.

### Second campus
- 2F special landing / bridge connection.
- Standard ward-floor module.
- 1F hillside exit.
- Reusable standard floor for later anomalous-floor logic.

### Exterior
- Hillside route.
- Branch path toward ecological pond.
- Ecological pond area.

## Per-zone acceptance gate

A zone is **MODELING PASS** only if all are true:

- Required entrances are physically reachable.
- Every visible solid wall has matching collision.
- Every intended doorway is traversable.
- No player-accessible voids or open backfaces are visible.
- Floor and ceiling boundaries are continuous.
- Signs point to the actual modeled route.
- Required interaction anchors are accessible.
- Player cannot clip through windows, walls, railings or room dividers.
- No final art pass is required to understand the spatial layout.

## Current priority

1. Stabilize 3F geometry around room 316 and its opposite corridor wall.
2. Keep the duty rules / shift reminder **inside room 316**, not on the public corridor end wall.
3. Then continue modeling remaining areas before further visual-polish work.
