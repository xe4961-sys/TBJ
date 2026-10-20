# Joma Tracker 2.0 — Windows download

**Wrecker grenade timer + Guest recast-window tracker** in one portable Windows app.

**[Download Joma Tracker for Windows x64](https://github.com/xe4961-sys/TBJ/raw/refs/heads/fuse-timer-download/JomaTracker-Windows-x64.zip)**

1. **Exit the old Fuse Timer / Joma Tracker** from its tray icon first.
2. Extract the ZIP and run **JomaTracker.exe**. No separate .NET installation is required.
3. The app starts hidden. Press **F8** (or your saved controls key) to open settings.
4. Choose **Wrecker** or **Guest**. Only the selected mode runs.

## Wrecker

The existing grenade sequence is retained: accelerating beeps → ARMED → RELEASE! → BULLSEYE!! at 3.70–4.00s. Default grenade bind: G. Existing bindings, sound/volume, and timer preferences are preserved. No cooldown tracking.

## Guest — calibrate before playing

- Select a monitor and profile name, then **Calibrate text regions** with base Kick visible.
- Select the **Kick word only**, leaving enough width for Sweep/Strike. Then select the colored **Supportive/Offensive word only**, excluding Rush/F and the card borders.
- Check the live crops and detection labels.
- Click **Learn Strike label**, hide controls, roll in game, then press **F6** while Strike is visible. This supports its white or gold appearance.
- Hide controls before playing. Guest ability inputs are paused while settings are open.

Sweep, Strike, Offensive Rush availability, both Rush windups, safe Dropkick recasts, and remaining sprint time have independent timers/shrinking bars. Timings and key bindings are adjustable. Calibration profiles support different monitor layouts/resolutions; verify detection after changing HUD scale or aspect ratio.

Default Guest binds: **LMB** Kick, **Q** roll, **F** Rush/Dropkick, **F7** reset, **F6** learn Strike. Optional manual **F10** ally pickup adds 2s to a valid supportive run, initially disabled. Enhanced Kick, cooldowns, automatic pickup detection, and automatic interruption detection are excluded.

Guest captures only the two selected text regions, with color and image-mask checks at **20 checks/s**, adjustable **5–30**. No video recording, OCR model, uploads, or game-memory access. Wrecker mode does not capture the screen. The app does not alter or block game inputs. Screen confirmation can briefly delay the overlay's Rush display; its timer stays anchored to the original input.

Common settings include mute/volume, Test sound, Windows mixer, idle hiding, per-mode overlay positioning, and a changeable controls key. The normal overlay is transparent, borderless, click-through, and hidden when idle by default. Use windowed/borderless gameplay.

Read [QUICKSTART.txt](QUICKSTART.txt) for setup. [Source ZIP](JomaTracker-source.zip) and [checksums](SHA256.txt) are included.

## First Guest test build

45 automated tests pass for timing, independent windows, input transitions, stale-cue rejection, calibrated region scaling, synthetic color/template detection, and Wrecker/audio regressions. The Windows x64 executable cross-compiles without warnings. Actual Windows capture/UI, live recognition accuracy, game input, audio, and FPS impact still need testing on your PC. The app is self-contained and unsigned.

## Previous Wrecker-only app

The original [Fuse Timer 1.2.2 download](FuseTimer-Windows-x64.zip) and [source](FuseTimer-source.zip) remain available.

This is a separate download branch. TBJ's tracker website remains on `main`; **do not merge this branch into main**.
