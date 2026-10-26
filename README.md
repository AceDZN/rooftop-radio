# Rooftop Radio · רדיו על הגגות

A third-person 3D radio-courier prototype for Hebrew-speaking grade-7 learners. Jump, glide and bounce between warm stone rooftops; English radio jobs determine which relays to tune and how to get there. Five original contracts cover spatial relations, `past`, traveller-relative right turns, route width and parcel needs, then a changed-context transfer with a new relay order and reversed approach.

## Current acceptance status

The playable simulation, five-contract flow, Hebrew UI, touch controls and procedural architectural scene are implemented. Independent tests complete the full campaign through normal movement and interaction inputs. Built-in imagegen targets were generated and inspected before source implementation.

**The required art pipeline is still open.** The original courier generation completed in the user's Tripo account, but Chrome control timed out and native fallback reported that the Mac was locked. Rigging, useful animation clips and local GLB download have not been completed. The runtime therefore shows an explicitly labelled development capsule. This is a working prototype checkpoint, not a claim of finished Tripo art or final visual acceptance. See `ASSETS.md`, `VISUAL_REVIEW.md` and `PLAYTEST.md` for evidence and remaining work.

## Run

```sh
npm ci
npm run dev       # http://localhost:5231 — strict port
npm test
npm run build
npm run preview   # http://localhost:4231 — strict port
```

Tested with Node 24.14.0 and the pinned Vite toolchain. No server, credentials, runtime AI or account is required. Models/fonts/sounds remain local. Rubik includes its OFL license. Sounds are synthesized after a user gesture.

## Controls

| Action | Keyboard / pointer | Touch |
|---|---|---|
| Move | WASD or arrows, using `event.code` | Four direction buttons |
| Jump / glide | Space; hold in the air to glide; G also glides | Hold jump in the air |
| Camera | Drag the scene, or J/L; C restores heading | Drag the scene |
| Tune a nearby relay | E | Contextual tune button |
| Read / pause | P or Escape, or reading button | Pause / reading button |
| Vocabulary | Hebrew toolbar button | Same |
| Fullscreen / mute | F / M or toolbar | Toolbar |

Reading, help, vocabulary and focus-loss pause freeze movement and medal time. Wrong relays are interactable and recoverable. Falls return to the last safe roof; a dropped parcel is replaced there. Movement time is separate from assistance and route mistakes. Only minimal local events are saved, without student identities or network analytics.

## Structure and verification

- `src/content.ts`: original English fixtures, named sites and authored connections.
- `src/rules.ts`: pure stage-scoped semantic evidence.
- `src/sim.ts`: deterministic traversal, collisions, recovery and timers.
- `src/scene.ts`: Three.js materials, architecture, camera, glider and GLB/AnimationMixer integration point.
- `src/asset-config.ts`: explicit courier-art gate; set only after acquiring and inspecting the local rigged GLB.
- `tests/independent-*`: hard-coded semantic truth and an input-only solvability campaign by the independent reviewer.
- `scripts/browser-playtest.mjs`: real keyboard/pointer browser campaign and separate actual captures; no teleport or win assignment.

`window.render_game_to_text()` describes observable state and coordinates. `window.advanceTime(ms)` enters deterministic manual stepping; `window.resumeRealtime()` restores normal animation. Both respect pause. The supplied develop-web-game action client is also used; see `PLAYTEST.md`.

## Curriculum and art

Saved Workbook snapshots and canonical links are in `docs/curriculum` and `CURRICULUM.md`. Game sentences are original fixtures, not quotations. The slice targets reading comprehension through movement, not productive grammar or speaking mastery. No learning-gain or Ministry-approval claims are made.

Exact built-in imagegen prompts and conceptual targets are in `docs/visual-targets`. Actual captures belong separately in `docs/gameplay-captures`. The target's invented solution ribbon/beacons are intentionally excluded.

## Static Vercel preparation

Import as a Vite project. Build: `npm run build`; output: `dist`. Vite uses relative paths. No environment variables or rewrite service is required for this single-page static game. No production deployment was performed.

Before final release: unlock Chrome, finish courier rig/download/animation provenance, replace the labelled capsule, retest browser/mobile input with that GLB visible, compare captures with both targets, and record remaining visual differences. Do not treat a procedural substitute as completed Tripo art.
