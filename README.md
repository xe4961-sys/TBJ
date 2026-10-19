# Fuse Timer — Windows download

This branch contains a separate Windows grenade countdown app. The TBJ initiative tracker remains on `main`; do not merge this download branch into it.

## Download and run

**[Download FuseTimer-Windows-x64.zip](https://github.com/xe4961-sys/TBJ/raw/refs/heads/fuse-timer-download/FuseTimer-Windows-x64.zip)**

1. Save the ZIP on a Windows 10/11 x64 computer.
2. In File Explorer, right-click the ZIP → **Extract All**.
3. Open the extracted folder and run **FuseTimer.exe**. No separate .NET installation is needed.
4. The default grenade key is **G**, and the countdown is **3.00 seconds**. Use **Change key** to choose your own key or Mouse middle/4/5.
5. Leave **Hotkey enabled** checked. Minimize the app and use the same key in the game. The key still reaches the game. Beeps accelerate, then an explosion sounds at zero. The burst/💥 is visible when the app window is showing.

Sound, volume, always-on-top, and compact-window controls are included. Pressing the key again restarts the timer; holding it triggers once. Restore the window from the taskbar or tray icon.

Read [QUICKSTART.txt](QUICKSTART.txt) for details. [Source code ZIP](FuseTimer-source.zip) is also provided.

## Test-build status

The timing/key-edge logic passed nine tests. This self-contained executable was cross-compiled on Linux. Native Windows UI, real game-key input, and audio output still need a test on your Windows PC. It is an unsigned test build and a manual timing aid, not a game integration.

The download archive's SHA-256 is recorded in [SHA256.txt](SHA256.txt). The archive also contains a checksum for the executable.
