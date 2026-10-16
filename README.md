# TBJ · Initiative tracker

A browser-based initiative tracker for an informal asymmetrical tabletop game. No accounts or backend services are required. Player names, character types, speed ranges, and the current round are stored locally in the browser on this device.

## Publish with GitHub Pages

This repository is prepared for GitHub Pages. After pushing to `main`:

1. Open **Settings → Pages** in `xe4961-sys/TBJ` on GitHub.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Select branch **main** and folder **/(root)**, then press **Save**.
4. Wait for GitHub’s Pages deployment to finish. The expected website address is **https://xe4961-sys.github.io/TBJ/**. The Pages settings screen shows the final link and deployment status.

The site is served directly from `index.html` at the repository root; no build dependencies or secrets are required. `.nojekyll` enables plain static file serving. Future pushes to `main` update the website automatically. GitHub Actions runs the rules tests and verifies that the single-file download matches the source on pushes and pull requests.

Once the site is deployed, the standalone download is available at **https://xe4961-sys.github.io/TBJ/dist/TBJ-tracker.html**. To save it rather than open it, use your browser’s Save page option or download the raw file from GitHub. A local file and the hosted site have separate browser storage; an existing local session does not transfer automatically.

## Open without installing anything

Download `dist/TBJ-tracker.html` from the workspace and open it in a modern browser. This self-contained version needs no terminal commands or server. Browser storage on local files varies by browser, so use the same browser and file location to keep your session.

Regenerate that file after source changes with `npm run export`.

## Run locally

Requires Node.js 18 or later. There are no dependencies to install.

```sh
npm start
```

Open port 3000 in your browser. Set `PORT` to change the port. To run the rules tests:

```sh
npm test
```

## How to play

1. Set the survivor count or add individual survivors and adversaries. Choose character types and enter optional player usernames.
2. Edit each player's minimum and maximum speed, or use the **Character types** tab to edit defaults and create new types. Speeds must be whole numbers from 1 to 999; both ends of the range are included. Equal minimum and maximum gives a fixed speed.
3. Press **Play first round**. Every player rolls independently and the turn order sorts from fastest to slowest. Ties get a random order.
4. Press **Next turn** after each player acts. **Finish round** marks the last player as finished. Press **Play next round** to increase the round counter and reroll everyone. You can also start a new round before everyone has acted.
5. **Reset rounds** clears the round counter and turn order, keeping the roster and character types.

Roster changes apply on the next roll; the current round keeps its original participants and rolls. Changing a type's default ranges updates players still using its previous defaults, preserving custom player ranges. Selecting a different character type resets that player's range to the selected defaults. Survivor count decreases remove survivors from the end of the roster. Limits: 24 survivors, 8 adversaries, 100 character types.

All game logic runs in your browser. Local storage is specific to the browser and website address; there is no multiplayer synchronization. If storage is unavailable, play still works for the current session. System fonts keep the interface independent of external services. For static hosting, publish `index.html`, `styles.css`, `app.js`, and `game.js` together. The included development server serves these files; no build step is needed.


## Preset character ranges

| Team | Characters | Speed |
| --- | --- | --- |
| Survivor | Noob, Jester, Firefighter, Hemomancer | 4–8 |
| Survivor | Knight, Brawler, Sheriff, Maniac | 2–6 |
| Survivor | Sniper, Doc, Vocalist | 2–5 |
| Survivor | Shielder, Wrecker | 1–4 |
| Survivor | Guest | 4–9 |
| Adversary | Spotter, Anarchist, Dullahan, Chronos | 5–8 |
| Adversary | Chaser, Firework, Flare Reaver | 4–9 |
| Adversary | Executioner, Sin | 2–5 |
| Adversary | Apprentice, Hunter, Custodian | 3–6 |

All 26 presets are editable in Character types. Existing saved sessions receive the new presets once; player names and custom ranges are preserved, and old default Scout/Stalker entries become Guest/Spotter. Speeds below 1 are raised to 1. Current round order is retained.
