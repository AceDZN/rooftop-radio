# Workbook release

27 October 2026. The owner approved the parkour delivery redesign and requested merging it into the repository and adding it to the existing Workbook games app.

The game code is on `AceDZN/rooftop-radio` main at `84612ea`. The immutable release is `games/rooftop-radio/2026-10-27/`: 16 files, 11,191,829 bytes including the actual-gameplay poster. Each public R2 file returned 200 and matched the tested local SHA-256, content type and immutable cache policy. The catalog repository retains the per-file report at `docs/games/releases/rooftop-radio-2026-10-27.json`.

Workbook integration was merged in [acedzn-tools PR 362](https://github.com/AceDZN/acedzn-tools/pull/362), main commit `645df6f5a9344a29023c4923310da2e57dbe0b8d`. The user's local main was fast-forwarded while preserving the pre-existing unrelated edits. The concurrent Sentence Foundry entry and its documentation were retained. No additional backend or hosting project was created.

Verification:

- All 110 game fixtures and the static game build/typecheck pass. The installed game action client captured actual jump/glide play on the final host-enabled build, with the real courier, active hand grips and city present.
- The same installed client also passes directly against the public R2 release. Its inspected gameplay capture shows the loaded courier/glider, active hand grips and city, with no game or audio error.
- The real iframe test opens all five delivery links in planning, observes ready then actual start, completes delivery 1 through normal controls and launches delivery 2. Paused reading does not consume delivery time; retries do not fabricate completion. Blocking the required courier shows an error and never reports ready.
- The same five-link test passes against the public R2 bundle through the actual Workbook rewrite. `docs/evidence/workbook/hosted-results.json` records the events.
- Desktop and 390px portrait follow the real Workbook home card to its detail page, three lesson links and delivery 4. The game reports ready/start, all required art loads, the host displays level 4, and phone controls are visible after dismissing the standard cookie banner. No JS or local HTTP failures. `docs/evidence/workbook/workbook-shell-results.json` records the result; the lead inspected the detail and both player captures.
- Catalog tests passed before integration (8) and after combining the concurrent release (9). All 9 shared lesson/analytics tests, catalog typecheck/lint, app lint and the English Games production build pass. GitHub's final discovery check passed before the merge.

Production rollout is queued in the existing English Games Vercel project. The final live check is pending.
