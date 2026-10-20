# Joma Tracker 2.0.5 — Windows download

**Wrecker grenade timer + Guest recast-window tracker** in one portable Windows app.

**[Download Joma Tracker for Windows x64](https://github.com/xe4961-sys/TBJ/raw/refs/heads/fuse-timer-download/JomaTracker-Windows-x64.zip)**

1. **Exit the old Fuse Timer / Joma Tracker** from its tray icon first.
2. Extract the ZIP and run **JomaTracker.exe**. No separate .NET installation is required.
3. The app starts hidden. Press **F8** (or your saved controls key) to open settings.
4. Choose **Wrecker** or **Guest**. Only the selected mode runs.

## Wrecker

The existing grenade sequence is retained: accelerating beeps → ARMED → RELEASE! → BULLSEYE!! at 3.70–4.00s. Default grenade bind: G. Existing bindings, sound/volume, and timer preferences are preserved. No cooldown tracking.

## New in 2.0.5

Two **optional, initially disabled** calibrated visual-event detectors in Guest:

- **Landed Sweep XP:** sample only the white phrase **Landed Sweep.**, excluding XP/point amounts, then select the XP search area. A new phrase after an attack refreshes Offensive availability even when the Rush label stays red. Lingering/scrolled text is deduplicated; an active Rush sprint is not extended. Calibration handles differing numeric bonuses by excluding the numbers entirely. Detection starts its timer at the first observed XP message; hidden/replaced-in-place events can be missed.
- **Experimental passenger detection:** calibrate the red rectangular Rush box. Sustained presence after 1.65s followed by sustained disappearance can add +2s once per Supportive Rush, showing **PICKUP? +2s**. Walls, camera changes, and occlusion can cause false pickups. This cannot confirm that the character is still rushing. Reset after interruptions; leave disabled if unreliable.

Use **Capture Sweep XP in 3s** / **Capture red Rush box in 3s**, perform the relevant action during the delay, then select the region(s) on the frozen screen. Enable the corresponding checkbox afterward and hide controls with F8. Main calibration/settings are retained; extra regions are new and must be calibrated per profile. Extra capture targets at most 10/s, with regions limited to 200,000 pixels. Actual Windows/gameplay recognition still needs testing. See QUICKSTART for instructions.

## New in 2.0.4

Optional **Compact display (minimal text, no bars)** in common settings. Guest combines Rush sprint/phase into one line and independent windows into a second line, retaining notices and marked previews. Wrecker has a smaller countdown/warning display. Settings are saved, and the full display remains available. Detection/timing logic is unchanged.

Optional visual-event detectors are described above. Manual pickup remains available.

## New in 2.0.3

Rapid Kick-to-Rush handling: optional 0.4s fast-sampling bursts (target up to 60/s), one-shot Rush-prefix checks, confirmed Sweep hit evidence, and early recovery of a missed/incorrect Rush request without restarting its timer. Kick input or a roll-only Strike is never treated as a landed hit. Late unrelated frames and cancellation cannot resurrect a run. Your existing calibration/settings are retained.

Normal steady capture remains 5–30/s. Disable **Fast Kick checks** if preferred. Fully unseen hit cues still cannot be inferred; test rapid sequences in gameplay.

## New in 2.0.2

Damage-vignette filtering: compare lettering colors with nearby background, so a broad red damage wash or smooth gradient is not counted as the Offensive Rush label. Genuine supportive/offensive text under simulated damage tint remains recognized. Very low contrast becomes Unknown. Uses existing calibration and the same capture rate; the actual game vignette still needs a live test.

## New in 2.0.1

Fixes the ability cards disappearing during Rush windup: latch the latest fresh confirmed variant at input and keep the timer running while the HUD is hidden. No post-input color wait.

Separate sprint countdown beside WAIT / DROPKICK READY, calibration validation, last-Rush-input feedback, and **Test supportive Rush / Test offensive Rush** buttons that show a simulated overlay without detection. Test previews do not activate any move in game. Press F8 to return.

If the live preview is persistently **Rush: Unknown before input**, no live Rush timer can start. A temporary Unknown during windup is expected once the variant has been latched. Recalibrate the colored Supportive/Offensive prefix; the white Rush word alone is not sufficient.

## Guest — calibrate before playing

- Select a monitor and profile name, then **Calibrate text regions** with base Kick visible.
- Select the **Kick word only**, leaving enough width for Sweep/Strike. Then select the colored **Supportive/Offensive word only**, excluding Rush/F and the card borders.
- Check the live crops and detection labels.
- Click **Learn Strike label**, hide controls, roll in game, then press **F6** while Strike is visible. This supports its white or gold appearance.
- Hide controls before playing. Guest ability inputs are paused while settings are open.

Sweep, Strike, Offensive Rush availability, both Rush windups, safe Dropkick recasts, and remaining sprint time have independent timers/shrinking bars. Timings and key bindings are adjustable. Calibration profiles support different monitor layouts/resolutions; verify detection after changing HUD scale or aspect ratio.

Default Guest binds: **LMB** Kick, **Q** roll, **F** Rush/Dropkick, **F7** reset, **F6** learn Strike. Optional manual **F10** ally pickup adds 2s to a valid supportive run, initially disabled. Enhanced Kick, cooldowns, and automatic interruption detection are excluded. Optional passenger inference is experimental.

Guest captures the two selected text regions plus any enabled calibrated visual-event regions, with color and image-mask checks at a steady **20 checks/s**, adjustable **5–30**, plus optional brief Kick bursts and a one-shot Rush-prefix check. No video recording, OCR model, uploads, or game-memory access. Wrecker mode does not capture the screen. The app does not alter or block game inputs. Rush uses the most recent confirmed color (at most 0.35s old) and its timer stays anchored to the input. Guest capture pauses while positioning; the timer is moved clear if it overlaps either detection region.

Common settings include mute/volume, Test sound, Windows mixer, idle hiding, per-mode overlay positioning, and a changeable controls key. The normal overlay is transparent, borderless, click-through, and hidden when idle by default. Use windowed/borderless gameplay.

Read [QUICKSTART.txt](QUICKSTART.txt) for setup. [Source ZIP](JomaTracker-source.zip) and [checksums](SHA256.txt) are included.

## First Guest test build

81 automated tests pass for timing, independent windows, input transitions, stale-cue rejection, calibrated region scaling, synthetic color/template detection, and Wrecker/audio regressions. The Windows x64 executable cross-compiles without warnings. Actual Windows capture/UI, live recognition accuracy, game input, audio, and FPS impact still need testing on your PC. The app is self-contained and unsigned.

## Previous Wrecker-only app

The original [Fuse Timer 1.2.2 download](FuseTimer-Windows-x64.zip) and [source](FuseTimer-source.zip) remain available.

This is a separate download branch. TBJ's tracker website remains on `main`; **do not merge this branch into main**.
