# ACT 1 CHOICE / HIDDEN STATE

Do not show scores to the player.

## Persistent hidden variables
- `Duty`: responsibility and completion of real work.
- `Evidence`: how actively the player investigates contradictions.
- `Identity`: how strongly the world still recognizes the player as the only duty physician.
- `Fatigue`: cumulative burden / interrupted-rest pressure.

## End-of-act choices

### Choice A — Ask the nurse
Player line: 「我什麼時候來過？」
Result:
- Evidence +1
- Identity -1 only if the player presses for details twice
- Unlock `NURSE_WITNESS_SEED`
- Act 2 begins with nurse remembering clothing/posture details.

### Choice B — Check the workstation
Player leaves the nurse and checks the electronic record.
Result:
- Evidence +1
- Unlock `LOGIN_MISMATCH_SEED`
- The record shows a routine task completed under the player account at an impossible time window, but not enough to prove another person exists.

### Choice C — Dismiss it / rest
Player line: 「你可能認錯了，我先回值班室。」
Result:
- Fatigue -1
- Evidence unchanged
- Unlock `UNSEEN_HELP_SEED`
- Act 2 starts with another task already completed while the player was resting.

## Transition condition
Act 1 may transition only when:
- Required onboarding tasks are complete.
- First routine call is complete.
- Priority window has resolved.
- One anomaly seed choice has been recorded.
