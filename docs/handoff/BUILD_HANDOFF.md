# Rooftop Radio — רדיו על הגגות

Read COMMON.md first. Build only in /Users/acedzn/dev/AceDZN-exp/rooftop-radio, public AceDZN/rooftop-radio, main. Dev 5231 / preview 4231. This is a new game, not an extension of Goblin Kitchen/Clockwork Alibi/Rule Rascals.

## Game promise

An acrobatic radio courier crosses a small sunlit rooftop neighborhood: run, vault a low wall, spring off an awning, open a cloth glider and skim a gap, bank into a landing. The player reads a short English radio job, chooses a route and then executes it skillfully. Keep an immediate retry checkpoint so a missed jump is funny and costs seconds rather than restarting the whole lesson. Single-player; no city-scale sandbox or multiplayer.

The first 30 seconds MUST contain a satisfying jump and glide, not a long explanation. Prioritize acceleration, steering, generous jump buffering/coyote time, reliable ledges, momentum, camera and a forgiving landing. One compact authored district with two elevations, about eight recognizable landmarks and multiple traversable connections. Movement comes first; no delivery menu that teleports between roofs.

Abstract inspirations: A Short Hike's traversal/soaring and Crazy Taxi's route choices/combo urgency. Original urban silhouette and protagonist. This round was chosen from the measured backlog; centroid NN .799/isolation16.9% is not a novelty score for this game.

## English through actual movement

Grade 7 sources in docs/curriculum:
- find-your-way: https://english.workbook.co.il/grade-7/chapter-3/find-your-way
- read-connect-choose-route: https://english.workbook.co.il/grade-7/chapter-3/read-connect-choose-route
- compare-two-places: https://english.workbook.co.il/grade-7/chapter-3/compare-two-places

Original sample brief: “From the water tower, face the clock. Go past the greenhouse. Turn right at the bell tower. The receiver is opposite the café.” Start position, facing and every landmark are unambiguous. Distinguish past from towards and landmark from destination. Right is relative to the specified traveller heading at the turn, never arbitrarily screen-right. Camera changes must not change the meaning. Do not equate shortest with safest/best.

Jobs may require physically tuning two relay rooftops in a specified order before returning the receiver; this naturally makes the route matter even when the final landmark is visible. Every relay is interactable; no omniscient path ribbon or highlighted correct target. Landmarks have readable names and distinct shapes, not answer colors. Optional compass/route sketch records only visited information. No full Hebrew solution always pinned beside English.

Read/translate/replay English while time is paused. Optional run medal timer starts only when leaving planning and stops on pause. A wrong turn is explorable and recoverable; don't create invisible answer walls. At delivery, show a short route trace and relevant English phrase if a required relay was missed. A request may be clarified without pretending it was unaided.

## Five challenges

1. First signal: two nearby roofs and one glide, a one-step destination described by a location relation. Safe recovery deck below.
2. Past, not towards: two similar receivers, cross beyond a named landmark before tuning the second relay. A wrong nearby relay can be corrected.
3. Turn relative to travel: approach the same junction from the opposite side; starting-facing arrow and repeated English reference prevent screen-direction ambiguity.
4. Choose a fit route: a shorter narrow route versus a longer wide route; a fragile parcel needs the wide path, so fastest distance alone is insufficient. State constraints explicitly in the job and implement actual recoverable drop risk.
5. Transfer: changed landmark assignments and reversed starting heading, new relay order, three-step English job, no solution hint. Ordinary vocabulary support remains available but is recorded.

Build and play one complete challenge before widening the map. Every route has an independent graph/geometry oracle, reachable landing surfaces and a viable low-skill path. Tests cover right/left under each start heading, ordered relay visits, near-miss landmarks, pause timers and recovery. At least two valid physical paths may satisfy a contract; optional stunt/combo medals reward movement separately from comprehension. Avoid the exact same solution every run.

## Identity and screenshot targets

Third-person chase camera with player/landing ahead visible; airy cream stone and terracotta roofs, deep blue shadows, cloth awnings, brass rooftop antennas and a readable skyline. Bright daylight, expressive runner, animation and cloth motion, restrained HUD. Not the toy-isometric table used in the other games. Menus/help Hebrew, English radio strip LTR.

Target 1 prompt:
Use case: ui-mockup. Asset type: gameplay screenshot design target for an original real-3D browser game, 16:9. Rooftop Radio: a third-person parkour courier has just leapt from a sunlit terracotta roof and opened a compact cloth glider, banking toward a greenhouse roof above an airy narrow street. Show a reachable awning bounce, a brass relay and a bell tower farther along; strong depth, believable browser-game geometry, shaded materials and readable landing. Minimal Hebrew HUD shell, a small English radio strip reading “Go past the greenhouse.”, compact glide stamina and a landing/combo indicator. The useful action occupies most of the image. Original adolescent-friendly character and city, no existing game branding, no poster title, no worksheet, no oversized cards. This is a conceptual target, not an actual running-game capture.

Target 2 prompt:
Use case: ui-mockup. Asset type: a second 16:9 gameplay target of the same Rooftop Radio art direction and courier. Show an actual roof junction decision from behind the courier: a narrow direct crossing and a wider awning route, fragile parcel secured on the courier, a bell tower as a reference and a receiver opposite a café. A small LTR radio strip says “Take the wider route.” The glider is folded, runner is landing with momentum, a small recovery deck can be seen below. Keep most of the view as navigable 3D play space, matching the first camera/materials/HUD. No correct-route arrow or answer beacon. No promotional title.

Generate through built-in imagegen before gameplay source. Save and inspect both.

## Tripo assets

Inspect owned assets first. Max three new generations: (1) distinctive courier in a neutral riggable pose, separate limbs, compact clothing, no fused glider; rig in Tripo for idle/run/jump/land, (2) lightweight backpack/glider assembly suitable for attaching to the rig, (3) an iconic greenhouse/antenna landmark if useful. Architecture, cloth surface, colliders and relay interaction markers can be procedural. Animated courier body must use a real rig/animation asset; glider opening can use authored rigid transforms. Record provenance and visible animation clips; no commercial game art.

## Acceptance

Real route traversal with jump/glide/vault, checkpoints, at least five contracts, English-dependent decisions and an unaided changed context. No quiz gates. Live GLBs/rig visible in actual play. Match the generated camera/occupancy/HUD, browser-play success/failure/recovery/mobile controls, verify semantics independently, commit/push main. COMMON.md defines remaining controls/testing/doc requirements.

