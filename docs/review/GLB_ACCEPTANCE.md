# Final review with the courier GLB visible

Prepared at HEAD `1a457079079cdad6fa608750322d7e61e6c86067` on 26 October 2026. The Mac has been unlocked and the art owner is resuming Tripo rig/download. Earlier capsule captures remain a tested prototype baseline, not final character-art acceptance. This checklist is limited to conditions that the imported asset can materially change.

| Acceptance view/action | What must be observed | Evidence to retain |
|---|---|---|
| Initial roof → run → jump/glide → tune | Local courier is visibly loaded at a sensible human scale, feet meet the authored roof, useful movement begins within 30 seconds, wing/body do not hide the landing or relay | A held-input glide frame with matching `gliding=true`, then real first-signal success; local model URL and load state |
| Idle, run, airborne and landing | A real skeleton and clips animate the body; actual downloaded clip names map to the intended states. A fallback to the first unrelated clip must not be called a complete animation set | Asset inspection listing skin/bones and clips, short real-input state sequence, capture of the courier rather than capsule marker |
| Southbound right turn | The courier's heading, visible bell junction, café and receiver match the English. Camera rotation must not change the semantic turn. New geometry must not make the broad bridge physically misleading | Ch3 approach/turn/tune state and one readable gameplay capture |
| Fragile parcel: wrong and valid route | Parcel is visible and attached plausibly. Narrow-route loss is recoverable, logged as `parcel-drop`, and a corrected full awning route can deliver. Touching one awning then gliding the direct route must not satisfy the job | Actual-input drop/replacement and full-route delivery; the independent bypass regression must pass |
| Changed-context transfer | Physical café/receiver props and English labels swap together. Only factual English context states that the café moved west; no receiver-side solution hint. The new bell→greenhouse→east order and northbound right turn remain necessary | First transfer decisions and final route state, with vocabulary/hint status retained |
| Paused reading and touch | Rig animation and character placement remain stable while reading; English is LTR, Hebrew is RTL, progress and result numbers have the right order. Touch jump/glide/interact still works with the larger silhouette | One paused/English view and a real touch completion with model visible; errors array |
| Completion | Won summary shows campaign recoveries/assistance beside campaign movement time; no development capsule or rig-pending status remains after a successful rig load | Final won capture matching JSON, including the parcel recovery |

A failed asset load should preserve an honest visible error/development state. A rig-loaded Boolean alone is not evidence that the correct animation clips or poses are playing. Existing custom browser, touch and installed action-client evidence should be rerun only where the asset/integration changes invalidate it; no new browser was launched for this preparatory review.

## Bounded source findings before import

- **Awning route evidence:** at the reviewed HEAD, any non-spring awning landing sets one sticky `wide` flag. That accepts a partial awning touch followed by a glide along the direct route. The independent input regression exercises this counterexample; scope evidence to completing the named laundry→receiver awning crossing from the laundry side.
- **Vault evidence:** a normal grounded jump consumes the buffer before the dedicated wall-vault branch tests it. Ordinary jumping can clear the low wall, but a distinct grounded vault action/feedback has not yet been demonstrated in captures or tests. Retain a real-input low-wall sequence if claiming the dedicated vault behavior.
- **Animation mapping:** current `loadCourier` requires a skin and at least one clip, while state selection uses clip-name regular expressions with first-clip fallback. Inspect the actual Tripo names before treating idle/run/jump/land as fulfilled.

## Integration follow-up

The lead integrated local courier and glider URLs and reported real-browser first-glide/tune success with audio ready. Current scene source exposes art state, maps actual `idle`, `run`, `jump`, `jump_down` clips, and derives a `land` segment from the end of `jump_down`. This is more specific than the earlier first-clip fallback; retain that derivation in asset provenance rather than calling it a separately downloaded Tripo landing clip.

The partial-awning regression passes after full corridor evidence was added. Dedicated grounded vault, jump-away negative case and spring-awning launch now have passing ordinary-input simulation fixtures. Final model-visible captures must confirm the corresponding body/wing/landing animation and readability; these source and simulation checks do not replace that observation.

## Completed integration acceptance

The original access interruption is resolved. Final preview4231 captures show the65-joint courier, actual4 downloaded clips plus derived land, spine-mounted equipment, real arm/finger grip, original glider, and67 Blender building instances. All five real-input browser jobs pass to won; final actual touch first-job completion and mouse/audio checks pass with errors[]. Frame02, frame07, frame12, phone framing and installed-client glide were opened and inspected. The wide-route bypass and vault/bounce regressions pass in the41-test suite. Final build is10,258,287bytes; actual M2 Max Metal samples at1600×900 measured58–60FPS. See PLAYTEST.md and VISUAL_REVIEW.md for the bounded evidence and remaining stylistic differences. This closes the local-model acceptance gate; it makes no learning-gain or human-fun claim.
