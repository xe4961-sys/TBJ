# TBJ · Initiative tracker

A browser-based initiative tracker for an informal asymmetrical tabletop game. No accounts or backend services are required. Player names, character types, speed ranges, Haste/Bind effects, sound preferences, and the current round are stored locally in the browser on this device.

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
5. Use each player's **Effects** button to add Haste or Bind. Choose an amount and either full rounds or **Until removed**. See the effect rules below.
6. **Sound on / Sound muted** toggles both the uploaded dice-roll sound and the short turn-change cue. The setting is saved on this device. Play shows a decorative six-sided dice roll before revealing speed results; the dice animation does not change each character's actual speed range. Reduced-motion preferences shorten the reveal and stop the spinning animation. Sound failure does not prevent playing.
7. **Reset rounds** clears the round counter and turn order, keeping the roster, character types, sound preference, and remaining speed effects. It does not restore rounds already consumed by effects.

Roster changes apply on the next roll; the current round keeps its original participants and rolls. Changing a type's default ranges updates players still using its previous defaults, preserving custom player ranges. Selecting a different character type resets that player's range to the selected defaults. Survivor count decreases remove survivors from the end of the roster. Limits: 24 survivors, 8 adversaries, 100 character types.

All game logic runs in your browser. Local storage is specific to the browser and website address; there is no multiplayer synchronization. If storage is unavailable, play still works for the current session. System fonts keep the interface independent of external services. For static hosting, publish `index.html`, `styles.css`, `app.js`, `game.js`, and `assets/dice-roll.mp3` together. The included development server serves these files; no build step is needed.


## Preset character ranges

| Team | Characters | Speed |
| --- | --- | --- |
| Survivor | Noob, Jester, Firefighter, Hemomancer, Vocalist, Assistant | 4–8 |
| Survivor | Knight, Brawler, Sheriff, Maniac | 3–7 |
| Survivor | Sniper, Doc | 2–5 |
| Survivor | Shielder, Wrecker | 1–4 |
| Survivor | Guest | 4–9 |
| Adversary | Spotter, Anarchist, Dullahan, Chronos | 5–8 |
| Adversary | Chaser, Firework, Flare Reaver | 6–9 |
| Adversary | Executioner, Sin | 2–5 |
| Adversary | Apprentice, Hunter, Custodian | 3–6 |

All 27 presets are editable in Character types. Existing saved sessions receive the new presets once; player names and custom ranges are preserved, and old default Scout/Stalker entries become Guest/Spotter. Speeds below 1 are raised to 1. Existing unchanged character defaults receive the updated preset ranges and Assistant is added. Custom ranges and the current round order are retained.


## Haste and Bind

Each player has base speed inputs, a **Next roll** preview, and an **Effects** button. Effects change both the minimum and maximum, stack additively, and never alter character defaults. The net modifier is applied once, then each endpoint is clamped to 1–999. Players can have up to 20 effects.

- **Full rounds:** choose 1–99 future round rolls. Haste +2 on Hunter's base 3–6 gives 5–8. A two-round effect applies to the next two times **Play** starts a round, then expires. **Next turn** does not consume duration.
- **Until removed:** use for conditions you track at the table. For example, label Hunter's Haste “Has not attacked” or Custodian's Haste “Armor shed”. Remove the effect when the condition ends. These effects have no automatic expiration.
- **Stacking:** Hunter 3–6 with Haste +2 and Bind −1 rolls 4–7.
- **Next round only:** adding/removing an effect during play leaves the current rolls and turn order intact. The roster shows effects remaining for future rolls; the turn-order cards show effects used for the current round. A one-round effect disappears from the roster after the roll but remains applied to that round.
- Refreshing during the dice animation restores the already-calculated round, without rerolling or consuming an extra duration. Manually starting a new round early still counts as another round roll.

The dice-roll sound is the user-supplied “Library of Ruina SFX - Click Dice Roll Finger Snap - Sylveon (320k).mp3”, kept at `assets/dice-roll.mp3`. The standalone HTML embeds the audio and needs no external asset files. Turn-change cues are generated locally with Web Audio. No audio plays on page load.
