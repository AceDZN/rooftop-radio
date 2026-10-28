# Five district environments

Art owner: 28 October 2026. Source ownership for this pass: `src/scene.ts`, new `src/district-art.ts`, this document and `ASSETS.md`. Content, simulation, course topology, UI, tests and Git remain with the lead/reviewer. No browser or Chrome was opened by the art owner.

## Runtime contract

`World.render` synchronizes appearance with `sim.district` (derived from `job.district`). The district controller exposes `setDistrict`, `registerArchitecture`, `update`, `state` and `dispose`. Switching is synchronous and uses prebuilt groups; it does not fetch assets, advance simulation, dismiss planning/pause screens or recreate the real rig, glider, city or AnimationMixer.

The same 67 detailed/distant building placements remain loaded and batched. Source building/landmark materials are registered by their original authored names, retaining references after batching. Their palette changes in place. Character/glider materials are excluded. Original materials/maps restore on returning to Old Town. PBR normal and roughness maps remain; only the roof colour map is temporarily omitted for painted slate/olive/blue finishes.

Existing crossing meshes are grouped by the exact `Surface.id` before batching. `DISTRICT_GAPS` hides each removed bridge with its attached rails/signs. The active simulation consumes the same gap list. Shared feature bounds come directly from `DISTRICT_FEATURES`; no separate art-authored physical placement list exists. Three additional skyline features per later district sit on existing northern `CITY_BLOCKS` roofs, inside their footprints.

Wind uses `sim.windLifts`, including the two base lifts and the chapter's added lifts. One fixed-capacity InstancedMesh changes its count/instance matrices; buffers are not recreated. All nine site labels use `districtSiteName`, and new laundry/antenna/mural radios use the existing detailed device builder. The actual café/station props retain their existing devices. Crate visibility uses `sim.fragile`, so staged pickup precedes carried cargo.

`World.artState()` exposes `districtId`, nested district cache/feature/material information, `windCount` and `hiddenCrossings` for screenshot/text confirmation.

## Places and progression

| Levels | Place | Visible changes beyond the sky | Shared topology |
|---|---|---|---|
|1–10|Old Town|Original warm lime, terracotta, teal timber, source landmark mural and daylight|Original crossings;2 lifts|
|11–20|Canals|Real street-level water channels and waterfront extension, animated original water normals, ivory/marine palette, slate roof finish, canal-wave mural and quay planter/landing details|1 removed crossing;3 lifts|
|21–30|Market|Striped canopy stall, timber display, warm stone/ochre light, red/saffron façade banners on existing city blocks, northern roof canopies and geometric painted mural|2 removed crossings;4 lifts|
|31–40|Gardens|Planted landing terraces, inset-soil beds and instanced authored leaves, living roofs on existing flat-roof city blocks, olive roof finish, green hills and original flower mural|3 removed crossings;5 lifts|
|41–50|Observatory|Four actual hemispherical observatories in shared envelopes, applied shutter meridians, circular roof charts, star mural, stars/moon and a readable cool evening palette|4 removed crossings;6 lifts|

District names alter landmark identities through the content source. Physical landmark coordinates stay fixed, including permanent east café and west station. Soft decoration does not mark an English answer. Roof charts, foliage and repeated banners decorate the place consistently.

## Structural correspondence

Hard boxes/platforms/planter bodies follow shared x/y/z/w/h/d exactly, with y at the bottom. Bevels remain within the box. Canopy panels occupy their shared thin overhead bounds. The foreground market canopy has four timber poles inside the lead's shared `market-stall-post-*` records; it is not suspended over an unmodelled support. Foliage, fabric banners and millimetre-scale applied graphics remain decorative. No new free-standing skyline foundations or independent building grid was added.

An observatory's lower cylinder spans `y..y+0.36h`, radius `min(w,d)/2`. Its upper hemisphere starts at `baseY=y+0.36h` and scales unit SphereGeometry by `(w/2,0.64h,d/2)`. The exact top inside the ellipse is:

`baseY + 0.64h * sqrt(1 - ((x-centreX)/(w/2))² - ((z-centreZ)/(d/2))²)`

The lead uses this ellipsoid height for dome landings, avoiding a flat invisible square over curved roof corners. Applied meridian stripes sit approximately6mm above this surface. The surrounding AABB remains a conservative solid-side envelope.

Canal water is decorative below the rooftops, above existing street paving. It does not claim a new swimming or boating mechanic; the existing recovery system remains authoritative below the course.

## Resource and verification notes

The art owner ran the real `DistrictArt` constructor and 100 transitions across five districts without a GPU browser, using a canvas-method stub solely to allocate/check mural texture lifetimes. The check verifies finite positions/normals, exactly one visible chapter group, stable geometry/material/texture identities across transitions, original roof/mural restoration and complete controller resource disposal. It does not establish actual GPU memory or visual fidelity.

Final resource check including all four market posts: 37 cached geometries, 33 materials, 36 meshes, 3,776 leaf instances and 44,186 triangles across **all five** cached groups; 70 unique owned geometry/material resources and 5 textures emitted disposal events. Only one district group renders. Shared hard feature counts are 0/6/10/6/6 for Old Town/Canals/Market/Gardens/Observatory. Four mural maps are 512×288 and the water normal is 128×128; GPU upload/mipmap overhead is not included in these source figures.

The final full-project `tsc --noEmit` and scoped `git diff --check` passed after the completed support-pole edit. The lead owns 50-level route/campaign verification and browser captures of all districts, transitions, map and mobile layout. No additional browser was started by the art owner to compete for the GPU.

## Actual capture inspection — 28 October

The art owner inspected the pixels of these lead-supplied 1600×900 WebGL captures, together with their matching JSON files, without opening another browser:

- `work/campaign-browser/district-canals.png` — level 11.
- `work/campaign-browser/district-market.png` — level 21.
- `work/campaign-browser/district-gardens.png` — level 31.
- `work/campaign-browser/district-observatory.png` — level 41.
- `work/campaign-browser/level-map-desktop.png` — the desktop campaign panel over Old Town.

All four district images use the same west-facing start on the water-tank roof, making material/light comparison straightforward. The real courier and folded glider are visible, with no obvious missing materials, detached gear or broken geometry in these idle views. The tank sits at the left and leaves the central crossing and neighbouring roofs readable. Current radio names and the active English stage fit the HUD; the longer garden/observatory stages wrap into two readable lines.

| Capture | Established by the pixels | Limits of this framing |
|---|---|---|
|Canals|Marine/slate roof finish, cool pale architecture, blue tank/greenhouse framing and distinct names such as Signal mast/Canal tank. Tile/rib detail survives the finish change.|The canal water is below the roof line and is not visible here. This frame does **not** verify water appearance, animated normals or the wave mural.|
|Market|Warm late-day light, terracotta/ochre surfaces and long directional shadows. The added stall support poles are visible on the neighbouring laundry roof.|The stall canopy is nearly edge-on, so its striped upper surface is not clearly demonstrated. Façade banners and the northern roof canopies are not prominent in this view.|
|Gardens|Olive roof/tank finishes and actual green living-roof foliage appear on the distant flat roofs and near the laundry terrace. Planting adds visible geometry rather than only a background colour change.|The main planted beds, their soil/coping detail and the flower mural are not close enough to assess. These screenshots do not establish walking/contact around those beds.|
|Observatory|A clear blue evening treatment, visible roof detail/edges, readable courier and warm pickup accents. Sparse stars and a circular roof chart are visible; the HUD remains legible.|The new domes and moon are north of this west-facing view and do not appear. Their silhouette, slit detail and dome landing contact remain outside this pixel review.|

From this single composition, the strongest differences are finish/light and the garden foliage. It would overstate the evidence to call all canal/market/observatory dressing visually verified. The art owner communicated this to the lead and recommended a downward canal street view plus a north-facing observatory view from the clock/mural area. No material visual defect requiring a source edit was identified in the supplied frames, so no source was changed during this review.

Matching JSON confirms each scene still has 67 buildings, loaded courier/glider, 65 bones and the existing clip set, five cached district groups and four mural variants, with `art.error` empty. Active district/wind/gap/feature counts match the shared data:

|District|Wind lifts|Hidden crossing IDs|Shared hard features|
|---|---:|---|---:|
|Canals|3|`antenna-laundry`|6|
|Market|4|`antenna-laundry`, `clock-mural`|10|
|Gardens|5|`antenna-laundry`, `clock-mural`, `laundry-west`|6|
|Observatory|6|`antenna-laundry`, `clock-mural`, `laundry-west`, `bell-clock`|6|

These state values confirm the intended renderer switch, not independent visual proof of every off-screen removed bridge. The captures report 172/175/173/166 draw calls respectively and deterministic-clock triangle counts of 983,374 /983,418 /1,000,518 /992,786 on ANGLE/Apple M2 Max. FPS is `null`; these are renderer counters, not measured frame-rate or GPU-memory claims. All four states are idle/grounded, so this review does not claim flight animation, moving IK or collision validation.

The desktop level panel clearly shows the 50-level campaign heading, progress count, named chapter groups and individual Hebrew level buttons over a blurred world. Levels 1–20 and the next chapter heading are visible in this crop. The remaining levels are below the fold; this still image alone does not prove scrolling, all 50 click targets or mobile usability. Those interactions remain with the lead's coordinated browser tests. No grade-selection gate is visible in this panel.

Remaining targeted visual checks: canal water, canopy stripes from above, close garden beds/mural, observatory domes/slit/moon and their curved contact, all nine landmark names from their respective roofs, and mobile composition. The lead owns the broader campaign, route, transition and phone review.

## Targeted angles and phone follow-up

The art owner then inspected four additional lead-supplied captures:

|Capture|What the pixels establish|Remaining limits|
|---|---|---|
|`work/campaign-browser/canal-flight-detail.png` — 1600×900|A cyan canal strip is clearly visible between the buildings and along the courtyard edge. The downward camera also shows the existing bridges, greenhouse and an actually deployed glider with its shadow. This establishes more than a sky/palette change.|The normal pattern is fine and regular at this resolution. A still image does not establish water animation quality or surface contact. The wing obscures much of the courier from this high angle, so exact hand contact is not independently visible.|
|`work/campaign-browser/observatory-north-detail.png` — 1600×900|Three gold dome tops are visible on the northern existing buildings, with dark meridian/shutter stripes. Their warm shape reads against the cool architecture; a circular roof chart is also visible.|The moon remains outside the frame and is **not** visually verified. This grounded view does not verify curved dome landing contact. It exposes the mural paint occlusion described below.|
|`work/campaign-browser/level-map-phone.png` — 390×844|The settled mobile campaign panel fits inside the viewport, with readable Hebrew heading/help, progress, chapter groups and large numbered level buttons in five columns. The toolbar remains visible without horizontal clipping.|Only the first 25 numbered buttons and part of the next row appear. Scrolling, all 50 click targets and touch response are interaction tests, not established by the screenshot.|
|`work/campaign-browser/level-50-phone.png` — 390×844|The current level 50 English stage wraps into four readable lines inside its top panel. Score/objective progress sits below that panel; no text overlaps it. The courier, approaching greenhouse and touch arrows/jump/air-burst controls remain visible.|This is a stationary composition. It does not establish mobile flight handling, input reach comfort, performance or the later stage messages of level 50.|

The canal capture's JSON independently reports `gliding: true`, `grounded: false`, about 0.58 seconds of glide, active `jump` animation and an active grip solver; reported hand errors are approximately 2.2 mm and 3.2 mm. This supports the lead's actual keyboard jump/held-glide capture, while the pixel occlusion limit above still applies. The observatory JSON reports level 45, idle/grounded, six wind lifts and the expected four removed crossings. Both retain 67 buildings and an empty art-error field. The two phone PNGs have no companion JSON in this review folder.

### Material issue found and root-owned correction

The north-facing observatory image shows a blank plaster mural face with ceramic waves/disc, rather than the intended Star mural canvas. The art owner traced a real depth error: the original wall extrusion/bevel reaches approximately local `z=-4.755`, while the painted plane is at `z=-4.763`, placing it about 8 mm inside the wall. This was not apparent in the earlier wide spawn views.

The issue was communicated before any source edit. The lead took ownership of the narrow `landmark-kit.ts` correction: move the painted plane and its ceramic disc/wave relief together by `+0.025 m` local Z, preserving their relative depths and leaving collision unchanged. The art owner made no source change. Successful rendering was left pending a rebuilt north-angle capture; the final reinspection below closes that item.

These added views close the earlier missing evidence for the canal strip, northern observatory silhouettes/slits and basic phone text/composition. They do not turn still-image inspection into proof of all routes, collisions, animations, mobile interactions or learning outcomes. The moon, close garden/market detail, all-nine-roof name survey and movement/contact checks remain with the lead's broader review.

### Final mural reinspection — confirmed

After the lead's successful final build, the art owner reopened the refreshed `work/campaign-browser/observatory-north-detail.png` once. The Star mural now visibly renders in front of its wall: a dark blue painted panel, gold border, connected stars and orbital curve are clear, with the ceramic disc/waves still layered above the painting. No obvious depth fighting or missing painted region is visible in this still. This confirms the root-owned 25 mm plane/relief correction and closes the observed mural-occlusion defect. The three northern dome tops and dark meridians remain visible in the same frame; the moon remains off-screen and unverified. No source edit, browser session or additional art-generation action was performed by the art owner during this final confirmation.
