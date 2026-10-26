# Independent English and route review

Reviewer role: independent of gameplay implementation. Prepared from the three saved Workbook curriculum snapshots on 26 October 2026, before gameplay source implementation. This is a proposed oracle, not a claim that any route is implemented or tested.

## Invariants that the implementation must preserve

- World compass: north is decreasing z, east is increasing x. The camera can turn freely without changing these directions.
- A right turn is relative to the specified direction of travel at the junction. Moving north: right=east. Moving south: right=west. Moving east: right=south. Moving west: right=north. Left is the inverse.
- A route instruction supplies a start, a facing/reference, a turning landmark and an action. A landmark mentioned on the way is not automatically the destination.
- `past` requires moving beyond the relevant landmark along the stated line of travel. Entering a radius around it, moving towards it, or tuning a relay on its near side does not establish this.
- Relay order is an ordered event sequence. A wrong relay must remain a recoverable choice; it cannot silently count as the requested relay, end the run, or be blocked by an invisible wall.
- `opposite` needs visible geometry across a street/open gap. `next to` needs a unique adjacent reference. Names and silhouettes identify places; color or a beacon must not encode the answer.
- A route can be shorter and narrower while another is longer and wider. The width requirement must follow an explicit parcel need. The shorter route is not declared universally worse or unsafe.
- Reading, vocabulary, help, focus-loss pause and planning never consume medal time. A hint records assistance, not failure. Transfer keeps vocabulary support but removes solution hints.
- Completion demonstrates route comprehension through movement and interactions. It does not demonstrate productive grammar, speaking mastery, validated learning gains, or Ministry approval.

## Suggested compact geometry oracle

This arrangement is an independent example the lead can adapt. Coordinates are semantic centers; final roof extents, jump ranges and recovery surfaces need a separate geometry check. `x` increases east and `z` increases south.

| Semantic site | x | z | Role |
|---|---:|---:|---|
| Water tower | 0 | 24 | South start and checkpoint |
| Greenhouse | 0 | 12 | Recognizable passage landmark and first relay |
| Bell tower | 0 | 0 | Four-way junction |
| Clock | 0 | -12 | North reference and opposite-side start |
| Café | 12 | 0 | East landmark, opposite west receiver |
| West receiver | -12 | 0 | Receiver across the junction street from café |
| Laundry | -12 | 12 | Wide detour landmark |
| Antenna terrace | -12 | 24 | Alternate low-skill connection |
| Mural | -12 | -12 | North loop and alternate crossing |

Required traversable connections: water↔greenhouse↔bell↔clock, bell↔west receiver (narrow direct crossing), bell↔café, greenhouse↔laundry↔west receiver, water↔antenna↔laundry, clock↔mural↔west receiver. The two west-receiver routes differ in geometry and length but both allow actual delivery. At least one broad, reachable route needs no precise mid-air steering. All misses have a safe deck/checkpoint.

Changing the café and receiver assignments east/west in the transfer variant, with a northbound approach, changes the correct turn without changing the word `right`. A surface shuffle alone is not sufficient transfer if the same physical destination remains correct.

## Five proposed fixtures

These are original game sentences, not quotations from Workbook. They must be updated to match the implemented map exactly before acceptance.

1. **First signal:** “Glide to the relay next to the greenhouse.” Water start, greenhouse ahead; one clear short jump/glide. A nearby relay on another roof remains a near miss. Low-skill route and optional awning stunt both reach the same relay.
2. **Past, not towards:** “First, tune the relay beside the greenhouse. Go past the greenhouse. Then tune the relay at the bell tower.” Water start facing the clock. Tuning a near-side receiver does not replace going beyond the greenhouse. Corrected order is accepted after an explorable mistake.
3. **Heading-relative turn:** “From the clock, face the bell tower. Go straight to the bell tower. Turn right. Tune the receiver opposite the café.” Southbound approach means west is right. A camera orbit cannot turn east into the right answer.
4. **Fit route:** “The glass parcel needs space. The direct crossing is narrower than the awning route. Take the wider route to the receiver opposite the café.” Explicit width constraint; a physical drop/bump risk on the narrow route is recoverable. No statement that the longer route is always best.
5. **Changed-context transfer:** café and receiver move to opposite sides, starting heading reverses. “First, tune the greenhouse relay. Go past the greenhouse to the bell tower. Turn right, then tune the receiver opposite the café.” Northbound means east is right. Required order differs from the preceding contract and no solution hint is available. Ordinary vocabulary can still pause play and is recorded.

## Independent test design

Use hard-coded compass truth for all four headings; do not calculate expected results with production turn helpers. Use traces with the correct destination but reversed relay order, a near-side landmark approach, an exact far-side boundary, a slightly insufficient crossing, wrong-but-recoverable receiver tuning, and a corrected route. Check that equivalent routes around the same roofs satisfy the same contract. Check that screen/camera heading is absent from the semantic decision.

For solvability, independently enumerate traversable connections and compare gap/height figures against declared low-skill movement bounds. Test direct and wide path lengths and widths with fixture values, then play at least one route through actual inputs. A graph reachability proof alone does not prove jumps are physically possible. No tests may set a win flag, teleport to destinations, or inject relay-completion state in browser playtests.

## Review acceptance evidence still required

- Lead content/geometry interfaces and final English fixtures.
- Pure-rule tests against independently specified truth.
- Browser input playthroughs: complete success, near miss and correction, reset, pause/vocabulary, the changed transfer contract and touch controls.
- Actual screenshots with Tripo courier visible, observed state and errors.


Implementation reconciliation: the final first fixture uses “From the water tower, face the greenhouse. Tune the relay next to the greenhouse.” The earlier proposed “Glide to” would conflict with an accepted broad no-jump path; the change keeps relation comprehension and movement instruction separate. See CURRICULUM.md for final fixtures.
