# Original rooftop landmark kit

Authored 27 October 2026 in Three.js by the Rooftop Radio art owner. Reuses the existing building/courier/glider assets without modifying them. No new Tripo generation, credits, external model, texture, paid asset or font. Original geometry, canvas-painted signs, clock dial and swift/radio mural; existing bundled Rubik is used for browser sign text.

## Integration

```ts
import {createLandmarks} from './landmark-kit';
import {LANDMARK_SOLIDS, LANDMARK_TOPS} from './landmark-layout';
const {group, cafe, receiver} = createLandmarks();
scene.add(group);
```

`group` contains all nine landmarks and nine planted pots. Returned `cafe` and `receiver` are already children of `group`, placed at `(18,9,0)` and `(-18,9,0)`. These positions remain static across all contracts. Each child group's origin is its roof centre. Do not add these children a second time or apply destination swapping.

`LANDMARK_SOLIDS` is pure TypeScript with no Three import. All values are world-space metres: `x/z` centre, `y` **bottom**, `h` height. Boxes have `shape: 'box', w, d`; cylinders have `shape: 'cylinder', r` and compatible `w/d = 2r` bounds. Use circular distance for cylinders where supported. `landmark` and unique `id` support debug inspection. `standable` marks selected safe horizontal tops; `LANDMARK_TOPS` supplies rectangular landing footprints and top height. A circular top uses an inscribed square. Glass roofs, curved caps and sloped awnings are not advertised as flat landing surfaces.

All hard structure, piers, glazing panels, pots, furniture bodies, equipment and mast bodies have colliders. Hollow legs and arches stay separate. The greenhouse has doorways at both ends, approximately 1.4 m clear between the frames and a 1.58 m central aisle. Its 18 cm stone sill/base is a standable surface, suitable for the lead's low step handling. Bell passage clearance is over 2.7 m; café porch's hard beams have over 2.4 m clearance. Mesh `userData.solidIds` associates physical geometry with layout IDs, retained through this module's static batching.

Thin surface mouldings, dial rims, paint, shallow applied tile details and labels are ornament of the adjacent body, rather than separate movement blockers. Flexible laundry/awning valance, fine wires, cups, pegs and soft foliage are non-solid decoration. Tiny fitted ornament may extend a few centimetres beyond the structural collision envelope. Curved overhead roof/dish collision uses short boxes or cylinder envelopes; player-height openings are preserved. Chair collision includes the low seat envelope below 46 cm; the visible chair has individual legs and slats.

## Art and location

| Landmark | Distinguishing form | Placement within its roof |
|---|---|---|
| Water tower | Small teal stave tank, brass bands, domed lid, iron legs and ladder | Back-left; tank platform 2.8 × 2.8 m, total height 4.82 m |
| Greenhouse | Open-doored Victorian glasshouse, teal glazing bars, pitched roof, pots and benches | South-west corner, leaving the west landing clear |
| Bell tower | Slender open stone campanile, curved arches, visible suspended bronze bell and terracotta cap | North-west corner; 2.6 m cornice, approximately 7.13 m total height |
| Clock tower | Round stone shaft, four cream clock faces with physical hands, copper cupola | North-west corner; approximately 7.81 m total height |
| Café | Red-and-cream scalloped awning, tiled stone kiosk, service arch, bistro furniture | Permanent east roof |
| Radio station | Blue analogue receiver cabinet, concave cream dish, two horizontal brass mast arrays | Permanent west roof, north-west of both crossing landings |
| Laundry | Shirts and towels, pegged sagging lines, wash basin and woven basket | Lines along the south edge |
| Antenna terrace | Tall narrow three-level Yagi array, teal service cabinet | South-west corner |
| Mural | Curved lime screen, original swift/sun/radio painting and ceramic relief waves | North-west edge |

Olive, rosemary and agave planters share the architectural palette. No round green low-poly placeholder crowns. Main path approaches stay open; in particular, the bell/west narrow crossing at `z=-2` and wide crossing at `z=3.3` have clear landing portals. The kit does not add path ribbons, answer beacons or changing answer colours.

## Verification and proofs

`node docs/art/landmarks-check.mjs` instantiates the real Three geometry without a browser, checks finite vertex/normal data, positive collider dimensions, every collider's associated geometry and eight actual spawn/landing probes. Results: `landmarks-checks.json`. The check exports `landmarks-proof.glb` only for review; it is not a runtime asset.

`/Applications/Blender.app/Contents/MacOS/Blender --background --threads 4 --python docs/art/landmarks-render.py` renders two real geometry proofs with lighting and shadows. These use a spaced review grid, not the game layout. The Node-only GLB omits browser-generated canvas textures, so signs and the painted mural/dial details are blank in these offline proofs; physical clock hands and ceramic relief remain visible. Runtime browser canvas supplies the actual lettering/paint. The proof does not claim playtest coverage.

The first proof caught arch triangulation and inward lathe winding defects; the final source fixes both and lowers the bell for a readable silhouette. No browser or Chrome session was launched by the art owner for this pass. Lead owns collision integration and actual in-game visual/playability review.

Final kit check: **69,107 triangles**, **190 collider associations**, **27 safe top surfaces**, **8 portal probes**. There are 28 shared materials (including the sign/paint maps), 117 mesh draws before the lead's world-wide static material merge. All nine landmarks share their base materials. The kit loads no network resources and does not change any main-building GLB.

Proofs: `landmarks-overview.png`, `landmarks-bell-cafe.png`. Reproducible source: `src/landmark-kit.ts`, `src/landmark-layout.ts`.
