# Art direction V2 — Taiwanese hospital, ordinary first

The package in [`art_reference/`](art_reference/) is the visual reference set. It informs material, light, density, and framing, not literal map geometry or generated text. The target is a credible fictional Taiwanese hospital on an ordinary, tiring shift that gradually becomes a sealed institutional machine.

## Material and color language

- Aged warm ivory painted walls with restrained wear; institutional sage-green wall protection rails and door accents.
- Taiwan-style terrazzo in public corridors and subdued resilient vinyl in clinical rooms; diffuse texture and roughness, not mirror-floor gloss.
- Dark stained wood doors, brushed stainless fixtures, aluminum frames, acoustic ceiling grid, textured privacy glass.
- Oxidized teal/green appears in signs and reflected practical light. Warm amber belongs to local desk lamps, not a global orange grade.
- Deep charcoal is reserved for late-night corners and 6F/B2; geometry and access defects must remain visible during QA.

Use the existing local PBR color/normal/roughness maps through `MaterialRegistry` with documented real-world UV scale. Signs and operational paperwork use CanvasTexture with restrained Traditional Chinese and English secondary text. Never use real-hospital photographs or concept-board text as world decals.

## Lighting progression

| Period | Direction |
|---|---|
| 17:00–20:40 | Warm-neutral practicals, readable ivory/sage surfaces, modest window contribution; not haunted-house lighting. |
| 21:17–00:33 | Less ambient comfort, local fluorescent pools, dark corridor ends, small emergency-green spill. |
| 00:33–02:00 | Higher contrast, readable clinical objects, visible glass reflections, warm desk/phone islands. |
| 6F/B2 | Practical lights only, near-black periphery, localized dirty green/cyan emergency light and archival tungsten; retain navigable geometry. |

No global teal/green filter, no static wall clock in key story spaces, no theatrical orange/blue wash, and no darkness used to cover collision, floating signs, or clipping.

## Density and composition

- Before tiny details, establish correct room shell, doors, frames, baseboards, ceiling grid, rails, windows, and furniture silhouettes.
- Set-dressing clusters use whiteboards, mounted acrylic notices, taped paper, pens, binders, tissues, coffee, clipboards, logbooks, key labels, printers, carts, IV/supply details, and phones where staff actually work.
- Every object is supported by a surface or mount. Keep desk/chair pullout, patient circulation, door swings, and accessible routes clear.
- 409 is the 4F visual anomaly: sealed door, three caution layers, flat disinfection/closure notice, and faint cold peephole light; no ordinary bed inside or in census.
- M4 remains an occupied, ordinary consult. The already-filled internal transfer form carries the horror.
- The guard post reads as a used late-1990s service point with CCTV, radio, lamp, logbook, key cabinet, notices, and nearby hidden service access.
- Skybridge remains enclosed with campus doors, cold outbound practicals, intermittent return failures, and controlled reflections.

## Reusable implementation surface

Use reusable procedural set dressing and material helpers, not screenshot backgrounds. Keep textured props, signs, and material creation scoped by zone, dispose per-zone resources on cleanup, and preserve shared PBR assets. UI and interaction text remain readable Traditional Chinese without milestone/debug labels in production.

## Superseded image content

Generated text, room labels, patient identifiers, clocks, and floorplan sketches inside the boards are not canon. Outdoor hillside/ecology scenes are deprecated for gameplay. The human Annie image is wardrobe/mood-only and is superseded by [`ANNIE_IDENTITY_BIBLE.md`](ANNIE_IDENTITY_BIBLE.md).

Annie's current visual and animation target is [`ANNIE_VISUAL_REWORK_SPEC.md`](ANNIE_VISUAL_REWORK_SPEC.md): old CPR mannequin and white-coat medical echo, with a blank nose-only face, clear chest, rigid posture, and CPR action. Any older eye, mouth, airway, or neck-stethoscope image detail is superseded by the latest direct user direction.
