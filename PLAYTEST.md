# Rooftop Radio playtest evidence

26 October 2026. Pure-input simulation and rendered/browser verification are distinct below.

## Verified pure state and movement

35 tests across four files pass after independent review. The independent controller supplies ordinary movement/jump/glide/tune inputs and public lifecycle controls. It never writes position, evidence, checkpoint, level or completion state.

- First direct jump/glide reaches the greenhouse relay in under 30 simulated seconds with zero recovery.
- A broad alternate route works without a precision jump. `Tune` keeps that route consistent with the English task.
- Both directions of the 10 m ↔ 9 m antenna/laundry ramp work without jumping.
- A missed glide reaches the recovery deck and returns safely without tuning progress.
- Planning, help and vocabulary freeze movement and medal time; planning→help→vocabulary returns to planning.
- Full five-contract route succeeds: fresh greenhouse passage, southbound right=west, deliberate narrow-beam parcel drop then replacement/wide route, then bell→greenhouse→east with northbound right=east and café reassignment.
- Hard-coded compass truth covers all headings, wrong relay correction, far-side near misses, ordered transmission, stale-evidence counterexamples, actual turn departure and independent route geometry.

Automated solvability does not establish fun or learning gains.

## Browser boundary

The installed `develop-web-game/scripts/web_game_playwright_client.js` was run after scene/control integration. Initial attempts hit navigation/start-button timeouts under shared-host load above 100; superseded test trees belonging to this game were stopped. The final per-frame software-rendering attempt ran for 6 minutes 41 seconds without producing a screenshot/state file, while host load rose above 170. Its owned process tree was stopped. After separating exact simulation updates from throttled GPU capture draws and retaining the drawing buffer, a bounded retry completed. Its click-start stability wait timed out, but the documented Enter fallback started play. `18-installed-client.png` and its matching state show an airborne player with `gliding:true`; the screenshot was opened and inspected, and no error artifact was emitted. The supplied client captures the WebGL canvas; full HUD evidence is in the supplemental captures below.

Supplemental real-input browser verification passed at 1600×900. Every contract reached `success`, and the campaign reached `won`; `browser-errors.json` is empty. Inputs were real keyboard events, with deterministic stepping and GPU drawing at capture boundaries. No player position, evidence, level or win state was assigned. The first signal corrected a deliberately wrong relay, then completed by jump/glide in 7.75 simulated seconds. The transfer corrected a wrong early relay, followed the changed order and east receiver without vocabulary or solution hint. The fragile job physically dropped/replaced the parcel before completing the awning route. This verifies behavior, not a learner's unaided understanding. The `mistakes` counter counts rejected relay tunes; parcel contact and recovery are separate. Narrow-crossing parcel drops emit a distinct local `parcel-drop` event, without claiming why the player chose that crossing.

Actual captures and matching observable states are in `docs/gameplay-captures`: `02-first-glide`, `04-past-greenhouse`, `06-right-turn`, `07-width-choice`, `08-parcel-recovery`, `09-wide-route`, `10-transfer-junction`, `11-transfer-success`, and `12-campaign-complete`. Images were opened and inspected. Review fixed behind-player sign occlusion, tower placement, RTL progress, invisible first-frame completion-panel captures and the English-only transfer context. The final campaign panel uses accumulated recoveries/assistance rather than the last job's values; the final review asserts one recovery and two rejected relay tunes across the actual route.

Mobile verification passed at 390×844 using actual CDP touch events: direction controls, held jump/glide, physical relay tuning and first-contract success (5.5 simulated seconds, no recovery/mistake), camera drag without changing route evidence, pause, hint/help/vocabulary time freeze, restart, mute, reduced motion, fullscreen and focus-loss pause. `controls-results.json` has an empty error list. Captures `13`–`17` were inspected; vocabulary and controls fit without horizontal overflow. Sound state was tested; subjective sound balance remains a human playtest task.

The pinned Playwright browser was installed normally after an initial missing-executable error. Software rendering uses a smaller shadow map; captured frames measured about 23–26 thousand triangles and 107–145 draw calls depending on state. Deterministic capture mode reports FPS as unavailable. Real-hardware performance and fun/learning-gain claims remain unverified.

## Art boundary

Tripo courier generated; rig, clips and local GLB download blocked by observed Chrome timeout / Mac lock. All current rendering is labelled development art. Required GLB-visible browser/mobile and final visual acceptance remain open.

## Build and payload

`npm run build` passes. Static output is 1,072,584 bytes (about 1.1 MB) before the missing model, including a 359,804-byte local Rubik font. Measured JS: 696.40 kB raw / 181.07 kB gzip; CSS: 11.03 kB raw / 3.38 kB gzip. Re-measure after art integration; <=20 MB final initial-load acceptance is still open.

Final fresh review passed after the façade/summary changes: campaign `won`, 93.2 simulated movement seconds, one accumulated recovery, two rejected relay tunes, no assistance, a distinct local parcel-drop event and an empty browser error list. Current `07` and `12` images were opened and inspected.
