# Original modular architecture for Rooftop Radio

Created in Blender 5.2.0 LTS from original authored geometry and deterministic PBR images using `scripts/build_architecture.py`. No third-party city, model, image, texture, material library or new AI generation is included. The human explicitly requested distinct individual buildings assembled as modules and authorized Blender creation.

## Integration contract

- Each module is centered at the origin in X/Z after standard glTF Y-up export.
- Footprint: 13×13 metres, including cornice and balconies.
- Roof collision plane remains authored by the game at Y=9 metres. Real shallow barrel tile geometry reaches Y=9.035 metres, within the ±0.05 metre visual tolerance.
- The central X/Z ±5 metre roof area contains no raised solids. All windows, shutters, arches, balconies and cornices remain below the landing.
- Ground is Y=0. Main modules are 9 metres high; game integration can scale Y by 10/9 for the existing 10 metre roofs.
- Meshes are joined by material to control draw calls. No baked scene/collision geometry replaces the authoritative gameplay graph.
- All local texture maps are in `art/architecture/textures/`. These are authored by the script from deterministic mineral grain, layered mottling and wood grain functions.
- `.blend` authoring/proof projects are in `art/architecture/`. Runtime GLBs are in `public/architecture/`.

## Reproduction

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/build_architecture.py -- --all --render
```

The architecture supports the existing generated screenshot targets through cream plaster, honey limestone, teal louvred shutters, recessed openings, wrought iron balconies and geometric terra-cotta tiles. Actual gameplay comparison remains the lead's integration responsibility.

## Module family

- `casa`: four-window rhythm, three arched shopfronts and paired upper iron balconies; warm lime plaster.
- `arcade`: three wider windows, classical arched stone lunettes and pale plaster.
- `atelier`: two broad shopfronts, ceramic frieze accents and ochre plaster.
- `distant-flat`, `distant-pitched`, `distant-stepped`: matching silhouettes/window rhythm, each below 2,000 triangles, with texture-free materials for distant scenery. Pitched and setback silhouettes are background only and are not landing/collision modules.

The variant plaster materials have distinct names and authored image sets so material-name deduplication during game integration cannot erase the intended facade variation. Shared stone, tile, teal wood, iron and glazing names deliberately match between detail modules.

The authoring script batches all detail parts into one final Blender mesh per material. Sub-pixel bevels are omitted while larger cornice/sill/ashlar bevels remain geometric. Background meshes use color/roughness values matching the main materials without loading texture maps.

## Verified runtime budget and hashes

All six GLBs passed the independent glTF accessor/node-transform bounds check in `check_geometry.mjs`. It accounts for normalized quantized accessors, verifies the 13×13 metre footprint and source floor, enforces the main roof height tolerance, enforces under 2,000 triangles for distant modules and under 3,000,000 bytes per runtime file.

| Runtime model | Bytes | Triangles | Material draws | SHA256 |
|---|---:|---:|---:|---|
| `casa.glb` | 1,920,808 | 38,556 | 7 | `d97a095c359c056fceecd13f0eef561c16869e751766dd1966341b083e653a46` |
| `arcade.glb` | 1,690,940 | 33,580 | 7 | `7639c63daafcb6ead5d6c077ab199010b2cb74249912832090fb272fca10d6a5` |
| `atelier.glb` | 1,826,660 | 36,584 | 8 | `5fb70759691a5297601e5146e02db5652a8cec23bedf39586541833d5daa7ea4` |
| `distant-flat.glb` | 95,140 | 1,764 | 4 | `acdc45a3752e73fde4914aec309a14b904e93e7ccf25c0646846ce932117ba6a` |
| `distant-pitched.glb` | 95,476 | 1,770 | 4 | `44973d0d9b2ee992dd15bb1545b94ea188ee00365ff43b1943620e7e7b15e8bc` |
| `distant-stepped.glb` | 98,400 | 1,824 | 4 | `9cf86458745f424c01fa68df76ed8352b315c4d26ac1cb39da82568dcc7574a8` |

Total architecture download: **5,727,424 bytes**, before HTTP compression. Runtime files have no external texture requests. Detail maps are embedded WebP; distant materials contain no images.

## Optimization

Pinned `@gltf-transform/cli@4.2.1` applies deduplication, welding, lossless animation resampling/pruning, WebP maps and `KHR_mesh_quantization`. No triangle simplification, palette merging, flattening or material merging was used by optimization. It preserves the authored silhouette, all window recesses and actual geometric details. Normalized integer positions require dequantization before any custom static mesh merge; Three.js GLTFLoader displays them directly. The game integration owns static merge handling. `EXT_texture_webp` is the only other extension.

`--all --render` now reproduces geometry, packed native projects, optimization, checks, the integration manifest and three real beauty proofs. `--all --proof-only` rerenders the saved main projects without rebuilding the runtime assets. The initial style proof used Cycles with four CPU threads, 24 samples and denoising. Final variant proofs use Blender Eevee with four CPU threads capped for scene processing; this avoids resource starvation on the shared host while retaining real PBR geometry, lights and shadows.

## Distant LOD window correction

Actual first-glide capture review exposed a geometry bug: the low-detail facade uses a solid plaster wall, but its glazing retained the detailed building’s recessed depth and was occluded. The 44 window/arched-shop glazing components on each distant module were moved just outside the facade plane (absolute local facade depth 5.985 m versus the wall face at 5.95 m). Their untextured base color is now linear RGB (0.012, 0.030, 0.040) with roughness 0.90. The small setback clerestory was already outside its own wall and was preserved.

This narrow correction uses `art/architecture/fix_distant.py` on the three existing native projects. No main module, new asset, credit use, architecture placement or browser test was changed. Source generator conditionals now reproduce the same visible distant panes. All six runtime bounds/size checks still pass; the three main module SHA256 values were asserted unchanged.

The existing flat / pitched / stepped assets remain 9 / 10.8 / 10.22 metres high. More varied skyline heights can be created by scene placement using Y scales 0.75, 0.95, 1.15 and 1.35 across the same three models; placement remains owned by the lead.
