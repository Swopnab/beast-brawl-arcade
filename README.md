# BEAST BRAWL / ARCADE

**Five worlds. Thirty fighters. Your rules.** A separate, stage-first edition of Beast Brawl. An original, sprite-based arcade fighting game with 30 playable creatures, live two-player rooms, bot opponents, combos, chat, and cosmetic progression.

## Play

**[Choose your battleground →](https://swopnab.github.io/beast-brawl-arcade/)**

Start by choosing **Caldera Rift** (volcano), **Azure Falls** (water), **Rainline City** (rain), **Sunscorch Dunes** (sunny desert), or **Verdant Ruins** (jungle). The selected scenery stays behind the character roster and becomes the battle arena. All five worlds are free.

The arcade character-select screen gives your fighter roughly half the desktop screen, with all 30 original creatures available beside it. Browse with arrow keys, click a creature, or use Random. **Lock in** opens bot and online match settings. On narrow screens the portrait and roster stack vertically.

- **Solo:** choose a creature, choose a rival or “Surprise me,” select a bot difficulty, and press **Fight a bot**.
- **Online:** choose a creature, enter a nickname, and **Create a private room**. Copy the invite link to a friend on another device. They choose their creature and **Ready up**; the host starts the match.
- A synchronized **six-second survival guide** explains the controls before the first round. Subsequent rounds have three-second countdowns.
- Use the **alibi lounge** for live room chat. Messages are visible only to room participants and are not saved after the room ends.

All 30 characters, names, creature designs, backgrounds, and move sets were created for this game. No official Pokémon, Street Fighter characters, ripped sprites, or third-party game artwork are used. The look uses original Canvas pixel art, not ASCII.

## Controls

| Command | Action |
| --- | --- |
| A / D | Move left / right |
| W | Jump |
| S | Hold to guard; guarding reduces incoming damage |
| Q | Light attack |
| E | Heavy attack |
| R | Signature special |
| Space | Charged finisher; requires 100% energy |
| S + Q | Low sweep; increased chip damage through guard |
| W + E | Rising heavy |
| E while airborne | Diving heavy |
| A or D + E | Moving heavy |
| Q → Q → E | Skybreaker: launching combo finisher |
| Q → E → R | Elemental EX: empowered signature special |
| E → E → Q | Guardbreaker: bypasses guard |

Each creature has **11 named move commands**. Open **Your move list** to see the selected creature’s exact attack names and descriptions. Combos must be entered within 2.5 seconds; time each input as the preceding animation finishes. The last quarter-second of an animation accepts buffered inputs. Pressing every key simultaneously is not a successful combo.

Phones, iPads, and other touchscreens have a translucent glass thumb joystick and separate attack buttons with multi-touch support. Drag left/right to move, up to jump, and down to guard; diagonals combine movement with jumping or guarding. Releasing, canceling a touch, or switching away resets movement. Landscape orientation gives the arena more room.

## Match rules

Each round lasts 60 seconds. Knock out your rival, or finish the round with the higher remaining **health percentage**. Equal health is a draw. Win two rounds to win the match; after a maximum of three rounds, whoever has more round wins takes the match. Equal round wins produce a match draw. Rounds advance automatically.

Energy builds through combat and slowly over time. Finishers consume a full meter. Blocking reduces damage but allows chip damage. Guardbreakers bypass guard. Jumping can avoid grounded waves and traps. Each creature has its own health, speed, jumping strength, damage profile, and special technique.

## The original roster

| Element | Creatures |
| --- | --- |
| Ember | Ashfang, Cindervix, Kilnback, Scorchimp, Brimram |
| Tide | Ripjaw, Bubbles, Reefclaw, Kelcoil, Driftfin |
| Volt | Zipcat, Ampwing, Boltstag, Coilmaw, Sparko |
| Wild | Thornox, Mosscub, Petalmoth, Briarhog, Vinetail |
| Void | Nyxowl, Hexraven, Duskmant, Wispurr, Nullwyrm |
| Frost | Tundrusk, Glaciop, Crysteel, Frostter, Snowurchin |

Signature specials include traveling projectiles, rushing attacks, ground waves, delayed traps, radial bursts, rising strikes, slams, and healing siphons. Elements are visual/move-set identities, not a hidden type-advantage system.

## Rewards

| Result | XP | Shards |
| --- | ---: | ---: |
| Win | 120 | 50 |
| Draw | 65 | 25 |
| Loss | 45 | 15 |

Completed bot and online matches both count. Leaving early earns nothing. Earn five titles through XP, and spend shards on **Forge Glow**, **Jade Glow**, and **Storm Glow** lighting palettes. Arcade Lime is free. These tint the arena floor effect; the five stage backgrounds remain free. All 30 creatures remain available from the start, with no paid boosts.

Rewards, titles, and arena purchases are stored in this browser’s local storage. An equipped lighting palette changes your own view. Clearing browser data resets progression. Rewards have no monetary value and are not a secure global ranking system.

## Local development

Requires Node.js 18+ for checks and Python 3 for the local server. No dependency installation or build is necessary.

```sh
npm run dev
# http://127.0.0.1:4320

npm run check
npm test
```

The automated suite exercises joystick dead zones and radial bounds, stage persistence, all 30 signature specials, the briefing, combat damage, defense, aerial/directional moves, all three combo routes, energy costs, match completion, bot behavior, and reward/purchase accounting.

## Multiplayer and hosting

GitHub Pages serves the root of `main`; `.nojekyll` enables plain static hosting. A GitHub Actions workflow runs checks and tests on pushes and pull requests.

The bundled **PeerJS 1.5.5** library establishes encrypted WebRTC data channels through PeerJS Cloud signaling and the library’s default STUN/TURN configuration. No account, microphone, API key, game server installation, or paid service is required.

The host simulates combat at a fixed 60 steps per second and broadcasts snapshots. Guests submit movement and validated attack commands, not health, energy, rewards, or damage values. Guest positions are smoothed between snapshots. Room codes are random and unlisted; private session capabilities let the original guest refresh and rejoin the same seat. A disconnected rival pauses the match until reconnection. The host must stay in the room.

### Practical limits

- **Keep the host’s tab open and visible.** Background tabs and mobile browsers can suspend animation; a suspended host stalls the match. Returning to the foreground resumes simulation.
- If a guest refreshes, use the existing invite/code and rejoin in the same tab to restore the seat. A host refresh ends the room.
- Free signaling and relay services are external dependencies. Some school/work networks block peer connections. Try another network if a room cannot connect.
- This is a casual host-authoritative game, with host latency advantage and no rollback netcode, account-based anticheat, or competitive matchmaking. The host is trusted. Do not use it for wagers or secure ranked tournaments.
- Bot difficulty changes reaction cadence and defensive behavior. Bot opponents are clearly labeled.
- Original pixel art is generated locally in Canvas. Optional Google Fonts has system fallbacks. No advertising or analytics is included.

## Source layout

- `fighters.js` — original roster, stats, moves, elements, arenas, and titles.
- `combat.js` — authoritative combat, AI, combos, timing, and round resolution.
- `art.js` — original creature sprites, animation, and combat effects.
- `stages.js` — five original layered Canvas worlds and animated weather.
- `joystick.js` — radial movement mapping, pointer capture, and safe release.
- `arcade.css` — stage-first arcade selection and glass touch controls.
- `network.js` — room connections, seat capabilities, and reconnection.
- `profile.js` — browser-local progression and cosmetic purchases.
- `app.js` — selection, controls, synchronized briefing, HUD, chat, and rewards UI.
- `tests/` — meaningful game-state and progression checks.
- `vendor/` — pinned PeerJS build and its MIT license.

Made by Swopnab Bikram Karki with Codex. MIT licensed; the bundled PeerJS license is preserved separately.
