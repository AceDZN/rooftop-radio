# Assets and provenance

## Tripo pipeline completed — integration review remains with lead

The lead generated and inspected built-in imagegen target 1 before asset acquisition. Both requested original Tripo assets were downloaded through the user's signed-in Chrome UI, copied locally, inspected and optimized. No public gallery model was downloaded or redistributed.

### Rights basis

The account menu visibly identified the active account as **Pro** on 26 October 2026. Both assets were generated from original game-specific text prompts in that paid account. The authoritative [Tripo Terms](https://www.tripo3d.ai/terms), last updated July 11, 2025, section 5.2.2 grants paid users rights including modification, publication, distribution and licensing of their inputs/outputs, subject to the agreement. The original prompts use no third-party character or commercial game reference. These assets are credited as original Tripo outputs commissioned for Rooftop Radio; no exclusive human-authored copyright claim is made.

The gallery search is recorded separately in `docs/art/GALLERY_SEARCH.md`. Availability in a public gallery was not treated as a redistribution license.

### Credits and operations

| Operation | Displayed charge | Result |
|---|---:|---|
| Courier H3.1 Geometry & Texture generation, T-Pose checked | 30 | Completed |
| Courier Humanoid / Mixamo auto rig | 20 | Completed |
| Preset idle / run / jump / jump_down applied | No additional charge shown for preset selection | Included in GLB |
| Glider H3.1 Geometry & Texture generation | 30 | Completed |

Total displayed paid operations for this crew: **80 existing credits**. No purchase, subscription, upgrade, agreement acceptance or credit top-up was performed. The account is shared by other crews; displayed account balances cannot be used to attribute all balance movement to this game. Balance was 6415 before the courier generation, 6385 immediately afterward, 6305 after rig processing began while other crews were active, and 6275 after the glider submission.

Two new generations total; no city/architecture generation and no third generation.

## Courier

Task: https://studio.tripo3d.ai/workspace/generate/342b26e2-b8fc-47b8-8502-4028e939100f

Rig: https://studio.tripo3d.ai/workspace/rigging/342b26e2-b8fc-47b8-8502-4028e939100f

Animation/export: https://studio.tripo3d.ai/workspace/animate/342b26e2-b8fc-47b8-8502-4028e939100f

Exact submitted prompt:

> Rooftop Radio — original adolescent parkour radio courier, stylized polished 3D browser game asset, neutral T-pose with clearly separated arms and legs, compact teal jacket, terracotta shorts, sturdy trainers, lightweight radio backpack, short dark hair, welcoming expression, no wings or glider fused to body, full body, clean topology, riggable humanoid proportions, no text, no logo, no ground plane.

- Original download: `rooftop-radio-courier-rigged.glb`, normal UI export to Downloads, then copied into `docs/art/originals/`.
- Export: GLB, 1k textures, **Export Skeleton on**, **4 animations selected**, **Animation stay in Place on**.
- Real Humanoid / Mixamo skeleton: one `Armature` skin with **65 joints**, one skinned mesh, 19,093 triangles.
- Clip names are `idle` (15.333 s), `run` (1.250 s), `jump_down` (3.708 s), `jump` (2.208 s). Each has 195 channels in both original and optimized output. `jump_down` includes a landing movement; no separate clip named `land` was available/claimed.
- Runtime path: `./models/courier.glb`, set in `src/asset-config.ts` only after skeleton and clips were inspected.
- Rest geometry is Y-up with local y approximately 0..1, x ±0.4816 and z ±0.1501, root without transform. Normalize total height to the game courier. Standard generated front is expected +Z; the lead must confirm final facing visually during integration.
- Proof: `courier-generation-submitted.png`, `courier-rig-start.png`, `courier-rig-complete.png`, `courier-export-options.png` in `docs/art/`.
- Machine-readable original/runtime inspections are in `docs/art/courier-*-inspection.json`.

## Glider

Task: https://studio.tripo3d.ai/workspace/generate/e7e09bd4-cee3-4668-bd7f-c1d21ae13786

Exact submitted prompt:

> Rooftop Radio — original lightweight wearable hang glider assembly only, no character. Compact brass and dark wood folding frame, elegant wide triangular teal cloth wing with cream edge panels, small terracotta radio backpack attachment at center, playful polished stylized 3D game prop, clearly separated frame rods, wing open in flight position, simple strong silhouette, no text, no logo, no ground.

- The first pre-unlock attempt did not submit: after access recovered, the tab still showed the unsent prompt and Ready For A New 3D Model, with no glider in the owned library. The later successful submission occurred before the human's search-first landscape steering. No duplicate glider was generated.
- Original download: `rooftop-radio-glider.glb`, normal UI GLB / 1k export, then copied into `docs/art/originals/`.
- One rigid mesh, 18,626 triangles; no rig/animation required or claimed. Opening/closing is an authored rigid transform in the game.
- Runtime path: `./models/glider.glb`.
- Y-up, wings span local X -0.5..+0.5, y 0..0.4299, z ±0.3406. The open wing sits broadly in the XZ plane, radio backpack above it. The runtime normalizes wing span to4.6m, folds it against a spine-mounted socket, and opens it above the courier. The lead verifies deployment and grip in actual gameplay.
- Proof: `docs/art/glider-export.png`; original/runtime inspections in `docs/art/glider-*-inspection.json`.

## Local model bytes and SHA256

| File | Bytes | SHA256 |
|---|---:|---|
| `docs/art/originals/rooftop-radio-courier-rigged.glb` | 1,971,568 | `042cab2c1fe934edaecf85b1ae711068657a7ed2ddec73892352da8c588f62db` |
| `public/models/courier.glb` | 1,294,924 | `391f136e4e3dc638f93ba15a7e5cfaf2a0887592a0ab80c22ccdddcd2c505e95` |
| `docs/art/originals/rooftop-radio-glider.glb` | 1,261,944 | `5cf5461824e02306a1809aa392442e4d23023ff66dc340fa449cd10364ea6f64` |
| `public/models/glider.glb` | 709,476 | `fc0e34febd1df28dc4680b7b79ab472ab400c5f194a3d62248b570ba24d96e64` |

Both runtime models are under the 3 MB target. Original source files are documentation assets, not copied by Vite into the runtime build.

### Optimization

Used the reputable npm registry package `@gltf-transform/cli@4.2.1` (output generator reports glTF-Transform core v4.5.1). Applied dedup, weld, animation resample, prune, sparse and WebP texture compression at 1024 px. Disabled flattening, joining, instancing, palette changes, geometry simplification and geometry/animation quantization. `EXT_texture_webp` is the only runtime extension; GLTFLoader supports it with the browser's WebP decoder. Skeleton count, clip names/channels and durations were checked afterward. Runtime visual animation/material review remains part of the lead's actual gameplay review.

Reproduce with:

```sh
npx --yes @gltf-transform/cli@4.2.1 optimize INPUT.glb OUTPUT.glb --compress false --flatten false --join false --instance false --palette false --simplify false --texture-compress webp --texture-size 1024
```

## Local font

Rubik variable font (Hebrew and Latin), from the official [Google Fonts repository](https://github.com/google/fonts/tree/main/ofl/rubik). SIL Open Font License 1.1 is bundled in `public/fonts/OFL-Rubik.txt`.

| Runtime path | Bytes | SHA256 |
|---|---:|---|
| `public/fonts/Rubik-Variable.ttf` | 359804 | `1b3a7437ba2af80e465e773ed60c5036d1ba6ace492d89046dbcf18fb31e4e88` |
| `public/fonts/OFL-Rubik.txt` | 4384 | `472cbe7c25441df63e9c7864b43eb3c0f4b3df950c66a76224e6cfe1eae843fb` |

## Historical access interruption — resolved

Before the human unlocked the Mac, Chrome tab automation timed out and native Chrome reported the Mac locked. No native lock was retained. After the human confirmed unlocking, the original courier tab recovered and rigging/export completed. Fresh-tab navigation remained intermittently slow; owned tabs were reacquired and actions were verified before retrying. No raw Tripo API, hidden browser state or alternate browser automation was used.

## Original modular architecture

After gallery searches and the human's explicit Blender direction, six original modules were authored locally in Blender 5.2.0 LTS. Three detailed 13×13m buildings supply recessed openings, louvred shutters, iron balconies, limestone arches/cornices and shallow geometric roof tiles. Three light distant variants supply flat, pitched and stepped silhouettes. No additional AI generation credits or third-party architecture assets were used.

Reproducible geometry, original deterministic texture maps, native `.blend` projects, per-model hashes and independently checked runtime bounds are recorded in `docs/art/architecture/PROVENANCE.md`, `art/architecture/`, and `scripts/build_architecture.py`. Main modules stay below3MB each. The scene reuses these modules around the authored rooftop collision graph.

## Original music

`Rooftop Daylight` is an original32-bar,104BPM D-major instrumental composed in `scripts/compose_rooftop_score.py`: synthesized keys, plucked strings, vibraphone, bass and quiet percussion. It contains no borrowed recording or external sample. The local runtime file `public/audio/rooftop-daylight.ogg` is Opus, approximately73.85 seconds plus codec padding,1,436,124 bytes. FFmpeg measured integrated loudness−21.8LUFS and true peak−8.8dBFS. Composition metadata and lossless intermediate master are reproducible in ignored `work/audio/`.

The background score loops after a user gesture, ducks while reading, and has its own persisted volume slider. Effects and faint glide-only wind have separate controls; continuous white-noise background was removed. No paid music service, account change or additional platform agreement was needed.

## 27 October: original landmark and course rebuild

The human chose parkour deliveries for the redesign. Nine original detailed landmarks and rooftop planters were authored in `src/landmark-kit.ts`, sharing 190 structural collision records in the pure `src/landmark-layout.ts`. These replace the earlier primitive tank, towers, greenhouse, café, station, laundry, antenna, mural and round placeholder trees. Original geometry includes bevelled masonry, open arches, a round clock/copper cupola, detailed tank/ladder, open greenhouse doors, striped café porch/furniture, a blue analogue station cabinet/dish and actual plant forms. Offline geometry proofs and source/provenance are in `docs/art/landmarks.md`.

The existing paid Tripo courier/glider and six Blender building GLBs are reused. No new generation, paid asset or external texture was acquired. Runtime canvas-painted maps are original. The course adds two adjacent crossings, wind streaks, brass signal-note pickups, detailed radio devices, landing rings and a wider bottle crate. Those are authored Three.js geometry. The complete deployed glider is now scaled 0.74 of its earlier 4.6m span (approximately 3.4m) for landing visibility; the same actual arm-chain grip follows its bar.

The structural collision layout preserves open legs, arches, greenhouse aisles and café headroom. Soft foliage, laundry, fine wire and shallow applied ornament remain decorative. Collision uses authored boxes/cylinders and top envelopes, not exact triangle-mesh contact; the limits are documented rather than claiming every tiny surface is physically simulated.
