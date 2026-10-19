# Fuse Timer 1.2.1 — Windows download

A separate grenade-release countdown app. TBJ's tracker stays on `main`; **do not merge this download branch into main**.

**[Download the updated Windows ZIP](https://github.com/xe4961-sys/TBJ/raw/refs/heads/fuse-timer-download/FuseTimer-Windows-x64.zip)**

## Start here

1. **Exit the old version** from its clock icon in the system tray.
2. Download the ZIP, right-click it in Windows File Explorer → **Extract All**.
3. Run the extracted **FuseTimer.exe**. It needs no separate .NET installation.
4. **It starts hidden. Press F8 to open settings.** The tray icon is another way to open them.
5. **G** (default) starts the sequence. Both the grenade key and controls key are configurable.

## Audio update (1.2.1)

Replaces the previous sound player with direct Windows PCM output. **Test sound** plays a longer beep and reconnects to the default audio device; any playback error appears below it. Failed attempts no longer silently disable the audio session. **Windows mixer** opens app volume/output settings if a successful test is still inaudible. Native speaker output still needs a Windows check.

## Behavior

| After the grenade key | Display |
| --- | --- |
| 0–3.00s | Transparent floating countdown; sharp accelerating electronic beeps |
| 3.00–3.20s | **ARMED**, urgent beeps |
| 3.20–3.70s | **RELEASE!**, urgent beeps |
| After 3.70s | Sound stops; overlay hides by default |

No premature explosion indication or spoken voice. The overlay has no window rectangle, title bar, white border, or taskbar button. It is click-through and does not take focus from the game.

In settings:

- **Only show while primed:** on by default; hides the idle/completed overlay.
- **Gentle warning flashes:** optional, off by default; pulses only ARMED/RELEASE text.
- **Sound on/muted** and **Volume:** control all beeps independently of flashing.
- **Position overlay:** drag the displayed digits, then choose Done positioning.
- **Hide controls** or **F8:** hides the settings window. Closing it hides it too; use **Exit app** or tray **Exit** to quit.

Use borderless fullscreen/windowed mode for overlay visibility. Exclusive fullscreen may cover ordinary desktop overlays. The app is a manual timing aid; it does not detect the game's grenade state. Pressing the grenade key again restarts the sequence; holding it triggers once.

Read [QUICKSTART.txt](QUICKSTART.txt) for complete instructions. [Source ZIP](FuseTimer-source.zip) and [archive checksums](SHA256.txt) are included.

## Test-build status

24 tests passed for timing, visibility rules, key edges, flashing, PCM beep data, and audio-control failure recovery using a fake output. The self-contained, unsigned Windows x64 executable compiled on Linux. Native Windows transparency/click-through, game key input, and speaker output still need a test on your PC.
