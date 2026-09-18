# Whole-campus playable baseline

Starting source: 003fbf4aa8ee073985f9f96d97659692ae3b6986. Art direction is frozen for this task. The new user request authorizes functional room and route expansion; the older exact-topology differential is historical, not the completion gate for this expansion.

1. **Complete — rooms:** first-campus functional room wings and second-campus numbered reusable floors are implemented, preserving existing gameplay and styling. See [requirements matrix](REQUIREMENTS.md).
2. **Complete — traversal implementation:** production elevator selection, ten bidirectional route-portal transitions, and supported-ground movement with bounded steps are implemented. First-campus stair selection serves only 3F/4F; second-campus stair selection serves only 1F/2F. Other supported floors are reached by elevator.
3. **Complete — local acceptance:** browser walkthrough and screenshot QA passed for the compiled source in BUILD.json. Engineering checks report 14/14 suites PASS; the playable-world test covers 16 canonical zones, 49 supported spawns, 37 actual-controller room round trips and 10 portal transitions. These counts do not replace browser verification of visible signs, room entry/exit/return, elevator interaction, route continuity, floor identity or preserved story tasks.
4. **In progress — release:** commit/push, GitHub Pages SUCCESS, live walkthrough, requirement-by-requirement completion audit and final report.

Initial findings (historical, before this implementation): eleven generic zones; one live 3F-to-4F elevator handler; other elevator meshes lacked interactions; the FPS controller checked wall boxes without following walkable floors. Missing first-campus rooms and second-campus numbered room interiors motivated this expansion. No existing rooftop/balcony specification was found in the repository docs/source search; none is invented for this task.

Completion requires the current playable-campus requirements and deployment evidence. The paused art overhaul is not declared complete by these engineering results.
