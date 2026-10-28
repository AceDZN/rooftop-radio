# Rooftop Radio — רדיו על הגגות

An airy third-person parkour courier game for Hebrew-speaking grade-7 learners. Run, jump/vault, spring from striped awnings, open a cloth glider, bank toward a roof, tune a brass relay and deliver a radio signal. English describes a real route, so movement and comprehension share the same world.

The first minute: read one short job while paused, launch across a safe gap, feel the glider catch air, land next to a receiver, tune it, and see a signal arc light the skyline. A missed gap drops the courier onto a recovery deck and returns them to the last safe roof within seconds.

The 6–10 minute slice has five contracts in one small district: a spatial relation, passing a landmark, a heading-relative turn, choosing a wider route for a fragile parcel, and changed landmark assignments with a reversed heading and new relay order. No answer beacons or quiz gates. Every relay can be tuned; mistaken choices yield actionable feedback and remain recoverable.

Third-person chase camera, held behind the player with a broad landing area ahead. Cream plaster, terracotta roof tiles, deep blue shadows, teal cloth, brass radios, greenhouse glass, bell tower and café; local Tripo character/glider and original authored landmarks. Strong daylight, foggy horizon, rooftop skyline, soft shadows and restrained dust/signal effects.

HUD: small Hebrew contract/progress shell, an explicit LTR English radio strip, compact glide meter, contextual interact prompt and transient landing/combo feedback. Planning, vocabulary and Hebrew help pause action and medal time. Keyboard uses event.code; pointer and touch controls offer equivalent movement/jump/glide/interact. Pause/restart/mute/reduced motion/fullscreen remain available.

Sound after a gesture: wind while gliding, warm landing thump, ascending relay tones, forgiving recovery chirp and radio completion chord. Optional movement medals measure execution separately from unaided English decisions.

Visual targets are conceptual screenshots generated with built-in imagegen. Their prompts and files live in docs/visual-targets; actual captures will be kept separately.

Visual thesis: warm stone and teal canvas suspended above a sunlit neighborhood, with the courier and next landing carrying the composition.

Content plan: a full-canvas district preview with one start action; a compact radio strip during traversal; paused Hebrew help/vocabulary; contract completion with route trace and next action.

Interaction thesis: glider opening and camera easing make takeoff legible; soft cloth/antenna motion gives the neighborhood life; signal rings and a landing squash confirm momentum. Reduced motion removes camera shake, swoop and incidental motion.

Target inspection: both images inspected by lead before gameplay implementation. Target 1 establishes depth, materials, wing silhouette and greenhouse occupancy. Its invented solution ribbon and gold target beacons are deliberately excluded because they bypass the English. Target 2 establishes visible route width choices and a recovery deck, with an appropriately restrained radio strip. The two images differ in courier styling; the acquired original Tripo courier will be the single runtime identity.


27 October redesign: lead with short parkour deliveries, as selected by the human. Remove the opposite/café puzzle and physical prop swapping. Keep Radio Station west and café east; compare exactly two side-by-side crossings of one gap. Name the current stage briefly, and put interactions at the actual cabinet/counter or beside the referenced model. Two central jump/glide gaps, visible wind lifts, a once-per-flight air burst, optional signal notes, separate flow scoring and quick recoveries make movement the repeated action. Nine original detailed landmarks replace the primitive models, with shared visible-solid collision data. The wider glass-bottle crate makes the parcel's need for room visible. Shrink the deployed glider to preserve landing visibility. Human enjoyment remains a playtest question, not an automated-test conclusion.


## Current campaign —28 October 2026

The accepted five-job slice is expanded to 50 numbered levels across five districts. Progression, not a selected school grade, determines increasing route and English complexity. Early one-step delivery grows into seven-stage inspections, collection/return jobs, fragile cargo transport, exact ordered landings and routes with explicit landing exclusions. Each active leg stays concise; the full itinerary can be read while paused. Every level can be opened/replayed through the campaign map and Workbook deep links; local progress marks only earned completions. Existing owned character/building assets are reused, with district dressing, progressively removed walkways, stepping surfaces and visible updrafts sharing their collision data.
