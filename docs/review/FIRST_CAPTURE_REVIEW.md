# Independent review of first actual captures

Reviewed `01-planning.png`, `02-first-glide.png`, `03-first-signal.png` and their matching JSON on 26 October 2026. These are actual development captures with an explicit capsule/rig-pending marker. They do not establish fulfilled Tripo integration or finished art.

## What the learner sees correctly

- The first task matches the agreed fixture: “From the water tower, face the greenhouse. Tune the relay next to the greenhouse.” The planning card displays English left-to-right and readable Hebrew title, launch action and help controls.
- The radio strip repeats the English task during movement. Landmark names use English and distinct visible architecture supports the names.
- The JSON records a real first-signal success at the greenhouse relay, with one preceding wrong relay choice, zero recoveries and no assistance. This is a corrected attempt, not first-try unaided accuracy. Movement and comprehension evidence must remain distinct.
- The model status is honest in both visible development text and JSON; no completed courier art is claimed.

## Actionable English/feedback findings

1. **Transfer gives away a relation answer.** The current planning notice says in Hebrew that the café moved west and the receiver is now east. The second clause directly supplies the physical destination of `receiver opposite the café`, weakening the no-solution-hint transfer. Keep only a context announcement such as the English “The café is now on the west roof.” Let the English job and changed world supply the receiver relation. No always-pinned Hebrew solution is needed.
2. **Wrong-relay wording is unclear.** The visible toast “הממסר הזה שודר. בדקו שוב את סדר התחנות בהודעה.” is awkward and refers only to order even in the one-target first job. A clearer recoverable message is: “זה לא הממסר הדרוש בשלב הזה. בדקו שוב את תיאור המקום או את סדר התחנות בהודעה.” It does not reveal the answer.
3. **Check mixed-language feedback isolation.** The production feedback text includes `Go past` and `Take the wider awning route` embedded in Hebrew and is assigned with `textContent`. Isolate those English spans with bidi isolates or equivalent markup and inspect a matching mistake capture. The task strip itself already has explicit `lang=en dir=ltr`.

## Capture limitations already being corrected by lead

- Capture 02 visually shows an open wing but JSON has `gliding=false` because input was released before the snapshot. Preserve the held action at capture time; do not call this matching animation/state evidence yet.
- Capture 02 shows reversed numeric progress (`1 / 0` visually for tuned0/required1). Current source uses an LTR `bdi`, so this needs a new capture rather than another speculative fix.
- Capture 03 JSON is `success`, but the screenshot has no completion panel. The lead has fixed immediate UI refresh under the manual clock. A fresh success capture is required to review result text and RTL statistics.
- Old near/behind-player sign occlusion clutter is being corrected in source. Review new matching views before judging landmark readability complete.

Browser campaign, transfer, mobile, mistakes and final success captures remain separate evidence. No additional browser was launched for this review.


## Accepted follow-up

The lead accepted the context and toast corrections: the transfer context is now specified as English “The café has moved to the west roof.” with no receiver-east clause, and the wrong-relay toast uses generic place/order guidance. Header stacking and capture-animation timing were also corrected for the next harness run. Recheck new captures before claiming those screenshot defects resolved. These first captures remain a prototype baseline; final Tripo rig/art acceptance is externally blocked. Ordinary vocabulary should also cover game-specific `tune`, `awning`, `parcel`, `beam`, `face` and `west` without supplying a route answer.

## Won-summary source follow-up

A later won capture exposed a mixed-scope summary: campaign movement time appeared beside only the final job's recovery count. The lead added accumulated campaign totals for recoveries, rejected relay tunes and assistance, used on the won screen. The independent full input-only campaign now verifies one total recovery despite zero in the final job, no assistance, no rejected relay tunes and no duplicate aggregation after `won`. The focused regression passes. Rendered totals still need their matching updated capture; this source/test result alone is not a screenshot verification.
