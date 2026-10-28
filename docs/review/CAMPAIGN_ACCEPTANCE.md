# Fifty-level campaign acceptance

28 October 2026. The owner requested a regular progression of about 50 levels, suitable for increasingly advanced English, with no grade selector or grade-based limit. The game now has exactly 50 numbered levels and five ten-level districts. The existing owned courier, rig, glider and architecture are retained; no generation credits were spent.

Difficulty grows from one-step deliveries to seven-stage routes, with declared approaches, left/right turns, ordered landings, directional bridge crossings, inspections, collect/return jobs, fragile cargo and explicit landing exclusions. Districts share the city grid but change their names, dressing, lighting, removed walkways, stepping surfaces and updrafts. They are themed course variants, not fifty independently modelled maps.

Progress is local to the device. The map offers all 50 levels, completed badges, best results and the next unfinished level. Explicit links override the saved selection. Finishing a direct link to level 50 earns that level alone; the final summary does not invent earlier completions. Grades7–9 in Workbook describe matching lessons rather than limiting access.

## Verification

- All 50 contracts pass the input-only physical driver: normal movement, jump/glide and interactions produce success with zero recoveries and rejected hand-ins. No positions, route proofs or wins are assigned by the driver. The complete run is retained in `docs/evidence/campaign/physical-routes.log`.
- The335 remaining unit/regression cases pass, including 190 independently authored content/semantic fixtures, all 50 query links, lifecycle bounds and persistent progress. Together the runs cover 385 passing tests. `npm run build` passes on the final source.
- A real browser completed levels 1 and 50 through keyboard events, saved only earned completions 1 and 50, resumed level 2 after reload, switched all five districts, and selected level 50 on a 390px phone. No JS or local HTTP errors. The audio-panel → map → close chain preserves its original paused state.
- The actual same-origin iframe matrix opens all 50 links with the right district/models/wind count, reports ready then actual launch, and checks pause/retry ordering. Real delivery 1 completes and launches 2. A required-model failure reports an error and never reports ready. All 51 scenarios pass.
- Physical touch traversal, held glide, successful first delivery, burst/recharge, drag camera/reset, settings/sliders/persistence, pause/help/vocabulary, restart, fullscreen and focus loss pass with no browser errors.
- The installed game action client was rerun and its real glide/state capture inspected. Desktop and settled phone maps, late phone instructions, all district start views, a canal flight view and a north-facing observatory view were inspected. Longer instructions no longer overlap the phone flow score. Planning shows the current leg with the full itinerary folded by default; the disclosure opens through touch.
- Art caches pass 100 district transitions with a stable geometry/material/texture inventory and full disposal. The north view exposed a mural paint plane behind its beveled wall; moving the painting and ceramic relief forward 25mm makes the star painting visible, without changing collision geometry. The moon remains outside the reviewed views.

The source and authored fixture reviews do not establish human enjoyment, grade mastery or learning gains. The runtime download remains the local asset bundle; there is no backend, runtime AI or separate hosting project.

The Workbook catalog/release follow-up is recorded with the final version and source commit in its release manifest. Existing older evidence documents the five-level release and remains historical.
