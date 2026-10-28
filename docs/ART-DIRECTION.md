# Beast Brawl: RPG art update

The references guide the illustrated cover composition, detailed pixel shading and readable RPG lettering. The existing twelve creatures, five arenas and team fighting rules remain. Commercial reference characters, logos, screenshots and Mana Seed font files are not included.

## Artwork and prompts

The **built-in image-generation tool** created new original title key art and three four-character sprite sheets. This was not the CLI/API-key workflow. The work is generated artwork, not a claim of human hand-drawn sprites. Every exact final generation prompt is saved in [art-prompts.json](art-prompts.json).

Production files:

- `assets/art/title-key-art.webp` — illustrated title cover, optimized locally from the generated original.
- `assets/art/fighters-ember-tide.png` — Ashfang, Kilnback, Reefclaw, Inkveil.
- `assets/art/fighters-volt-wild.png` — Zipcat, Boltstag, Thornox, Petalmoth.
- `assets/art/fighters-void-frost.png` — Hexeye, Nullwyrm, Glaciop, Crysteel.

Original generated files remain in `assets/art/source/` with the corresponding filenames (`title-key-art.png` for the cover). The running game requests only the optimized production files. The cover is about 576 KB; all three atlases together are about 296 KB.

Each production atlas is 384×384, arranged as four rows by four columns of 96×96 cells. Each row is one fighter; columns are idle, attack, hit and KO. All four poses in a row use one 28-color palette and 0/255 alpha. Feet share the same baseline; poses retain a common scale. Runtime rendering uses integer destination dimensions and disabled image smoothing. Walking/idle use a small bob and ducking compresses the idle pose; there are no separate authored walk-cycle frames.

`pixel-worlds.js` draws the five scenery layers directly on the integer pixel grid. It uses authored palettes, stepped silhouettes, stone blocks, tree trunks, canopy clusters, decorative ruins and weather. Cached scenery keeps the active battle rendering inexpensive. Scenery does not change combat rules.

## Rebuild locally

The existing Playwright browser runtime performs the packing and PNG/WebP export. It trims transparent margins within each source cell, normalizes scale per character, downsamples with nearest-neighbor sampling and applies weighted median-cut palette reduction. It adds no runtime dependency or image API.

```sh
npm ci
npx playwright install chromium
npm run art:pack
```

The original source PNGs remain intact. Do not overwrite a source atlas when editing only a runtime asset; update the source deliberately and regenerate all affected production files. The browser checks verify the atlas dimensions, bounded color count, binary alpha and actual in-game loading.

## Font

`assets/fonts/pixelify-sans.ttf` is Pixelify Sans, by The Pixelify Sans Project Authors. Its license is retained in `assets/fonts/PixelifySans-OFL.txt`. The source is the [official Google Fonts directory](https://github.com/google/fonts/tree/main/ofl/pixelifysans); the [project repository](https://github.com/eifetx/Pixelify-Sans) documents the font. It is an openly licensed stylistic alternative to the supplied Mana Seed lettering reference, not that proprietary font.

The font is bundled locally. The previous Google Fonts import was removed, so font rendering does not require a third-party request. No paid font, paid service or new package dependency was added.

## Camera and layout

The camera uses the two active fighters' positions and jump height only. It scales the view to fit both bodies beneath the HUD, follows their midpoint and stays inside the arena bounds where possible. The native canvas matches the actual display aspect, so portrait no longer stretches sprites or leaves a thin strip of gameplay between large empty bars. Close combat renders fighters substantially larger than the previous 24-pixel artwork.

Keyboard, touch, fullscreen, menus, CPU policies, online team validation and reconnection are retained. Tests cover the title screen, loaded font/art, seven viewport sizes, orientation changes, reserve choices, visible fighter size, jump framing and two-browser online battles.
