# Assets and provenance

## Tripo pipeline — pending

The lead inspected target 1 before acquisition. No Tripo rig or animation fulfillment is claimed until local GLBs are inspected.

Planned requirements and exact candidate prompt are in `docs/art/ASSET_PLAN.md`.

## Current blocker observation

On 26 October 2026, initial CUA inventory found the user's Chrome extension browser but native app inventory returned: “The Mac is locked and automatic unlock could not unlock it. Ask the user to unlock the Mac manually before continuing.” After the target gate, the dedicated Chrome extension tab worked. Native access is not currently required.

## Asset inventory

No models acquired yet. No substitute model is licensed or claimed as completed art.

## Local font

Rubik variable font (Hebrew and Latin), Google Fonts official repository. SIL Open Font License 1.1 is bundled in `public/fonts/OFL-Rubik.txt`. Downloaded directly from the official `google/fonts` repository; used only as a bundled UI font.

| Runtime path | Original/optimized bytes | SHA256 |
|---|---:|---|
| `public/fonts/OFL-Rubik.txt` | 4384 | `472cbe7c25441df63e9c7864b43eb3c0f4b3df950c66a76224e6cfe1eae843fb` |
| `public/fonts/Rubik-Variable.ttf` | 359804 | `1b3a7437ba2af80e465e773ed60c5036d1ba6ace492d89046dbcf18fb31e4e88` |

Sources: https://github.com/google/fonts/tree/main/ofl/rubik ; https://raw.githubusercontent.com/google/fonts/main/ofl/rubik/OFL.txt

## Courier generation in progress

- Owned library inspected: My Assets > Rigged. Visible existing kids, goblin, raccoon, automaton and other assets did not match the commissioned courier identity. No public discovery asset used.
- Ownership basis: original generation requested in the user’s signed-in Tripo account under the commissioned game. Redistribution rights depend on the user’s existing Tripo account terms; no third-party discovered model is used.
- UI model: HD H3.1, Geometry & Texture, T-Pose checked.
- Displayed generation charge: 30 existing credits. Balance 6415 before, 6385 after. No purchase or upgrade.
- Task URL: https://studio.tripo3d.ai/workspace/generate/342b26e2-b8fc-47b8-8502-4028e939100f
- Submitted exact prompt:

> Rooftop Radio — original adolescent parkour radio courier, stylized polished 3D browser game asset, neutral T-pose with clearly separated arms and legs, compact teal jacket, terracotta shorts, sturdy trainers, lightweight radio backpack, short dark hair, welcoming expression, no wings or glider fused to body, full body, clean topology, riggable humanoid proportions, no text, no logo, no ground plane.

- Evidence: `docs/art/courier-generation-submitted.png` (5% / 117s generation state).

## Glider generation — submission outcome pending

- Exact requested prop prompt:

> Rooftop Radio — original lightweight wearable hang glider assembly only, no character. Compact brass and dark wood folding frame, elegant wide triangular teal cloth wing with cream edge panels, small terracotta radio backpack attachment at center, playful polished stylized 3D game prop, clearly separated frame rods, wing open in flight position, simple strong silhouette, no text, no logo, no ground.

- Dedicated Chrome tab: 512279447, https://studio.tripo3d.ai/workspace/generate/ .
- Displayed charge before click: Generate 30. Balance before click 6385.
- Prompt fill was visibly confirmed. Generate click timed out, followed by a tab recovery timeout, so no success or credit charge is assumed. Do not submit a duplicate before checking the owned library.
- Native fallback was deferred because the shared UI lock was owned by Critter Safari. Its lock was preserved.

## Observed access blocker after generation

The courier generation visibly completed in the owned library, but before rigging/download the Chrome extension stopped responding: Generate click on the glider and recovery of the same own tab both timed out. After acquiring the native lock, `cua.getApp('com.google.Chrome')` returned “The Mac is locked and automatic unlock could not unlock it. Ask the user to unlock the Mac manually before continuing.” The Rooftop Radio native lock was released. Rigging, animation and downloads remain open; no local GLB is claimed.

### Bounded alternative recovery

After the glider-tab timeout, a fresh CUA session attempted to reconnect the original owned courier task tab `512279441`, which had previously worked. This also timed out and reset the CUA kernel. No duplicate generation was sent and no raw API or alternate browser automation was used. The courier rig/download requirement remains open pending browser/native access recovery.
