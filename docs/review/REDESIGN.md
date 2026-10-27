# Rooftop Radio delivery redesign

27 October 2026. The player found the inferred café relation, several equally wide routes, collisions and pace confusing or dull. This revision assumes short parkour deliveries while the optional preference question remains open. It changes the actual decision and traversal, not just the wording around the previous layout.

## Fixed world identity

- Water tower, greenhouse, bell tower, clock, laundry, antenna and mural retain their site coordinates.
- West roof is always **Radio Station**, identified by its blue mast. East roof is always **Café**, identified by its red canopy. No contract swaps these props or names.
- The parcel decision compares exactly two adjacent crossings between the bell roof and Radio Station: a 1.15m wooden beam at z=-2 and a 3.6m striped bridge at z=+3.3. The longer laundry loop remains exploration; it is not a member of this comparison.
- The greenhouse→bell connection becomes a real gap. Other movement/collision/pickup changes belong to the lead's simulation and scene work and need actual input verification.

## One authored source for English

`Contract.stages` and exported `activeBrief(job,progress)` in `src/content.ts` supply the current radio stage. The full planning brief is at most two sentences. Main must import this function rather than maintain a second switch of handwritten task text.

| Job | Full planning brief | Current radio stages |
|---|---|---|
| 1 First delivery | Deliver the signal to the radio next to the greenhouse. | Same sentence. |
| 2 Past the greenhouse | First, tune the greenhouse radio. Go past the greenhouse to the bell tower and tune its radio. | First, tune the greenhouse radio. / Go past the greenhouse. Tune the bell-tower radio. |
| 3 Right to the station | From the clock, face the bell tower. Turn right at the bell tower and deliver to Radio Station. | Same two sentences. |
| 4 Room for the parcel | The glass parcel needs space. Of the two crossings to Radio Station, take the wider striped bridge and deliver it. | Of the two crossings to Radio Station, take the wider striped bridge. Deliver the parcel. |
| 5 New order and approach | First, tune the bell-tower radio, then the greenhouse radio. Face the bell tower, go past the greenhouse, turn right at the bell tower and deliver to the café. | First, tune the bell-tower radio. / Next, tune the greenhouse radio. / Face the bell tower. Go past the greenhouse, turn right at the bell tower and deliver to the café. |

All are original game sentences, not quotations. The radio orders stay greenhouse / greenhouse→bell / west / west / bell→greenhouse→east. Job 3 approaches southbound and turns west; job 5 approaches northbound and turns east. The changed context is the order and traveller approach, with every landmark stable. Transfer has no solution hint; normal vocabulary remains available.

## Consequences and source scope

The saved Grade 7 modules remain the curriculum basis:

- [Places and Directions](https://english.workbook.co.il/grade-7/chapter-3/find-your-way): passage beyond a landmark, sequence, and right relative to a supplied traveller heading.
- [Travel Stories and Route Choices](https://english.workbook.co.il/grade-7/chapter-3/read-connect-choose-route): connect an explicit parcel need to a route feature, and resolve references such as its/it in a short instruction.
- [Comparing Places](https://english.workbook.co.il/grade-7/chapter-3/compare-two-places): compare the stated width of a defined pair. The text does not claim that longer, wider or shorter is universally best.

This is receptive comprehension applied through movement. It does not demonstrate productive grammar or validated learning gains. Jump/glide/burst rewards remain separate from reading assistance and rejected radio choices.

## Rule feedback

Wrong-radio feedback names the radio the player actually used and repeats the current English stage. Missing passage names the uncompleted `Go past the greenhouse` action. Missing turn asks the player to return to the bell junction from the stated approach. Missing parcel crossing points back to the two crossings and repeats `Take the wider striped bridge`. English fragments have LTR isolation inside Hebrew feedback. A mistake remains recoverable and does not silently move the player to the answer.

## Integration requirements

- Reset and camera-reset code must support west-facing job 4, including a suitable spawn point that shows both crossings.
- Main must remove the old moved-café notice and use the authored active stage. Scene props and labels must remain static.
- Physical wide-route evidence must represent a full crossing of the striped direct bridge. The old laundry-awning completion predicate no longer matches the new instruction.
- Job 1 assesses delivery to the radio identified by its relation to the greenhouse. Jump/held-glide is Hebrew movement coaching and optional execution. No English landing assessment or landing completion predicate is claimed.
- Solid architecture must match visible structures and preserve the legible route. This content/rule revision does not claim to fix scene collision or prove fun.

## Independent verification

Updated the existing `tests/independent-semantics.test.ts` in place, plus terminology in `tests/rules.test.ts`. The 29 tests in those two files pass (792ms focused suite). They preserve an independent eight-row compass table, fresh passage after greenhouse tuning, ordered radio correction, required approach/departure, intact parcel plus wide-crossing evidence, static landmark identities and exact staged instructions. Geometry fixtures retain explicit site truth and identify the greenhouse→bell gap; final two-crossing geometry and complete movement paths remain with the lead's simulation tests.

No browser was launched for this content redesign. Earlier captures and curriculum tables describe the previous version until the lead reconciles them with this revision.

## Independent physical fixtures

After the shared landmark layout and simulation compiled, `tests/redesign-physical.test.ts` added six ordinary-input fixtures. Together with the owned semantic/rule files, 35 tests passed (896ms focused suite). The burst case then gained an explicit ground-use rejection assertion and passed its focused rerun. No browser was launched and no position, level, evidence or win state was assigned.

- Complete jobs 1–3 through movement/tuning, then observe job 4's west-facing pose at x=3 on the bell roof. The wooden beam drops the parcel. Touching only part of the striped crossing and then gliding the direct route cannot deliver. Crossing the striped bridge in reverse cannot bank the required route. A full bell→Radio Station striped crossing succeeds.
- Walk along the center between the water tower's separate legs. Attempt to walk through a round foot: the authored cylinder boundary remains solid, with no recovery or invisible whole-tower box.
- Walk the café center aisle under its canopy, then attempt its kiosk side. The open aisle remains traversable; the solid side blocks passage.
- Approach the round clock plinth head-on. Its circular boundary blocks the player rather than allowing passage through the decoration.
- Reject air burst on the ground, accept one use while airborne, reject a second use during that flight, freeze position/velocity/time/charge/flow in audio pause, and recharge after an actual landing.
- Start with zero signal notes, remain stationary without earning one, then physically reach the first note at the authored course location. The same note is collected once.

The fixtures use explicit expected world poses/boundaries rather than reading expected answers from collision helper arrays. An initial café assertion asked for tighter waypoint accuracy than the input controller promises; it was corrected to check that pushing against the side does not move the player along it. No simulation bug was exposed by that mismatch. These results establish physical behavior in the simulation; final visible-model collisions, framing, fun and control feel still require the lead's browser review.

## Interactions attached to the visible landmarks

The first generic-radio arrangement still separated the action from its named landmark. The revised canonical targets are now greenhouse (-0.5,9,22.2), bell (-2.4,9,-3.3), Radio Station cabinet (-21.85,9,-4.4), and café service-counter front (14.65,9,-1.3). Water/clock remain, while the optional laundry/antenna/mural radio interactions are removed. Cabinet and counter use their visible landmark geometry rather than another small radio object/proxy.

The six physical fixtures were updated only at their ordinary-input approach points and rerun successfully (6/6,36.46s on the loaded host). Both surface variants expose exactly six interaction targets. The full parcel fixture now reaches the greenhouse and belfry radios beside the structures, then delivers at the actual blue cabinet from a reachable stand-off point. A café fixture physically reaches the service-counter interaction point before testing the kiosk side; no invisible small-radio block stops that approach. Crossing rejection/correction, open water legs/café aisle, round and box solids, burst and pickup behavior still pass.

This verifies the simulation and observable interaction locations. New browser captures must show those actions at the visible cabinet/counter; the earlier image review describes the previous radio placement. The previous mobile-control route also aimed at the old greenhouse location and needs its approach updated before its final rerun.

## Lead's final browser reconciliation

The final preview4231 keyboard campaign completes all five redesigned jobs. Frame07-width-spawn is the exact x3/time0 start and shows the comparison before movement. Current03/11 deliver at the glasshouse-adjacent radio and café counter. The independent image review confirms target/prop alignment and both choices visible. The smaller wing still masks part of the Greenhouse label at one angle, while its glass model and radio remain recognizable. The relocated radio required the old mobile controller to use the clear straight launch and then approach the new target; the final real-touch delivery and added touch burst/recharge pass. Final evidence/limits are consolidated in PLAYTEST.md and VISUAL_REVIEW.md.
