# Rooftop Radio playtest evidence

26 October 2026. Pure-input simulation and rendered/browser verification are distinct below.

## Verified pure state and movement

34 tests across three files pass after independent review. The independent controller supplies ordinary movement/jump/glide/tune inputs and public lifecycle controls. It never writes position, evidence, checkpoint, level or completion state.

- First direct jump/glide reaches the greenhouse relay in under 30 simulated seconds with zero recovery.
- A broad alternate route works without a precision jump. `Tune` keeps that route consistent with the English task.
- Both directions of the 10 m ↔ 9 m antenna/laundry ramp work without jumping.
- A missed glide reaches the recovery deck and returns safely without tuning progress.
- Planning, help and vocabulary freeze movement and medal time; planning→help→vocabulary returns to planning.
- Full five-contract route succeeds: fresh greenhouse passage, southbound right=west, deliberate narrow-beam parcel drop then replacement/wide route, then bell→greenhouse→east with northbound right=east and café reassignment.
- Hard-coded compass truth covers all headings, wrong relay correction, far-side near misses, ordered transmission, stale-evidence counterexamples, actual turn departure and independent route geometry.

Automated solvability does not establish fun or learning gains.

## Browser boundary

The installed `develop-web-game/scripts/web_game_playwright_client.js` was run after scene/control integration. Initial attempts hit a 30-second navigation timeout or its 5-second start-button stability timeout while the shared host reported load averages above 100. Superseded test processes belonging to this game were stopped; other crews' processes were not touched. A keyboard-start retry and supplemental real-input harness are in progress. No successful screenshot/state result is claimed until inspected below.

The pinned Playwright browser was installed normally after its first launch reported a missing Chromium executable. The supplemental harness uses keyboard/pointer events and observable-state reads; it never injects success. Software rendering uses a smaller shadow map. Hardware frame-rate claims remain open.

Pending rendered checks: full campaign success, wrong relay recovery, pause/vocabulary/hint/restart, camera independence, parcel feedback, transfer, touch inputs/layout, console errors and target comparison.

## Art boundary

Tripo courier generated; rig, clips and local GLB download blocked by observed Chrome timeout / Mac lock. All current rendering is labelled development art. Required GLB-visible browser/mobile and final visual acceptance remain open.

## Build and payload

`npm run build` passes. Static output is approximately 1.1 MB before the missing model, including a 359,804-byte local Rubik font. Measured JS: 694.61 kB raw / 180.41 kB gzip; CSS: 11.00 kB raw / 3.36 kB gzip. Re-measure after art integration; <=20 MB final initial-load acceptance is still open.
