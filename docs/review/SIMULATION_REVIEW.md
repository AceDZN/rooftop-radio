# Independent simulation review

26 October 2026. Scope: pure collision/movement simulation in `src/sim.ts`; no rendered scene or browser claim. The tests in `tests/independent-simulation.test.ts` use only normal `update(dt,input)` movement and interaction, plus public start/pause/resume/next methods. They never assign player position, level, evidence, checkpoint or completion state.

## Input paths

- Direct water→greenhouse jump, held glider and physical relay tuning. Succeeds within 30 simulated seconds with no recovery.
- Broad water→antenna→laundry→greenhouse route, detouring around the greenhouse collider. Succeeds with no jump and no recovery. This independently checks a low-skill alternative; it is slower than the direct glide.
- Planning, help and vocabulary freeze both movement and medal timer. Vocabulary records assistance. Planning→help→vocabulary→resume returns to planning without launching.
- Antenna (10m)→laundry (9m)→antenna (10m) down/up ramp traversal succeeds through analog walking, with no jump and no recovery.
- Walking into the first gap without jumping/gliding produces a fall and safe checkpoint recovery without tuning progress.
- Full campaign route: real Ch2 greenhouse tune and far-side crossing, southbound Ch3 west turn, deliberate Ch4 narrow-beam parcel drop followed by replacement and a wide route, then reversed-heading transfer with bell→greenhouse→east order.

All seven independent simulation tests pass (5.45s latest suite duration). The first full-route attempt steered diagonally toward a relay before clearing a bridge and fell repeatedly; this was a test-controller route error. The corrected path stays on the bridge centerline before steering across the roof. The full campaign then completes through normal movement and interaction, including a deliberate parcel drop, replacement and changed-context transfer.

## Source observations for the lead

- Parcel recovery explicitly clears `damaged` and `wide`, supplies a safe roof checkpoint and preserves contract state. The full input route test checks whether a replacement can actually complete afterward.
- `hint()` marks assistance and displays text but does not pause by itself. The UI must pause while that reading panel is open.
- Passage and junction evidence now requires y≥8.7 as well as x/z position, preventing recovery-deck traversal from banking rooftop route evidence. The existing full-route input test covers the valid-height path.
- Route evidence and movement are independent of camera yaw except where yaw maps input into actual world velocity. The junction approach uses velocity and departure uses the actual exit side, preserving traveller-relative right.
- Physical completion and automated solvability do not establish fun or learning gains. Browser screenshots, Tripo visibility, actual controls, touch and visual comparison remain open.


## Later source reconciliation

The first task now uses “From the water tower, face the greenhouse. Tune the relay next to the greenhouse.” This makes the accepted broad route and the direct glide semantically equivalent. The movement onboarding and first-30-second action remain responsible for teaching jump/glide; no comprehension condition is waived. Ch4 now explicitly says the parcel needs space and that the narrow beam can shake it loose. Planning/help/vocabulary lifecycle now preserves the prior planning or play mode. Added independent down-and-up ramp and planning-help-vocabulary input tests for those changes.


Actual first browser captures have now been independently inspected for English/RTL feedback (`FIRST_CAPTURE_REVIEW.md`). They are a prototype baseline and do not close the final rig/art acceptance gate. The transfer factual context is “The café has moved to the west roof.”; the receiver side must be inferred from the English relation and changed world rather than stated in Hebrew.
