# 316 second-campus call: E-driven continuation

Baseline: 282e8b30ca25f8adf370f946942f0c6bf117ce72.
Full browser workflow 36311053152 failed at M3: a fixed 1800 ms timer replaced the unread 316 thought with the nurse's first line. The current dialogue contract requires E acknowledgement.

Fix: use the existing showDialogue completion callback for the thought. It continues into the existing two nurse lines; no new dialogue system or progression bypass. The walkthrough reads the thought before draining dialogue and asserts that 2000 ms alone cannot grant second-campus access.

Evidence:
- scripts/test-316-phone-dialogue.mjs failed on the old handler (unlocked 1 rather than 0), then passed with the callback.
- scripts/test-316-phone-browser.mjs: local production browser PASS, three expected lines, E advancement, correct 5F objective, no page errors. Fixture supplies the actual completed M3 prerequisites.
- 17 deployment structural checks PASS.
- npm run build PASS; asset budget PASS.

Not full release acceptance: same-revision M1–M9, public material/runtime, loading and visual gates remain required. A diagnostic public run completed outdoor downloads at 107708 ms and showed all required PBR channels; that does not erase the prior 300-second material audit failure or satisfy performance acceptance.
