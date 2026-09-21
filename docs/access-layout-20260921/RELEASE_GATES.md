# Access-layout release validation

The previous workflow at d5ed7cb reached the pond waterfront and was returning via second-campus 1F when its 25-minute job limit cancelled it. That is an incomplete test, not a pass. The logs contain no failed gameplay assertion before cancellation.

This revision does not modify game code or remove checks. The continuous browser route has a 38-minute step budget; fixed-view captures run on a separate runner so they cannot consume that budget. Both jobs must succeed. Node reports, browser results and screenshots retain the exact source commit.

To avoid rebuilding and retesting an identical commit before publication, a fast-forward release of an already validated SHA can use the exact `access-layout-tested-site` artifact. The deployment workflow requires a successful validation run with exactly `GITHUB_SHA`, an unexpired artifact, and matching source fingerprints in the site and both evidence bundles. Unvalidated commits still execute the complete pre-release suite. A different merge SHA does not reuse a branch artifact.

After deployment the public build fingerprint and module must be fetched successfully, and the complete browser route must pass again against the public URL. Neither the branch upload nor a workflow start is a release-success claim. Software-rendered CI screenshots are not laptop performance measurements.
