# Initial independent source review

Reviewed `src/content.ts` and `src/rules.ts` on 26 October 2026. Geometry follows the independent proposal at 1.5× spacing. English fixtures are original and source-aligned. Production movement and browser checks are not yet available.

## Issues for integration

Update: lead fixed the stale passage and approach/departure rule issues, compacted transfer into First/Next/Finally, and removed the inaccurate surface-variant claim. Tests were updated for explicit departure events. Remaining checks below are tracked rather than claimed complete.


1. **Past/junction evidence can be stale.** Boolean flags accept events before the relevant ordered instruction. Contract 5 necessarily passes the greenhouse and bell before returning to tune the greenhouse, so the first outbound trip could satisfy the later `Go past`/turn clauses. Scope evidence to the appropriate relay stage or reset it when greenhouse is tuned. Tests independently require fresh passage after that tune.
2. **Turn evidence is incomplete.** A junction event checks approach only. The route requires a right departure at that junction; a later loop to the correct endpoint should not silently stand in for the stated turn. Movement emission must either verify approach-and-departure or production rules must model it. Current tests only establish the present approach requirement; departure verification remains open.
3. **Transfer text complexity.** Contract 5 has three tunes but roughly six imperative clauses. It preserves the new order but is longer than the requested three-step transfer. Prefer a compact radio job with three numbered/short sentences, keeping the return and supplied heading explicit.
4. **Surface variation is currently verbal only.** `variant` changes wording of contract 5; it does not change the first signal side despite its comment. Physical target/order remains deterministic across restarts. Implement a verified semantic variant or describe this limitation honestly.
5. **Parcel replacement must reset damage.** The damage message says a new parcel is supplied, but the pure evidence remains damaged until fresh evidence. The movement/recovery path must reset this flag and preserve appropriate contract progress. This needs an end-to-end test once recovery exists.

## Evidence

`tests/independent-semantics.test.ts` encodes an explicit eight-row compass table; near/far greenhouse boundary; wrong relay recovery; ordered tuning; stale-passage counterexamples; fragile-route conditions; changed receiver/heading; and manually authored geometry traces. Hard-coded expected routes and compass values are not computed with the production helpers. Graph/extent tests do not prove actual jump/glide controllability.


Simulation follow-up: `tests/independent-simulation.test.ts` passes five input-only tests, including the complete campaign, actual heading-relative right, stage-scoped past, a deliberate narrow-beam parcel drop and successful wide-route replacement, pause time and safe fall recovery. See `SIMULATION_REVIEW.md` for remaining rendering/UI boundaries.


Final pure review follow-up: seven independent simulation tests pass after edge-to-edge ramp slopes, altitude gating and pause lifecycle changes. Antenna↔laundry down/up walking succeeds without jumping or recovery. First task “Tune the relay next to the greenhouse” correctly accepts both valid physical routes; direct glide is taught/tested separately. CURRICULUM.md reflects the final fixture and explicit parcel risk.

## Pre-GLB source audit at HEAD 1a45707

The unlocked Mac allows art work to resume; this audit did not drive Chrome. `GLB_ACCEPTANCE.md` lists the final model-visible checks that remain after integration.

A concrete Ch4 bypass is confirmed by a new input-only regression: touching the first greenhouse→laundry awning, returning to bell, then gliding the direct crossing without beam contact incorrectly completes delivery. The test expects rejection and currently fails (`success` received; 809ms focused test). The existing complete valid route remains available. The production `wide` event must represent the named awning route being completed, rather than any awning touch.

Dedicated low-wall vault evidence and actual Tripo clip mapping are still open. No additional speculative features or browser processes were added.

Latest movement follow-up: the Ch4 bypass is fixed by full northbound laundry→west awning corridor evidence. Three new independent input fixtures pass for dedicated low-wall vault, jumping away without false vault detection, and spring-awning launch→greenhouse delivery. The earlier grounded-vault source concern is therefore closed in simulation. Final imported-character visual evidence remains to be inspected separately.
