# Independent camera, touch and audio review

Verified against the current development game at `http://localhost:5231` on 26 October 2026 with `RR_GPU=metal node scripts/browser-controls.mjs`. No native Chrome control was used. A fresh Playwright context emulated a 390×844 touch device. Observed renderer: Apple M2 Max through ANGLE Metal. This deterministic control run does not measure hardware FPS.

## Passing observations

- A real mouse drag right changed yaw from 0 to 0.28. A downward mouse drag changed pitch from 0.245 to 0.395. A touch drag right then changed yaw from 0.28 to 0.52. `C` returned yaw/pitch to 0/0.245. Route evidence stayed unchanged throughout camera operations.
- Native touch controls ran, jumped, held a glide, physically reached the greenhouse relay and tuned it. The first task completed with zero rejected relay tunes, no assistance and no recovery. The held glide capture has `gliding=true`, active `jump` clip and active grip.
- Music decoded after a user gesture and the audio context was running. Touch adjusted all three native range controls; Tab navigation followed by ArrowUp adjusted the focused music slider. Music/effects/wind values 0.51/0.58/0.21 persisted through a real page reload. Panel mute/unmute applied and persisted.
- Audio settings, pause, help, vocabulary and hint reading consumed no additional medal time. The hint recorded assistance. Restart, mute, reduced motion and fullscreen controls passed. A dispatched blur event exercised the focus-loss pause handler; this is handler verification rather than an operating-system focus transition.
- No horizontal mobile overflow. Browser errors: `[]`.

The first attempt stopped at the keyboard slider check because touch alone did not focus a native range in the emulated mobile browser. The harness was corrected to use ordinary Tab navigation before the key press; the subsequent complete run passed. The earlier `controls-failure.png`, if retained, is stale diagnostic evidence and is not the final result.

## Visual inspection

Independently opened `13-mobile-planning.png`, `14-mobile-glide.png`, `15-mobile-success.png`, `16-mobile-vocabulary.png`, `17-mobile-paused.png` and `18-mobile-audio.png`, with matching state JSON.

Planning, completion, vocabulary, paused hint and audio panels are readable at 390px width. Task English is LTR; Hebrew help/results are RTL; tuned/required progress and success time/counts display in the intended order. Audio controls have clear Hebrew labels, and the panel capture remains at time zero.

All captures report local courier+glider loaded, 65 bones, idle/run/jump_down/jump plus the derived land clip, 67 architecture instances and no asset error. The held-glide state reports equipment attached to `mixamorigSpine2` and left/right palm target errors around 0.9mm/1.5mm.

The current open glider/equipment occupies much of the upper half of the narrow gameplay frame and obscures part of the greenhouse label and approach. The lead is correcting its horizontal flight orientation. This is a remaining visual composition issue; the camera-direction, touch traversal and audio control regressions pass. These captures do not by themselves establish that the revised wing pose is visually accepted.
