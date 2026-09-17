# ACT 1 EVENT FLOW

```text
ACT1_BEGIN (16:55)
  ↓
ADMIN_START
  ↓
KEY_PICKUP + DUTY_LOG
  ↓
E_HANDOFF
  ↓
ELEVATOR_TO_4F
  ↓
WARD_ENTRY
  ↓
DUTY_ROOM_SETUP
  ↓
DINNER_ORDER
  ↓
ROUND_01
  ↓
ROUTINE_CALL
  ↓
DOCUMENT
  ↓
FREE_WINDOW (short exploration / optional dialogue)
  ↓
PRIORITY_WINDOW (~20:45)
  ├─ Ward request
  ├─ ER request
  └─ Dinner / rest opportunity
  ↓
PLAYER PRIORITIZES
  ↓
ONE QUEUED ITEM RESOLVES WITHOUT PLAYER
  ↓
ANOMALY_HOOK (~20:58)
  ↓
Nurse: “醫師，你不是剛剛才來過嗎？”
  ↓
END_CHOICE
  ├─ A Ask the nurse exactly what happened
  ├─ B Check the computer record first
  └─ C Dismiss it and return to the duty room
  ↓
ACT1_SAVE
  ↓
ACT 2 ENTRY STATE
```

## Important
The auto-resolved item must not contain dangerous real-world medical specifics. Use a fictionalized administrative/observation task such as “observation note completed” or “routine assessment documented.”
