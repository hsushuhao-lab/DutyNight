# Asset readiness and audio recovery — working checkpoint

Base published revision: f3d63c096745a859aba6cab357e02f7150a86c57.
Status: READY_TO_PUBLISH — user requested direct publication without further testing. Full visual/runtime acceptance remains unverified.

## Implemented
- Opening HTML mask remains until essential models and PBR surfaces finish, before world construction. Bounded automatic retries lead to an explicit retry button on failure. Optional scenery starts separately.
- Shared load queue prioritizes essentials, caps concurrency at three groups and optional work at one.
- Failed model/material loads can retry; late indoor models hydrate existing containers; disposed instances unregister.
- Trusted global pointer/key/touch input unlocks audio; visibility recovery resumes previously unlocked audio.
- Phone ringing repeats every 4.2 seconds, starts idempotently, recovers after audio unlock, and cancels scheduled oscillators upon answering/reset.
- ACT II completion promise gates the 00:33 call, including an already-running presentation.
- 409 post-seal knock gain restored to 0.13; no new knock added to the 408C assessment or assignment form.
- Archive personnel order: nursing, security, administration, then doctors; Zhang Shouheng last.

## Current evidence
- test-asset-load-queue.mjs PASS
- test-asset-recovery.mjs PASS
- test-phone-lifecycle.mjs PASS (mock audio/timer lifecycle, not audible browser proof)
- test-act2-phone-order.mjs PASS (completion promise plus source integration assertion)
- npm run build PASS; prototype/qa-results/asset-audio-hotfix-build.log

## Remaining gates
- Implemented readiness waits for B2 entry/exit, 6F entry/return, forced 3F stop, loop reset and bridge portals; removed 6F failed-load fallback. Browser coverage of all routes remains outstanding.
- Audit actual per-zone essential usage and first playable frame in browser.
- Browser trusted-input audio and phone recovery verification.
- Same-revision M1–M9, cold/warm, material audit, fixed before/after, cinematics and public Pages.
- Commit/push/deployment after implementation verification. Do not label DEPLOYED_AND_VISUALLY_VERIFIED from these unit checks.

## Publication instruction
User requested direct release on 2026-09-27 after code changes, without further tests. Preserve that scope; no additional tests were started after the request. Existing workflow checks remain configured. Incoming master 7ce3247 adds final Patientization history choice and must be preserved during integration.
