# Debug journal — 316 phone and public outdoor textures
2026-09-27; HEAD 282e8b3. Existing dirty QA scripts and CLOSEOUT_CURRENT preserved.
Runtime: Node ESM, Vite 6, Three 0.170, installed Chrome via Playwright.
References read: debugging node, browser-qa, setup, fix.
Evidence: GitHub run 36311053152 fails phone subtitle assertion after timed replacement.
Hypotheses: (1) fixed phone timer advances unread thought; (2) outdoor network requests remain pending; (3) decoded outdoor maps fail to propagate to visible clones.
Artifacts: diagnostic script scripts/diagnose-material-loading.mjs was inherited; extend request timing capture temporarily, retain JSON evidence; remove diagnostic at cleanup.
Permanent candidates: E-driven 316 phone and focused regression, story harness reads thought before draining.

Diagnostic finished 30 samples, all maps present, no errors. Temporary diagnostic script removed; JSON retained as evidence. Phone unit/browser tests PASS; e887133 + b5d41e1 published. Public material audit PASS 11 visits, 135511 ms.
