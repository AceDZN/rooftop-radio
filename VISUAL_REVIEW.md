# Visual review

26 October 2026. Generated targets are conceptual built-in imagegen outputs. Actual frames below come from the running Three.js game and real keyboard/touch input.

## Target inspection and final comparison

Both targets were generated and inspected before gameplay source. Exact prompts and built-in mode are recorded in `docs/visual-targets`. Invented solution ribbons and answer beacons were excluded because the player must interpret the English.

| Conceptual target | Actual current game,1600×900 |
|---|---|
| ![Target1](docs/visual-targets/target-1.png) | ![First glide](docs/gameplay-captures/02-first-glide.png) |
| ![Target2](docs/visual-targets/target-2.png) | ![Width-choice junction](docs/gameplay-captures/07-width-choice.png) |

The real game now has a single original Tripo courier, 65 real skeleton joints, actual idle/run/jump/jump_down clips, a derived landing segment, and a separate original Tripo glider. Original Blender modules provide geometric roof tiles, recessed windows, shutters, iron balconies, stone arches and cornices. Three lighter variants extend the neighborhood along paved streets at varied heights. The earlier capsule and plain block skyline are absent after successful loading.

The cream/terracotta/teal palette, greenhouse landing, brass radios, cloth-wing silhouette, chase view, deep streets and sparse LTR radio strip follow the targets. The fragile parcel is visible beside the folded equipment at the junction. The broad awning and narrow beam remain actual navigable geometry. Transfer props/labels change together with the English context.

## Human screenshot corrections

- Dragging right now increases heading to the right; vertical dragging changes elevation. Actual mouse and touch assertions verify direction, camera reset and unchanged route evidence.
- The exported run clip retained a large fixed Hips offset. Runtime removes horizontal root offsets, leaves travel to the simulation and grounds the toes. Equipment follows a socket under `mixamorigSpine2`, so running and turning do not leave it behind.
- The folded glider follows the spine; its deployed aerofoil keeps a stable orientation as the torso animates. Real upper-arm/forearm/wrist and finger bones pose around an added supported grip bar. First-glide wrist target distances are below 5mm; actual front/side frames were inspected as well as the numbers.
- Corrected glider facing shows its teal cloth/radio face. Flight camera pulls back and rises; the phone view gets additional distance to keep the landing approach visible.
- The distant kit originally hid its glazing inside solid walls. Its window planes now sit outside the facade; refreshed gameplay confirms dark, readable windows. Detailed module geometry was unchanged by this fix.

## Evidence inspected

Current desktop frames 02, 07 and 12 were opened and inspected, as were running-pack and side-grip development captures. The installed action client produced a real airborne/gliding canvas and matching state, stored as 18-installed-client. Phone planning, glide, success, vocabulary, paused and audio panels use real 390×844 CDP touch input. Final phone framing was inspected after the responsive flight-camera adjustment; the courier and wing are centered and the relay approach remains visible.

## Remaining visual differences

This remains a stylized game rather than a pixel match to a generated illustration. Roof landmarks and planters use simpler authored geometry than the detailed building facades. The glider is a rigid mesh with a folding transform, not a cloth simulation. The courier has no facial rig. The junction view does not show both café and receiver simultaneously; players can rotate the camera to inspect them. No answer marker is added to compensate. Automated captures do not establish how comfortable or enjoyable the controls feel to a learner.
