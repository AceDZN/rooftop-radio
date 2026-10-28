# Rooftop Radio curriculum mapping

Rooftop Radio has **50 numbered levels**, open without grade selection or a grade gate. It is written for Hebrew-speaking learners. The initial directions draw on real Grade 7 Workbook material; later contracts extend into instruction comprehension supported by Grade 8 and Grade 9 sources. These are suitability mappings, not a claim that the game covers a full grade or measures attainment. Spoken English, productive grammar and learning gains are not assessed.

All game sentences are original writing. The first five accepted contracts remain compatible with the five-job release. The expansion uses fixed landmark identities within each district: changing the district changes its visible names, while Radio Station/Harbor Radio/Dispatch Station/Garden Radio/Space Radio always occupy the west roof. The café equivalents always occupy the east roof. There is no café swap or `opposite` inference.

| Levels | District | Added English and route demand | Physical interpretation |
|---|---|---|---|
| 1–5 | Old Town | `next to`, `past`, ordered actions, traveller-relative right, local width comparison | Find a visible radio; pass beyond the greenhouse; approach the bell from the named roof; compare the two direct crossings over the same gap. |
| 6–10 | Old Town | Three to four ordered actions; left as well as right; `before`; named visits; forbidden landings; returning a collected packet | Actual roof landings and ordered interactions. A route may be longer because a required visit or cargo constraint matters. |
| 11–20 | Canals | Four to five actions; `without`; return legs; crossings in both directions; collect before carrying | Newly named but stable landmarks. The specified wooden beam or striped bridge must be crossed fully in the stated direction. |
| 21–30 | Market | Five to six actions; multiple exclusions; a route through a named intermediate roof; reversed approaches | A destination alone cannot complete a leg if its required passage, approach, crossing or landing is missing. |
| 31–40 | Gardens | Six to seven actions; relative clauses identifying a visible feature; `before`, `after`, `until`; parcel conditions; repeated returns | `The bridge that has stripes` selects a real crossing. `Until this inspection is complete` limits a landing ban to the current leg. A damaged parcel restarts that leg with replacement cargo. |
| 41–50 | Observatory | Seven actions throughout; embedded relative and temporal clauses; repeated ordered visits; a conditional consequence; tracking a packet across inspections and a final homeward leg | Earlier visits cannot pay for a later leg. Repeated visits need a new landing after the intervening roof. Damaged cargo and forbidden landings have different, explicit recovery rules. |

The stop-count floor does not reset at a district boundary: levels 9–15 have at least four interactions, 16–25 five, 26–35 six, and 36–50 seven. Difficulty also changes through approach, exclusions, crossing type/direction, inspection and cargo. The fifty contracts have distinct structural signatures rather than fifty paraphrases of five routes.

## Published source basis

Source content was inspected locally in `/Users/acedzn/dev/acedzn-tools/apps/english/Data/Modules/english/`. Grade 7 snapshots are also saved in `docs/curriculum/`. Links below identify the corresponding published Workbook modules.

| Source | Used in the game | Limit of the mapping |
|---|---|---|
| [Grade 7 — Find your way](https://english.workbook.co.il/grade-7/chapter-3/find-your-way) | Destination relations, `past` versus approaching, landmark-based directions, and heading-relative turns. | Movement execution and camera skill are separate from understanding a written direction. |
| [Grade 7 — Read, connect, choose a route](https://english.workbook.co.il/grade-7/chapter-3/read-connect-choose-route) | Connect information across a brief, required intermediate visits, and ordered relay actions. | Completion provides evidence of the requested route; it does not establish a learning gain. |
| [Grade 7 — Compare two places](https://english.workbook.co.il/grade-7/chapter-3/compare-two-places) | Wider/narrower as a measured feature, applied to two adjacent crossings over the same gap. | A wider path is useful for this fragile parcel; the game does not equate wider, shorter, faster or better in general. |
| [Grade 8 — Relative clauses reference](https://english.workbook.co.il/grade-8/chapter-11/relative-clauses-reference) | Read identifying clauses such as `the crossing that has stripes`, and additional information such as `Glasshouse, which has a glass roof`. The source explicitly distinguishes identifying and additional relative clauses with `who`, `which` and `that`. | The game uses thing-reference clauses. It does not test all relative pronouns, object-relative omission or punctuation production. |
| [Grade 8 — Tracking reference and connections](https://english.workbook.co.il/grade-8/chapter-9/tracking-reference-and-connections) | Follow the packet/parcel across several stages, connect `before`/`after` actions, and identify the correct landmark from an explicit reference. The source also explains why unclear comparatives or pronouns should be repaired. | Instructions deliberately name the approach roof and ban scope. Confusing language is not used as a difficulty mechanism. |
| [Grade 9 — Conditionals reference](https://english.workbook.co.il/grade-9/chapter-11/conditionals-reference) | Read the consequence `If you damage the glass parcel, you will restart this leg with a replacement`, and an instruction conditional that ties carried glass to the striped crossing. The source covers present-tense `if` clauses with a future result, modal or imperative. | Only consequential reading is practised. There is no second/third conditional, grammar-production test or Grade 9 mastery claim. |

The real Grade 9 [A Rule and Its Exception](https://english.workbook.co.il/grade-9/chapter-4/a-rule-and-its-exception) source was also inspected. Its emphasis on a narrowly stated scope informed the leg-local wording and review. The game does **not** implement a permission-note exception or claim to assess that module's complete skill.

## Original first-five contracts

| Level | Accepted English | Required interpretation |
|---|---|---|
| 1 | Deliver the signal to the radio next to the greenhouse. | Reach the radio visibly beside the glass structure. Jump/glide is Hebrew movement coaching; an alternate physical route is allowed. |
| 2 | First, tune the greenhouse radio. Go past the greenhouse to the bell tower and tune its radio. | Tune in order, then physically pass beyond the greenhouse during the new leg. |
| 3 | From the clock, face the bell tower. Turn right at the bell tower and deliver to Radio Station. | Southbound approach, westward departure; camera movement cannot change right. |
| 4 | The glass parcel needs space. Of the two crossings to Radio Station, take the wider striped bridge and deliver it. | Compare the 1.15 m wooden beam and 3.6 m striped bridge to the same roof. A full westward striped crossing with intact cargo is required. |
| 5 | First, tune the bell-tower radio, then the greenhouse radio. Face the bell tower, go past the greenhouse, turn right at the bell tower and deliver to the café. | Bell→greenhouse→café, then northbound approach and eastward right departure; names stay fixed. |

## Evidence and support

The active English stage comes from `activeBrief`. Hebrew menus and vocabulary explain terms on demand. Help and planning pause movement time. Vocabulary, hints, retries and route decisions are separate from movement scores; the tenth level of each district omits the solution hint. Assistance is not presented as unaided comprehension.

A required visit means a real landing; inspection also requires a fresh landing at the destination in the current leg. Avoidance means do not land on the named roof during that leg, rather than do not fly over it. A forbidden landing blocks the leg until the player returns to its starting roof. Cargo is carried only on stages marked fragile after collection, except the original preloaded parcel at level 4. Cargo damage returns to the previous accepted interaction and clears that leg's route proof.

`tests/campaign.test.ts` contains an independently authored fifty-row oracle, separate from the production factories. It checks all itineraries and constraints, successful semantic traces, missing-proof near misses, repeated visits, inspection, avoidance repair and cargo replacement. A separate hand-written roof graph checks topological reachability around forbidden roofs. These pure checks establish semantic consistency and route existence; actual collision timing, current district art, controls and readability require the lead's physical and browser checks. See `docs/review/CAMPAIGN_REVIEW.md` for the current verification boundary.
