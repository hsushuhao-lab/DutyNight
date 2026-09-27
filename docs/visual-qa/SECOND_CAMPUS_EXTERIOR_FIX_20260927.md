# Second-campus 1F cold exterior materials

The public b5d41e1 capture completed 84 frames, then timed out in second-campus 1F. That zone renders hillside ground and path surfaces, but its manifest scheduled indoor surfaces only. A sequential audit previously hid this omission through material cache reuse.

Fix: add ground and asphalt to optional surfaces only. No campusTree model request or essential-entry dependency is added. Extend the material audit to visit this zone.

Evidence before fix: manifest regression failed because ground was absent. After fix: manifest regression PASS; production build PASS; a fresh local browser entering second-campus 1F directly loaded all six exterior PBR maps, no campusTree request and no browser errors. Four local views captured successfully. Local evidence: prototype/qa-results/second-campus-cold-exterior/result.json and prototype/qa-results/second-1f-exterior-fixed/capture-manifest.json.

Public verification for this fix is pending deployment. The local screenshot faces the landing door; it is not proof of the distant landscape composition.
