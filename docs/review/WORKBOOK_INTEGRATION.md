# Independent Workbook integration review

27 October 2026. Scope: new `tests/host.test.ts`, read-only review of the Workbook catalog/player and Rooftop Radio's host wiring. No Workbook source was edited by this reviewer and no browser was launched.

## Lifecycle contract

Workbook event levels are one-based, while `parseLevelParam` returns a zero-based game index. The game should report ready after a valid asset frame, start only when the player launches a planning screen, and complete only on actual simulation success. Pauses, reading, wrong radios and retries must not fabricate completion.

Read-only source inspection confirms main currently parses the level before its initial reset; calls `startLevel` only in guarded actual start; resets the host attempt on restart/campaign; reports completion from the real complete event; and schedules ready after initial rendering. The independent fixtures distinguish ready-only planning from actual play, preserve queue ordering before ready, exercise same-level retries, reject premature/mismatched/duplicate completions and validate rounded durations.

The first 55-case run had 54 passes and one failure: NaN emitted a zero-duration completion and consumed the active attempt. Required fix: ignore nonfinite or negative durations before changing completion state. The additional five pure browser-adapter fixtures pass: standalone sends nothing, a trusted parent receives the exact slug/version envelope at its explicit origin, deceptive parents receive nothing, allowed referrer fallback works, and error messages are bounded. The lead fixed the guard, and the final full host run passes all 60 cases (120ms). Invalid values are now ignored without consuming a later valid completion.

## Catalog mapping

The published English catalog contains all three source modules in Grade 7, Chapter 3. The following mapping matches the final game rather than earlier discarded place inference:

| Level | Actual comprehension decision | Module paths |
|---|---|---|
| 1 | Identify the radio next to the greenhouse | `grade-7/chapter-3/find-your-way` |
| 2 | First/then order and going beyond the greenhouse | `grade-7/chapter-3/find-your-way` |
| 3 | Right relative to the approach from clock to bell | `grade-7/chapter-3/find-your-way` |
| 4 | Compare the stated width of the two crossings for a parcel need | `grade-7/chapter-3/compare-two-places`, `grade-7/chapter-3/read-connect-choose-route` |
| 5 | Apply a new order and northbound turn to the static café | `grade-7/chapter-3/find-your-way`, `grade-7/chapter-3/read-connect-choose-route` |

These are receptive comprehension claims. Do not describe the game as productive grammar or speaking assessment. Grade 8 learners can revisit this material, but the mapping does not supply a Grade 8 source module.

Workbook's level row links use one-based `?level=N`; its iframe forwards that same value to the build's index. The five parse fixtures cover levels 1–5. The wrapper checks same-origin messages from the actual iframe plus `source=workbook-game` and matching slug. The game adapter adds version 1 and posts only to an exact permitted parent origin; it does not use a wildcard target.

The actual catalog entry was independently reviewed in `work/workbook-rooftop-integration/packages/catalog-games/src/games/rooftop-radio.ts`, with its import and registration in `packages/catalog-games/src/index.ts`. It uses the correct slug, English subject, public source repo, Grade 7 only, five contiguous level numbers and the exact module mapping above. The Hebrew skill labels describe the implemented reading decisions without productive-grammar or speaking claims. The entry currently has `release: null`, so it correctly remains unpublished until the release bundle and metadata are supplied. Its final release commit must identify the build containing the host bridge. Final catalog validation and the real hosted iframe smoke test remain the lead's integration work.


## Final reviewer result

All 60 independent host fixtures pass. The catalog mapping and registration have no review findings. The remaining integration evidence is the lead's release metadata/build and true-iframe playthrough; pure adapter stubs do not claim to verify the deployed player.
