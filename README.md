# BEAST BRAWL / PIXEL ARCADE

An original 2D creature fighter: twelve fixed-grid sprites, five pixel-art arenas, teams of up to three, online rooms, and local CPU practice.

**[Play Beast Brawl](https://swopnab.github.io/beast-brawl-arcade/)**

## Play a team match

1. Choose **CPU Practice** or **Online Match**. Online hosts share the room link; guests can paste a room code or open an invite.
2. Choose an arena. Online guests use the host’s arena.
3. Click one to three distinct fighters in the order you want them. The first pick starts. Click a selected fighter or its team slot to remove it. **Random** fills three slots without starting a match.
4. Press **Start** or **Ready**. Both online teams must be ready and connected. A five-second briefing precedes combat.
5. After a knockout, the losing side chooses a living reserve. Combat and the timer pause during that choice. The surviving active fighter keeps its health and energy. Positions and temporary attack/defense states reset; a two-second countdown resumes combat.
6. Eliminate the whole opposing team to win. There is no voluntary switching or revival. A CPU team has the same number of fighters as yours; online players can each choose one to three.

Each active bout lasts 90 seconds. At time-out, the active fighter with lower health percentage is knocked out. Equal percentages knock out both active fighters. Both sides then choose reserves if available; simultaneous elimination of both complete teams is a draw. Rewards are granted once for the completed team match. Leaving early earns nothing.

The CPU picks its surviving reserve by elemental advantage. This reserve choice is a transparent rule; the trained neural network controls active combat only.

## Roles and elemental matchups

Every fighter has 1,000 health, the same reach and the same collision footprint. Each receives ten rating points across attack, defense and speed. Higher attack costs defense or mobility; tanks hit less hard, and fast fighters give up durability or damage. Ratings appear during selection. The roster’s existing unique ultimates remain.

| Fighter | Role | Attack | Defense | Speed |
| --- | --- | ---: | ---: | ---: |
| Ashfang | Glass cannon | 5 | 2 | 3 |
| Kilnback | Tank | 2 | 5 | 3 |
| Reefclaw | Tank | 2 | 5 | 3 |
| Inkveil | Striker | 4 | 2 | 4 |
| Zipcat | Speedster | 3 | 2 | 5 |
| Boltstag | Duelist | 4 | 3 | 3 |
| Thornox | Bruiser | 3 | 4 | 3 |
| Petalmoth | Glass cannon | 5 | 2 | 3 |
| Hexeye | Controller | 3 | 3 | 4 |
| Nullwyrm | Striker | 4 | 2 | 4 |
| Glaciop | Speedster | 3 | 2 | 5 |
| Crysteel | Tank | 2 | 5 | 3 |

Attack power is `0.75 + 0.1 × attack`; defense is `0.75 + 0.1 × defense`; movement speed is `2.5 + 0.5 × speed`. Impact damage is rounded after multiplying base damage by the element multiplier and dividing by defense (and halved again for armored ultimates). Q has one quarter of E base damage; rounding can slightly change their final ratio.

Every element has two favorable, two unfavorable, and one neutral matchup against other elements. Same-element hits are neutral. All moves inherit their fighter’s element. Reflected shots retain their original element and base damage.

| Attacking element | Deals 2× damage to | Deals ½× damage to |
| --- | --- | --- |
| Fire | Grass, Ice | Water, Shadow |
| Water | Fire, Shadow | Grass, Electric |
| Grass | Water, Electric | Fire, Ice |
| Electric | Water, Ice | Grass, Shadow |
| Ice | Grass, Shadow | Fire, Electric |
| Shadow | Fire, Electric | Water, Ice |

This is an original six-element game chart, not the full rules of another franchise. The selection screen shows the current fighter’s matchups; the battle displays effective/resisted hit feedback.

[evaluation/roster-balance.json](evaluation/roster-balance.json) records 132 ordered one-fighter bouts using the same scripted coach on both sides. Each fighter wins and loses matchups; results range from 9–13 to 13–9 over 22 bouts. This deterministic check catches gross problems; it does not establish human competitive balance.

## True 2D pixel presentation

`pixel-sprites.js` contains twelve original character grids and their limited palettes. `pixel-graphics.js` draws the five arenas, sprite poses, projectiles and impacts to a native **320×180** Canvas, enlarged with image smoothing disabled. Idle, walking, ducking, attacking, hit and KO poses use grid pixels. The same sprites appear in menus, portraits and reserve choices. There are no active 3D models, WebGL renderer or Three.js requests. Legacy 3D/illustrated source files and licenses remain in the repository for history; the current app does not load them.

The free arenas are Caldera Rift, Azure Falls, Rainline City, Sunscorch Dunes and Verdant Ruins. Original artwork, names and moves are authored for this game; no ripped commercial game sprites are used. Local pixel lettering, fullscreen, phone/tablet layouts, touch controls and reduced-motion settings remain available.

## Controls

| Input | Action |
| --- | --- |
| A / D | Move |
| W / S | Jump / duck |
| Q | Ranged attack |
| E | Melee attack |
| R | Timed deflect: 8-frame window; 40-frame cooldown |
| Q + E + Space | Unique ultimate at full energy; Space and touch ultimate are shortcuts |
| S + E / W + E | Low sweep / rising strike |
| Air + E / Moving + E | Diving / moving strike |
| E → E | Two landed hits within 1.5 seconds push the rival away |
| E → E → E | Launcher |
| E → E → S + E | Low finisher |
| Successful R → E | Counter within 0.75 seconds |

Touch devices have a movement joystick and multi-touch attack buttons. Opening a local dialog pauses CPU combat. Fullscreen uses the top-right button where supported. Settings control music, effects and scenery motion. Audio starts after interaction, pauses when hidden, and uses local synthesis.

## Trained practice opponent

Choose **Trained CPU** or **Classic CPU** before starting practice. The trained CPU uses an offline-trained PyTorch network exported as small browser-readable weights. It imitates a scripted coach on synthetic combat states. It is not reinforcement learning, an LLM or a model trained on human gameplay. The classic CPU works if weights cannot load. No paid API or Python server is needed to play.

- [Understand and reproduce the Python, PyTorch and Pandas pipeline](docs/AI-LEARNING-GUIDE.md)
- [Honest resume wording](docs/RESUME-NOTES.md)
- [Held-out classifier metrics](evaluation/practice-policy.json)
- [Current active-combat simulations](evaluation/policy-simulation.json)

The existing model is retained; active-combat simulations have been rerun with the new stat/type rules. Classification metrics describe the original synthetic training distribution. Team strategy has not been learned or evaluated as a neural policy.

## Multiplayer and progression

PeerJS handles room discovery and encrypted browser-to-browser WebRTC data channels. The host simulates all combat at 60 steps per second and broadcasts snapshots. Guests submit validated inputs, team picks and reserve IDs; they cannot submit health or damage. A reserve request always applies to the guest’s own seat and must name one of its living team members. Protocol version 3 prevents mixing old single-fighter clients with team clients.

A disconnected guest pauses combat. Rejoining the same tab with its existing invite/code restores its seat, active fighter, reserves and health. A host refresh ends the room. The host tab must remain open and visible; background tabs can be suspended. Public signaling/relay availability and network restrictions can affect connections. This is casual host-authoritative multiplayer, not a secure ranked service.

Completed matches grant browser-local XP and shards once. Titles and cosmetic arena trim can be unlocked; no stat upgrades or paid boosts exist. All characters and all five stages are free. No accounts, API keys, paid services, advertising or analytics were added.

## Run and verify

```sh
npm ci
npm run dev
npm run check
npm test
npx playwright install chromium
npm run test:browser
node ml/evaluate-balance.mjs
node ml/evaluate.mjs
```

Open the local address shown by the development server. Browser tests cover seven phone/tablet/desktop sizes, team picks, touch controls, settings/dialog flows, CPU damage and missing-model fallback. A second two-page test uses real local RTCDataChannels with test-only local signaling to check online team readiness, authoritative reserves, health carryover, reconnects and final results. Public PeerJS signaling availability is not asserted by that local test. Unit checks cover type chart symmetry, stats, KO/time-out cases, team validation, replacement ownership, snapshot determinism, combat and rewards.

GitHub Actions runs syntax, unit and browser checks. GitHub Pages serves the root of `main` with `.nojekyll`.

Made by Swopnab Bikram Karki with Codex. MIT licensed. Bundled library licenses remain with their sources.
