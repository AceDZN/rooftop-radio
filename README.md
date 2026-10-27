# Rooftop Radio · רדיו על הגגות

A third-person 3D radio-courier game for Hebrew-speaking grade-7 learners. Jump, glide, air-burst and bounce between warm stone rooftops; English radio jobs determine which relays to tune and how to get there. Five original contracts cover spatial relations, `past`, traveller-relative right turns, route width and parcel needs, then a changed-context transfer with a new relay order and reversed approach.

## Current acceptance status

The five-contract slice uses a local Tripo courier with a real 65-joint skeleton, idle/run/jump/landing animation, and a separate Tripo glider. Original Blender building modules replace the temporary block façades. A locally composed instrumental score accompanies play, with separate music, effects and glide-wind controls.

The 27 October redesign replaces ambiguous directions with short authored stages and permanent landmarks. The parcel job presents two adjacent crossings over the same gap: a narrow wooden beam and a wider striped bridge. The station cabinet and café counter are the delivery points. A second jump/glide gap, wind lifts, one air burst per flight, collectible signal notes, landing feedback and a separate flow score give the delivery loop more movement. Misses recover quickly.

Nine original detailed landmark models share a pure collision layout with the simulation. Solid structure/furniture blocks movement; open tower legs, greenhouse doors and café aisles remain accessible. Existing paid Tripo models and original Blender building GLBs are reused. No new model-generation credits were spent. Actual verification and remaining visual limits are recorded in `PLAYTEST.md` and `VISUAL_REVIEW.md`; human fun/learning assessment remains separate.

## Run

```sh
npm ci
npm run dev       # http://localhost:5231 — strict port
npm test
npm run build
npm run preview   # http://localhost:4231 — strict port
```

Tested with Node 24.14.0 and the pinned Vite toolchain. No backend, credentials, runtime AI or account is required. Models/fonts/sounds remain local. Rubik includes its OFL license. The original local score and synthesized effects start after a user gesture.

## Controls

| Action | Keyboard / pointer | Touch |
|---|---|---|
| Move | WASD or arrows, using `event.code` | Four direction buttons |
| Jump / glide | Space; hold in the air to glide; G also glides | Hold jump in the air |
| Air burst | Shift while airborne; one charge per landing | Air-burst button |
| Camera | Drag right to look right; vertical drag changes elevation; J/L; C resets | Drag the scene |
| Deliver / tune nearby | E | Contextual destination button |
| Read / pause | P or Escape, or reading button | Pause / reading button |
| Vocabulary | Hebrew toolbar button | Same |
| Fullscreen / mute | F / M or toolbar | Toolbar |

Reading, help, vocabulary and focus-loss pause freeze movement and medal time. Wrong relays are interactable and recoverable. Falls return to the last safe roof; a dropped parcel is replaced there. Movement time is separate from assistance and route mistakes. Only minimal local events are saved, without student identities or network analytics.

## Structure and verification

- `src/course.ts`: two-crossing geometry, wind, pickups and fixed interaction locations.
- `src/landmark-layout.ts` / `src/landmark-kit.ts`: shared pure collider data and original rendered models.
- `src/content.ts`: original English fixtures, named sites and authored connections.
- `src/rules.ts`: pure stage-scoped semantic evidence.
- `src/sim.ts`: deterministic traversal, collisions, recovery and timers.
- `src/scene.ts`: Three.js materials, architecture, camera, glider and GLB/AnimationMixer integration point.
- `src/asset-config.ts`: acquired local courier and glider paths.
- `src/arm-ik.ts`: arm-chain grip pose on the real character skeleton.
- `scripts/build_architecture.py`: reproducible original Blender modules.
- `scripts/compose_rooftop_score.py`: original instrumental score source.
- `tests/independent-*`: hard-coded semantic truth and an input-only solvability campaign by the independent reviewer.
- `scripts/browser-playtest.mjs`: real keyboard/pointer browser campaign and separate actual captures; no teleport or win assignment.

`window.render_game_to_text()` describes observable state and coordinates. `window.advanceTime(ms)` enters deterministic manual stepping; `window.resumeRealtime()` restores normal animation. Both respect pause. The supplied develop-web-game action client is also used; see `PLAYTEST.md`.

## Curriculum and art

Saved Workbook snapshots and canonical links are in `docs/curriculum` and `CURRICULUM.md`. Game sentences are original fixtures, not quotations. The slice targets reading comprehension through movement, not productive grammar or speaking mastery. No learning-gain or Ministry-approval claims are made.

Exact built-in imagegen prompts and conceptual targets are in `docs/visual-targets`. Actual captures belong separately in `docs/gameplay-captures`. The target's invented solution ribbon/beacons are intentionally excluded.

## Static Vercel preparation

Import as a Vite project. Build: `npm run build`; output: `dist`. Vite uses relative paths. No environment variables or rewrite service is required for this single-page static game. No production deployment was performed.

No production deployment was performed. See the recorded browser checks and remaining visual differences before wider release.

## Workbook player integration

`?level=1..5` opens that delivery's planning screen; invalid values open the first. The version-1 host bridge posts readiness after the required local models and first rendered frame, then real launch/completion events to an allowed Workbook or localhost iframe parent. Standalone play sends nothing. Pauses, wrong radios and retries do not emit completion; durations use simulated movement time. See `docs/evidence/workbook/results.json` for the five-link, real first-delivery/next/retry and failed-model browser checks, and `tests/host.test.ts` for lifecycle/origin boundaries. The actual gameplay poster is in `workbook/poster.png`.
