# Gameplay Poster and B2 Flow V2

This document records the current implementation contract. Historical specifications must not reduce the existing story scope.

## Poster contract

- Eight era posters have raw PNG, display WebP, and inspect WebP sources under `prototype/public/assets/posters/era/`.
- `PosterRegistry.js` is the only texture path registry.
- Posters appear across 1F, 2F, 3F, 4F, second campus 5F, 8F and skybridge, phantom 6F, and B2.
- More than twenty placements exist and at least five support close inspection with `E`.

## Emergency department contract

- The 00:33 record is queried only from the doctor consultation room computer.
- Nursing station computers never advance the record. They direct the player to the doctor computer.
- 20:05 means a person exists while identity is unclear. At 00:33, a registration record exists while no patient can be found.

## B2 contract

- B2 is the archive isolation floor and its terminal is the archive verification terminal.
- B2 and phantom 6F do not identify their abnormal rooms as the 316 office.
- The B2 terminal shares the ordinary hospital workstation visual language.
- A visible escape stair returns to 1F and remains available whether verification succeeds or fails.
- Successful verification advances the identity story. Insufficient fragments set a return objective and allow the player to leave, collect clues, and revisit B2.

## Preserved main route

Normal duty → 409A / Bed 33 → 21:17 → 00:33 → 316 identity clues → second campus → Annie / dual path → 6F → 02:17 / B2 → identity seizure → true handoff in 316.
