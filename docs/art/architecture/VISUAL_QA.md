# Blender architecture visual review

26 October 2026. Three real 1280×1080 Blender beauty views were generated and opened for visual inspection:

- `casa-beauty.png`: four-window rhythm, warm cream facade, paired balcony railings and three arched shopfronts.
- `arcade-beauty.png`: three wider windows, a paler facade and one central balcony per visible face.
- `atelier-beauty.png`: ochre facade, two broad arched shopfronts and small ceramic frieze accents.

The initial casa Cycles proof established the shared direction and was approved by the lead. Inspection found excessively dark corner quoin gaps; continuous limestone backing was added before the final variants. Bevels on tiny shutter/slat edges were removed, while major sills, lintels, cornices and ashlar blocks kept geometric chamfers. The first 76k-triangle module became 38.6k without mesh simplification.

The final Eevee views show the same authored PBR geometry/materials, lights and shadows. Eevee was selected because Cycles was actively ray tracing but severely starved on the shared host. The final three renders completed successfully; they were each opened and inspected. No generated bitmap or composited stand-in is used for these proofs.

Confirmed visually: recessed dark glazing, separate teal louvres, genuine stone arch segments, iron balcony rails, softened large stone edges, restrained plaster grain, coherent terracotta roof color and shallow repeated geometric barrel tiles. Corner gaps are filled. The broad roof remains unobstructed, with decoration confined to the ±0.05 m surface tolerance.

The architecture GLBs are already supplied through the game-root-relative manifest. Actual gameplay camera/lighting and route visibility remain part of the lead's integrated visual review. The beauty views deliberately expose the module shape and material work; they do not claim to be game screenshots.
