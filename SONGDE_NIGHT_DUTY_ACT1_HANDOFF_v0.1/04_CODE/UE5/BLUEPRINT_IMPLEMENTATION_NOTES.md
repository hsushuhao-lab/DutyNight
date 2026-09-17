# Blueprint implementation notes

Prefer Blueprint for scene interactions and dialogue triggers; keep C++ limited to persistent state and act gating.

## Recommended Blueprint classes
- `BP_Interactable_Base`
- `BP_KeyPickup`
- `BP_DutyLog`
- `BP_EligibleWorkstation`
- `BP_DutyRoomDoor`
- `BP_BedSetupInteraction`
- `BP_DutyPhone`
- `BP_Act1Director` (child of `AAct1Director`)

## Interaction contract
Every interactable should expose:
- Display label
- CanInteract boolean
- Interact event
- Optional task id to complete

Do not build a complex inventory. Act 1 needs only a duty-room key state flag.
