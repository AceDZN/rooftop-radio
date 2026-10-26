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

## Campaign summary totals

The full input-only campaign now asserts that the final job has zero recoveries while campaign totals retain the deliberate parcel drop: `totals.recoveries===1`, `totals.assisted===false`, `totals.mistakes===0`. Campaign movement time exceeds the last-job time, and calling `next()` after `won` cannot double-count. The focused campaign test passes (2.959s test, 12.45s suite on the current host). Its timeout is 30s because the busy shared host exceeded Vitest's 5s default once; movement loops remain bounded.

`mistakes` currently counts rejected relay tunes. Zero here must not be described as zero comprehension mistakes: the fixture deliberately takes the narrow beam contrary to the parcel job before correcting. The recovery counter preserves that consequence; a separate parcel-route-slip local event can distinguish it from an ordinary motor fall.

## Dedicated vault and spring-awnings

Three new independent input-only fixtures pass after the movement fix (23.48s focused suite on the loaded host):

- Approach the water-roof low wall from the south, press/hold jump while moving towards it, record exactly one `vault`, retain no glider during the initial vault window, cross the wall, and land on the water roof with no recovery.
- From the same approach point, jump away from the wall. This records an ordinary jump, zero vaults, and a safe landing with no recovery.
- Walk off the water roof onto the spring awning. A real fall records one `awning-bounce` and upward velocity, without a jump input. Steer onto the greenhouse roof and tune the first relay successfully, with no recovery.

The earlier grounded-vault reachability issue is closed in simulation. Its visual animation/feedback still needs the matching local-courier capture. The Ch4 partial-awning bypass is also closed by the lead's full laundry→receiver corridor tracking; the bypass regression now passes alongside the correct full campaign. No player state, evidence or win state was injected.
