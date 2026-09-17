# ACT 1 MASTER SPEC — 今晚輪到你

## Runtime target
35–55 minutes on first playthrough.

## Narrative purpose
1. Teach the player how a night-duty physician actually lives and works.
2. Establish the duty room as a private safe space.
3. Establish the nursing station as a social/work hub.
4. Teach the hospital computer workflow.
5. Teach that duty means interruptions and competing priorities.
6. End with a single contradiction: someone insists the physician has already been there.

## Emotional curve
- 17:00–18:00: arrival, familiarity, sunset warmth.
- 18:00–19:30: routine work, light social dialogue, dinner anticipation.
- 19:30–20:30: busier but still safe; first multi-task pressure.
- 20:30–20:55: quieting hospital, fewer people, warmer light fading.
- 20:55–21:00: first contradiction; no explicit explanation.

## Visual curve
### Phase W1 — Sunset warmth (17:00–18:30)
- 3800–4500K practical lighting.
- Golden exterior light through windows.
- Normal occupancy.
- Nursing station feels lived-in.
- Moderate environmental sound.

### Phase W2 — Evening work (18:30–20:30)
- Exterior light gradually falls.
- Practical lamps become more important.
- Still warm, but with more neutral hospital fluorescence.
- Fewer background NPCs.

### Phase H0 — First unease (20:45–21:00)
- No horror color grade yet.
- Slight reduction in ambient chatter.
- Slightly longer hallway reverb.
- The contradiction is narrative, not visual spectacle.

## Core gameplay loop
Receive work → travel → talk/inspect → perform simplified interaction → document → return.

## Medical abstraction rule
Clinical tasks must be simplified and fictionalized. Do not implement real-world actionable treatment algorithms or medication dosing. The gameplay is about duty burden, attention and documentation, not medical training.

## Mandatory beats
1. ADMIN_START — arrive at 3F administrative zone.
2. KEY_PICKUP — collect duty-room key.
3. DUTY_LOG — sign duty book.
4. E_HANDOFF — use any eligible workstation for electronic handoff.
5. WARD_ENTRY — reach 4F closed ward area.
6. DUTY_ROOM_SETUP — unlock room; put away bag; make bed.
7. DINNER_ORDER — visit nursing station; order dinner.
8. ROUND_01 — routine ward rounds.
9. ROUTINE_CALL — nursing call for a simple non-emergency issue.
10. DOCUMENT — return to workstation and close the task.
11. PRIORITY_WINDOW — multiple needs arrive within a short interval.
12. ANOMALY_HOOK — one queued task is already marked as handled; nurse says “You were just here.”
13. END_CHOICE — player responds.
14. ACT1_SAVE — persist hidden state and transition.
