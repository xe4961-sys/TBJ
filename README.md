# Joma QoL 3.0.0 — Windows download

**Wrecker grenade timer + Guest recast tracker + recorded character switcher.**

**[Download Joma QoL for Windows x64](https://github.com/xe4961-sys/TBJ/raw/refs/heads/fuse-timer-download/JomaQoL-Windows-x64.zip)**

1. Exit the previous Joma Tracker / Fuse Timer / Joma QoL using its tray icon.
2. Extract the ZIP and run **JomaQoL.exe**. No .NET installation required.
3. Press **F8** for settings. Your existing tracker settings/calibration are retained.

## Character switcher

In **F8 → Switcher**, select Brawler (Numpad 1), Knight (2), Guest (3), Firefighter (4), or the unassigned fifth favorite. Click **Record selected**, return to the game with the shop closed, and press **F9** to begin. Click **Shop → character → Equip** normally, release mouse buttons, then press **F9** again to save. **Escape cancels** an unfinished recording and keeps the previous one.

Enable **Numpad 1–5 character shortcuts**, hide controls, return to the same starting game/menu state, and press the corresponding Numpad key with **Num Lock ON**. Each favorite needs its own recording. Favorite names and recording key are changeable.

Replay jumps between saved click positions. Speed defaults to 200%, with a 150ms minimum menu wait; slow down/increase waits if the menus load slowly. Individual recorded waits are editable. Click/wheel actions are recorded; typing/drag paths are not. Recording is explicit and local, with no video or uploads.

Escape, F8/opening controls, or **tray Stop macro** stops replay. App focus and recorded window size are checked before every replay action; focus loss/resize aborts. Moving the window is supported. Keyboard shortcuts are registered only while controls are hidden and the recorded app is focused; no overlapping/queued replays. Tracker input/capture pauses during a macro. Switching does not verify that the game actually equipped the character.

**93 automated checks pass**, including cancellation, focus guards, delayed replay, button release, and the existing tracker regressions. The Windows executable cross-compiles cleanly. Native Windows recording/hotkeys, mouse injection, DPI, actual game acceptance, and menu timing **need testing on your PC**.

See included QUICKSTART and README for calibration and optional Sweep XP / passenger detection. Compact display, Wrecker sound/mute, and Guest recast tracking are retained. The switcher is initially disabled until you enable it and record favorites.

[Source ZIP](JomaQoL-source.zip) · [Checksums](SHA256.txt)

## Previous apps

[Joma Tracker 2.0.5](JomaTracker-Windows-x64.zip) and its [source](JomaTracker-source.zip), plus the original [Fuse Timer 1.2.2](FuseTimer-Windows-x64.zip) and [source](FuseTimer-source.zip), remain available.

This is a separate download branch. TBJ's website remains on `main`; do not merge this branch into main.
