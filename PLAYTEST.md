# Rooftop Radio playtest evidence

26 October 2026. Pure-input simulation, deterministic rendered capture and real-time hardware measurements are distinguished below.

## Simulation and independent semantics

41 tests across five files pass. The independent controller supplies ordinary movement/jump/glide/tune inputs and public lifecycle controls. It never writes player position, evidence, checkpoint, level or completion state.

- Direct jump/glide and a broad alternate route both reach the first relay. Both ramp directions work.
- Full campaign covers fresh greenhouse passage, southbound right=west, fragile parcel loss/replacement/full awning route, then bell→greenhouse→east with northbound right=east and café reassignment.
- Hard-coded fixtures cover all compass headings, wrong-relay correction, ordered transmission, near misses, stale evidence and actual turn departure.
- A partial awning touch followed by a direct glide is rejected. Wide-route evidence requires crossing the full laundry→receiver corridor.
- A grounded low-wall vault has distinct behavior/events. Jumping away does not falsely vault. A real drop onto the spring awning bounces and can deliver without recovery.
- Planning/help/vocabulary/audio reading freeze movement time. Campaign recovery totals remain accumulated. Events distinguish parcel drops and first decisions without student identities.
- Two skeleton-chain tests verify arm-target reach and wrist orientation through rotated parents.

## Full rendered campaign

The final preview4231 campaign at1600×900 used real keyboard events with deterministic stepping and GPU draws at capture boundaries. All five jobs completed; campaign reached `won` in92.9 simulated movement seconds with one accumulated recovery, two rejected relay tunes, no assistance and a distinct parcel-drop event. Browser errors are empty. The imported courier/glider,65 joints, actual animation names, spine socket and67 building modules were present throughout.

Current actual screenshots and matching states are in `docs/gameplay-captures`. First glide02, width choice07 and completion12 were opened and inspected. Running and side-grip development views also confirmed attached folded gear and hands at the bar. First-glide wrist target distances are below5mm; numeric distance is supplemented by actual image inspection.

The installed `develop-web-game/scripts/web_game_playwright_client.js` was rerun unchanged. A temporary local preload selected the real Metal browser backend instead of the client's hard-coded SwiftShader. Its five-second click wait expired during asset loading; the Enter action fallback then started play. The captured canvas/state show real gliding, loaded models, active grip and no error artifact, stored as18-installed-client. Earlier software-only attempts stalled under heavy shared-host load; they are not performance measurements.

## Phone, camera and audio

Actual390×844 CDP touch input completes the first mission through physical movement, held jump/glide and relay tuning. Pause/help/vocabulary/hint/restart/mute/reduced-motion/fullscreen checks pass. The blur event handler is exercised synthetically; that is not an OS app-switch test. Phone panels have no horizontal overflow and keep English LTR/Hebrew RTL.

Actual mouse drag-right changes yaw0→.28; downward drag changes pitch.245→.395. Touch-right changes yaw.28→.52. C resets0/.245. Camera movement leaves route evidence unchanged. Portrait flight pulls back/rises and centers the courier so the wing and landing fit better.

All three native sliders respond to real touch. Focused ArrowUp adjusts the range without being intercepted by movement. Music/effects/wind settings51/58/21 persist across reload, mute persists correctly, and the original local score is decoded with an AudioContext running after a gesture. Audio reading remains paused. Final `controls-results.json` has `passed:true`, preview4231 and errors[]. Captures13–18 were opened and inspected. Subjective musical taste and balance remain human judgments.

## Hardware and payload

An actual requestAnimationFrame run, without advanceTime, used the Apple M2 Max Metal renderer at1600×900 and DPR1. Seven samples measured58–60FPS,99–128 draw calls and approximately842–844 thousand triangles including shadow draws, with no browser errors. Samples are in `hardware-performance.json`. This short check does not establish performance on other devices or sustained thermal load. Deterministic captures correctly report FPS as unavailable.

`npm run build` passes. Final static output is approximately10.26MB, including the local score, Rubik and all eight GLBs. Each model is under3MB. JS is713.31kB raw /186.31kB gzip; CSS11.28kB raw /3.44kB gzip. The expected Vite large-chunk advisory is not a build failure. No runtime AI, external model/font request, server or production deployment is needed.

Art provenance, rights, source assets, native Blender projects and optimization checks are in `ASSETS.md` and `docs/art/architecture/PROVENANCE.md`. `VISUAL_REVIEW.md` records actual target comparisons and remaining stylization. Automated verification establishes behavior; it does not establish fun or learning gains.
