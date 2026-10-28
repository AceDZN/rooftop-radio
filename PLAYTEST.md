# Rooftop Radio playtest evidence

27 October 2026. This records the parkour-delivery redesign after the human's ambiguity, collision and fun feedback. Simulation, actual input captures and real-time hardware measurement remain distinct.

## Simulation and independent review

50 tests across seven files pass. Controllers use ordinary movement/jump/glide/tune/burst inputs and public lifecycle controls; they never assign player position, evidence, level or completion.

- Static Radio Station/Café names, one authored active stage, ordered radios, fresh greenhouse passage and traveller-relative right turns have hard-coded semantic fixtures.
- The parcel starts facing west at x3. Two crossings share one gap and destination. The beam drops the parcel; a partial stripe touch, reverse traversal and direct airborne delivery cannot bank the wider crossing; a full westbound striped crossing succeeds.
- Water-tower center/open legs and café aisle remain traversable. Round feet, the clock plinth and kiosk sides block entry. The open greenhouse doorway admits the courier over its low sill; its interior benches remain solid.
- Radios sit beside the glasshouse/belfry. Radio Station uses its visible blue cabinet; café delivery uses its service-counter front. Both variants have exactly six fixed interaction targets, with no duplicate optional laundry/antenna/mural radios or invisible cabinet/counter radio boxes.
- Air burst rejects ground use, works once airborne, cannot repeat during that flight, freezes during reading pause and recharges on landing. Notes require actual physical proximity and collect once per job.
- Dedicated wall vault, spring bounce, recovery, both ramp directions, first glide, accessible broad alternate route, full campaign and accumulated totals retain ordinary-input coverage. Skeleton-chain target/orientation tests remain.

## Actual keyboard campaign

Final preview4231 at1600×900 reached `won` through all five jobs in 89.3 simulated movement seconds, with one parcel recovery, two deliberate rejected tunes, no assistance, 18 signal notes and best flow 11. Errors are empty. Correct physical passage/turn/stripe evidence was emitted; static destinations and the new adjacent radios were used.

`docs/gameplay-captures` contains refreshed actual frames and matching text. Frame07-width-spawn is the exact x=3 / time=0 parcel start, before movement; both crossing choices, labels and the blue station cabinet/mast are visible. The independent reviewer inspected it as well as the first radio beside the glasshouse and the actual café service-counter delivery. The course/landmarks are real Three.js geometry, not generated screenshot substitutes.

The installed `develop-web-game/scripts/web_game_playwright_client.js` was run with the original choreography client and a temporary preload selecting actual Metal rather than hard-coded SwiftShader. Its current canvas/state show gliding inside the wind lift, loaded 65-joint courier, correct clips, spine-mounted equipment and active real-bone grip. No error artifact was produced. Hand targets in this smaller-wing capture are within 1cm; images were inspected in addition to numbers. The minor departure-label visibility cleanup does not change movement/rules.

## Phone, controls and audio

Real 390×844 CDP touch input completes a physical jump/glide, approaches the relocated greenhouse radio and delivers successfully. The added touch air burst works, spends its charge and recharges after landing. Camera mouse-right0→.28, down-pitch.245→.395, touch-right.28→.52 and C reset0/.245 pass without changing route evidence. Reading/help/vocabulary/hint/restart/mute/reduced-motion/fullscreen handlers pass. Blur is dispatched synthetically; it is not an OS app-switch measurement.

All three native volume sliders respond to touch and focused keyboard input;51/58/21 values persist reload. The original score is decoded and the AudioContext runs after a gesture; reading freezes movement time and ducks music. Current controls result is `passed:true`, errors[]. Phone planning, glide, delivery, air-burst, vocabulary, paused and audio panels were opened and inspected. Flow and burst indicators have separate mobile positions. The old test's rightward launch aimed through a newly solid water radio; its route was corrected to the clear straight launch, matching the intended first jump.

## Hardware and payload

A real requestAnimationFrame run (no advanceTime),1600×900/DPR1 on Apple M2 Max Metal sampled 54–60FPS, 142–160 draw calls and approximately 978–982 thousand triangles including shadows. Samples and renderer string are in `hardware-performance.json`, errors[]. This short desktop check does not establish actual-phone, low-end or sustained thermal performance. Deterministic captures report FPS unavailable.

`npm run build` passes. Static output is 10,308,247bytes including all local models, font and score; every GLB remains below 3MB. Current JS is 762.29kB raw; CSS 12.27kB. The Vite large-chunk advisory is expected for this Three.js bundle. No new generation credits, backend, runtime AI, remote model/font dependency or production deployment were used.

These checks establish mechanics, clarity of the captured comparison and simulated solvability. They do not quantify a 10× fun improvement or learning gain. Human play and musical/control preferences remain the next evidence. Collision uses authored structural boxes/cylinders/top envelopes, with decorative fine wire, foliage and laundry excluded; it is not exact mesh-triangle physics.

## Workbook host integration

The full game now has110 passing tests, including60 independently authored host cases. Build/typecheck pass. A real same-origin iframe run opens all five `?level=N` planning screens, observes one ready and no fake start, launches each by UI, exercises reading/retries, and physically completes the first delivery before launching delivery2. Completion duration excludes a ten-second reading pause and duplicates are suppressed. Deliberately blocking the courier GLB produces a visible error/host error with no ready or level-start. Results and actual iframe images are in `docs/evidence/workbook/`; all normal-scenario browser errors are empty. The blocked-asset case records its expected error separately.


## 28 October 2026 —50-level campaign

All 50 authored routes passed the input-only physical driver with zero recoveries and zero rejected hand-ins. Separately,335 unit/regression cases pass (the old six-radio fixture was updated to independently assert all nine actual interaction positions). The browser completed levels 1 and 50 through real keyboard events, resumed level 2 after reload, verified all five district transitions and checked all 50 menu buttons on desktop and390px phone. A direct level 50 completion records only the earned level, without a whole-campaign claim.

The real touch route, glide, burst/recharge, camera, reading/pause, settings/sliders/persistence and first delivery all pass with no browser errors. Longer phone instructions were inspected and the flow score moved below them. Planning now shows one active leg, with the full itinerary in an optional disclosure. Art review caught a mural painting inside its beveled wall; the paint and ceramic relief move forward 25mm, with no collider change. Final fifty-link iframe and rebuilt visual checks are recorded in docs/review/CAMPAIGN_ACCEPTANCE.md.
