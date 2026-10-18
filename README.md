# BEAST BRAWL / 3D ARCADE

**Five worlds. Twelve fighters. Your rules.** A separate, quick-start edition of Beast Brawl. An original 3D arcade fighting game with 12 playable creatures, live two-player rooms, bot opponents, combos, chat, and cosmetic progression.

## Play

**[Choose your battleground →](https://swopnab.github.io/beast-brawl-arcade/)**

Choose **Player vs Player** or **Player vs Bot** first. Then choose a background, then click a creature. The chosen creature’s name is your player name. There is no account, nickname field, final setup form, or separate confirmation button.

- **Bot:** clicking a character starts the five-second countdown immediately, with a random rival and standard bot difficulty.
- **Online:** the PvP button creates a room automatically. Share the invite shown above the game; friends opening it choose PvP to join directly. A room code can also be entered from the first page. The host chooses the shared background, and both players choose a creature. As soon as both characters are chosen, a synchronized five-second countdown starts automatically. No separate ready/start button is needed.
- Hover a creature or use arrow keys to preview it on a laptop. Click, tap, or press Enter to choose it and start. Random chooses a character and starts too. The preview rotation and move-list buttons remain available before choosing.
- Chat is available through the **Chat** button in an online room. Messages stay in the room and are not saved after it ends.

The five free worlds are **Caldera Rift** (volcano), **Azure Falls** (water), **Rainline City** (rain), **Sunscorch Dunes** (sunny desert), and **Verdant Ruins** (jungle). The selected scenery stays behind character selection and becomes the battle arena.

The screens adapt to phone, tablet, laptop, and desktop dimensions without page scrolling. Portrait and landscape layouts keep the twelve creature choices and touch controls accessible. Safe-area spacing keeps controls clear of notches and home indicators. Browsers with touch input show the glass joystick even on larger tablets; keyboard controls remain available. Menus and chat have bounded reading areas.

All 12 characters, names, creature designs, backgrounds, and move sets were created for this game. Each creature has its own anatomy, proportions, size, and limb animation. The 3D edition uses original procedural low-poly models, layered geometry, lighting, shadows, animated weather, and 3D combat effects. Drag the selected creature or use the rotation buttons to inspect it. No official Pokémon, Street Fighter characters, ripped sprites, or third-party game artwork are used. The five stage backgrounds, roster portraits, selected creature, and battles render in real 3D using bundled Three.js 0.186.1. Fighting follows the same side-view rules, with a camera that follows and moves closer as fighters approach. It is a 3D presentation with side-view movement. Browsers without WebGL 2 automatically use the previous illustrated Canvas renderer.

## Fullscreen, music, and effects

Press **⛶** in the top right for fullscreen in supported browsers; press it again or Escape to leave. The **⚙** menu independently controls music volume, sound effect volume, both mute switches, and scenery/camera motion. Preferences stay on this device. The original eight-bar adventure soundtrack is enabled by default and begins on the first click, tap, or keypress because browsers require interaction to start sound. Music pauses when the tab is hidden. Scenery motion can also be disabled independently of combat animations.

Elemental effects include fireballs with ember trails, pressure-cannon water jets, forked lightning, leaf bursts and vines, void spirals, and ice shards. Ashfang’s Q throws **Flare Orb**; Inkveil’s Q fires **Pressure Cannon**. Other techniques show elemental charge, impact, and ground effects. These are real combat effects associated with damaging attacks, rather than decoration added to the menus.

## Controls

| Command | Action |
| --- | --- |
| A / D | Move left / right |
| W | Jump |
| S | Duck; lower your hurtbox to evade Q shots (no passive block) |
| Q | Ranged projectile; exactly one quarter of basic E damage |
| E | Fast close-combat strike; 22-frame recovery |
| R | Timed deflect: 8 frames to parry melee or reflect a projectile; 40-frame cooldown |
| Space | Creature-specific close-range ultimate; requires 100% energy |
| S + E | Low sweep |
| W + E | Rising melee |
| E while airborne | Diving melee |
| A or D + E | Moving melee |
| E → E → E | Skybreaker: launching melee finisher |
| E → E → S+E | Low Finish: ducking combo sweep |
| Successful R → E | Counter within 0.75 seconds; 150% basic melee damage |

Each creature has **11 named move commands**. Open **Your move list** to see the selected creature’s exact attack names and descriptions. Combos must be entered within 2.5 seconds; time each input as the preceding animation finishes. The last quarter-second of an animation accepts buffered inputs. Pressing every key simultaneously is not a successful combo.

Phones, iPads, and other touchscreens have a translucent glass thumb joystick and separate attack buttons with multi-touch support. Drag left/right to move, up to jump, and down to duck; diagonals combine movement with jumping or ducking. Releasing, canceling a touch, or switching away resets movement. Landscape orientation gives the arena more room.

## Match rules

Each round lasts 60 seconds. Knock out your rival, or finish the round with the higher remaining **health percentage**. Equal health is a draw. Win two rounds to win the match; after a maximum of three rounds, whoever has more round wins takes the match. Equal round wins produce a match draw. Rounds advance automatically.

Movement runs 18% faster than the previous edition at a fixed 60 simulation steps per second. Melee attacks recover in 22 frames; ranged pokes take 44. Q damage is exactly 25% of each creature’s basic E damage. Melee hits build 12 energy, ranged hits only 2, and a deflect builds 8. The bot actively closes to melee range and uses ranged attacks sparingly.

Hold S to duck under ranged shots; ducking does not reduce damage from strikes that connect. W jumps over sweeps and ordinary punches; rising attacks intercept airborne opponents. Tap R immediately before impact for an 8-frame deflect. It reflects Q shots at their original damage or parries a melee strike and interrupts its attacker. Missed deflects leave a recovery window and cannot be spammed. A successful deflect opens 45 frames (0.75 seconds) to press E for a counter dealing 150% basic melee damage. Ultimates can also be parried. Both players’ defensive inputs are resolved before hit detection.

Energy builds through combat and slowly over time. Space consumes the full meter for a unique ultimate. All ultimates operate at close range; each has its own movement, hit pattern, animation, and visual effect. Hit detection uses creature-specific heights and the lower ducking hurtbox.

## The original roster

| Element | Creatures |
| --- | --- |
| Ember | Ashfang — winged dragon; Kilnback — four-legged furnace tortoise |
| Tide | Reefclaw — broad, six-legged crab; Inkveil — six walking tentacles |
| Volt | Zipcat — tiny four-legged sprinter; Boltstag — tall four-legged stag |
| Wild | Thornox — massive four-legged root beast; Petalmoth — floating wings |
| Void | Hexeye — floating bell, one eye and eight tendrils; Nullwyrm — floating cosmic serpent |
| Frost | Glaciop — small two-legged hopper; Crysteel — giant two-legged crystal titan |

| Creature | Space ultimate | Behavior |
| --- | --- | --- |
| Ashfang | Dragonfall | Forward aerial dive and launch |
| Kilnback | Core Meltdown | Armored radial furnace eruption |
| Reefclaw | Reef Wrecker | Point-blank pincer grab |
| Inkveil | Ocean Eclipse | Three tentacle strikes |
| Zipcat | Nine Lives Overdrive | Five advancing electric hits |
| Boltstag | Thunder Coronation | Rising antler launch |
| Thornox | Forest Stampede | Armored charging horn strike |
| Petalmoth | Bloomstorm | Two radial petal pulses |
| Hexeye | Soul Parade | Three pulses with health siphon |
| Nullwyrm | Singularity | Nearby gravity pull then implosion |
| Glaciop | Avalanche Ballet | Three advancing aerial kicks |
| Crysteel | Absolute Zero | Two crystal hits with a brief freeze |

Elements identify visual style and move sets; there is no hidden type-advantage system.

## Rewards

| Result | XP | Shards |
| --- | ---: | ---: |
| Win | 120 | 50 |
| Draw | 65 | 25 |
| Loss | 45 | 15 |

Completed bot and online matches both count. Leaving early earns nothing. Earn five titles through XP, and spend shards on **Forge Glow**, **Jade Glow**, and **Storm Glow** lighting palettes. Arcade Lime is free. These tint the arena floor effect; the five stage backgrounds remain free. All 12 creatures remain available from the start, with no paid boosts.

Rewards, titles, and arena purchases are stored in this browser’s local storage. An equipped lighting palette changes your own view. Clearing browser data resets progression. Rewards have no monetary value and are not a secure global ranking system.

## Local development

Requires Node.js 18+ for checks and Python 3 for the local server. No dependency installation or build is necessary.

```sh
npm run dev
# http://127.0.0.1:4320

npm run check
npm test
```

The automated suite verifies all 12 model transforms and poses, five animated 3D worlds, coordinate alignment, reduced motion, joystick dead zones and radial bounds, stage persistence, all 12 unique ultimates, the exact ranged/melee damage ratio, ducking, timed parries, projectile ownership on reflection, counter expiry, melee-focused bot behavior, the five-second countdown, two-player readiness, combat damage, defense, aerial/directional moves, all three combo routes, energy costs, match completion, bot behavior, and reward/purchase accounting.

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
- Original 3D creatures and worlds are generated locally; the illustrated fallback uses Canvas. Optional Google Fonts has system fallbacks. No advertising or analytics is included.

## Source layout

- `fighters.js` — original roster, stats, moves, elements, arenas, and titles.
- `combat.js` — authoritative combat, AI, combos, timing, and round resolution.
- `graphics3d.js` — WebGL rendering, preview rotation, portraits, combat camera, and effects.
- `creatures3d.js` — 12 original procedural sculptures and animated limbs.
- `worlds3d.js` — five lit 3D arenas and weather.
- `scene-data.js` — shared world coordinates and palettes.
- `art.js` — original illustrated creature sprites and fallback combat effects.
- `stages.js` — five original layered Canvas worlds and animated weather.
- `joystick.js` — radial movement mapping, pointer capture, and safe release.
- `arcade.css` — stage-first arcade selection and glass touch controls.
- `network.js` — room connections, seat capabilities, and reconnection.
- `profile.js` — browser-local progression and cosmetic purchases.
- `app.js` — selection, fullscreen, controls, settings, synchronized briefing, HUD, chat, and rewards UI.
- `audio.js` — original synthesized adventure soundtrack, sound buses, and volume preferences.
- `flow.js` / `flow.css` — mode-first entry, automatic readiness, five-second start, and responsive setup.
- `viewport.css` — responsive screens that fit the display without page scrolling.
- `tests/` — meaningful game-state and progression checks.
- `vendor/` — pinned PeerJS build and its MIT license.

Made by Swopnab Bikram Karki with Codex. MIT licensed; the bundled PeerJS and Three.js MIT licenses are preserved separately.
