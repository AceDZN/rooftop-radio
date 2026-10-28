# Independent review — fifty-level campaign

28 October 2026. Scope: authored English, district identity, pure route rules and an independent route/constraint oracle. Lead owns simulation, progression, integration and browser verification. This document does not claim fifty levels have been physically played.

## Authored result

Exactly fifty numbered contracts are exported in five districts of ten. The first five retain the accepted English and physical meaning. Later contracts vary signal, collection, inspection, parcel and return tasks, not just destination names. Stop counts rise from three at level 6 to seven at level 36 and stay at seven through level 50. Every tenth level omits the solution hint. There is no grade property or gate.

Coordinates and landmark roles stay fixed. West is the district's radio station and east is its café/tea stall; the bell and clock never swap. The nine labels differ by district and are exported through `districtSiteName`. Every turn after the initial five explicitly names the roof from which to approach the bell. This avoids the ambiguous inference that a turn after a distant mural visit must use a particular approach.

The following destination orders are independently hard-coded in `tests/campaign.test.ts`, together with start/facing and each leg's route proof, avoidance, action and cargo requirement. Codes: W water/tank, G greenhouse/glasshouse, B bell, C clock, R west radio, E east café, L laundry/cloth terrace, A antenna/mast, M mural. These are review codes, not player-facing labels.

| Position in district | Old Town | Canals | Market | Gardens | Observatory |
|---|---|---|---|---|---|
| 1 | 1: G | 11: ALBE | 21: ALRCE | 31: GECMRL | 41: GLAMCRE |
| 2 | 2: GB | 12: MRGW | 22: MRLGB | 32: RAWGBC | 42: RLGWAMC |
| 3 | 3: R | 13: CMLB | 23: RMCGE | 33: BMRLGW | 43: BCMRLGW |
| 4 | 4: R | 14: BREC | 24: BRCMR | 34: WGBRMC | 44: WGBRMCE |
| 5 | 5: BGE | 15: GCEW | 25: ECMLW | 35: CEGLAM | 45: CEBGWAM |
| 6 | 6: EGR | 16: CRLGB | 26: RLAWGE | 36: ALGBECR | 46: ALRBCEG |
| 7 | 7: GWB | 17: RAWGE | 27: GLMCRE | 37: MRLAWGE | 47: MRAWGBE |
| 8 | 8: LCE | 18: GLMCB | 28: ALRMCB | 38: GWALRMC | 48: GLRMCBW |
| 9 | 9: BRCW | 19: WGBRE | 29: CBRGEW | 39: CBRLGEW | 49: CBRGEWM |
| 10 | 10: EMGB | 20: BCMLE | 30: RMCEGB | 40: RMCEGWB | 50: ECMRLGB |

## Meaning and recovery contract

- Required visits are actual landings, recorded in order. A repeated visit after another roof requires new evidence; the global visited set is insufficient.
- Inspection additionally needs a landing at that destination in the current leg. A proximity-only radio activation cannot substitute for inspection.
- A turn requires the correct traveller approach and actual departure. Moving the camera does not supply proof.
- A crossing records bridge type and direction after the full grounded crossing. Wide east, wide west, beam east and beam west are distinct events.
- Avoidance prohibits landing during that leg. Flying over a roof is allowed. A forbidden landing blocks progress until an actual return to that leg's origin. Recovering somewhere else does not erase it.
- Route, landing, junction and crossing proof reset after an accepted intermediate interaction or a recovery. No early bridge crossing or passage prepays a later leg.
- Stage action and cargo are explicit. Glass cargo is present only on fragile stages after collection, except the original preloaded level 4 parcel. A damaged cargo leg restarts from the previous accepted interaction with replacement cargo and requires fresh proof. Damage events cannot create cargo obligations on non-cargo stages.

The concise active instruction comes from `activeBrief`. Late instructions include relative clauses that distinguish a real feature (`the crossing that has stripes`), before/after ordering, an `until` ban scoped to one inspection, and a physically consequential condition (`If you damage the glass parcel, you will restart this leg with a replacement`). These are supported by inspected published Grade 8/9 source modules listed in `CURRICULUM.md`; no full-grade alignment is asserted.

## Findings corrected during independent review

1. Distant intermediate visits did not uniquely establish a bell approach. The authored turn now says which roof to approach from.
2. Five landing restrictions initially existed only in requirements: level 15's last leg, 20's last leg, 23's fourth leg, 46's last leg and 48's first leg. The active English now states every forbidden roof. A test checks that each authored restriction and turn approach is named.
3. `Keep the parcel away from…` could be read as a flight exclusion. It now says `Do not land at…` where landing is the rule.
4. Manual replacement wording conflicted with automatic cargo recovery. It now describes restarting the current leg with replacement cargo.
5. Final inspection feedback formerly announced a delivery. It now announces completed inspections.
6. A recovery event at an unrelated roof could clear cargo damage in the pure rules. Replacement now requires recovery at the leg origin, and a counterexample preserves the damage elsewhere.

## Verification boundary

The focused semantic command is:

```sh
npx vitest run tests/campaign.test.ts tests/rules.test.ts tests/independent-semantics.test.ts
```

Reviewer verification: **190 focused tests passed** across the three files above; `npx tsc --noEmit` also passed after the concurrent art edits settled.

The independent oracle checks all fifty starts, headings, destination orders and exact stage constraints; supplies a separately authored accepted proof for each; rejects every missing mandatory proof; checks stage-local near misses; and checks every leg against a separate hand-written roof graph while avoiding its forbidden roofs. It also checks distinct contract signatures, all five task types, no grade gate, ten levels per district, stop-count floors and source-grounded advanced language in the final band.

A topological route is not a collision/playability result. The district art and simulation must still emit the agreed full-crossing, actual-landing and recovery events, and visible labels must match the exported metadata. Physical input tests and browser captures remain the lead's acceptance responsibility. No browser was launched by this reviewer for the expansion.
