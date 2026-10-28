const assert = require("node:assert/strict"),
  path = require("node:path"),
  fs = require("node:fs/promises");
const { chromium } = require("playwright"),
  { serve } = require("./server.cjs");
const sizes = [
  [320, 568],
  [390, 844],
  [568, 320],
  [844, 390],
  [768, 1024],
  [1024, 768],
  [1440, 1000],
];
async function fits(p, selector, w, h) {
  const b = await p.locator(selector).boundingBox();
  assert(
    b &&
      b.x >= -1 &&
      b.y >= -1 &&
      b.x + b.width <= w + 1 &&
      b.y + b.height <= h + 1,
    `${selector} fits ${w}x${h}: ${JSON.stringify(b)}`,
  );
}
async function shot(p, name) {
  if (process.env.BEAST_SCREENSHOTS) {
    await fs.mkdir(process.env.BEAST_SCREENSHOTS, { recursive: true });
    await p.screenshot({
      path: path.join(process.env.BEAST_SCREENSHOTS, name + ".png"),
    });
  }
}
(async () => {
  const site = await serve(path.resolve(__dirname, "..")),
    browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader"] });
  try {
    for (const [width, height] of sizes) {
      const context = await browser.newContext({
        viewport: { width, height },
        hasTouch: true,
      });
      await context.route('**/app.js*',async r=>{const response=await r.fetch();await r.fulfill({response,body:await response.text()+`\nwindow.__test={state:()=>match,knockout:()=>{match.fighters[0].hp=0;}};`});});
      const p = await context.newPage(),
        errors = [],requests=[];
      p.on('request',r=>requests.push(r.url()));
      p.on("pageerror", (e) => errors.push(e.message));
      await p.goto(site.url);
      await p.waitForFunction(
        () => document.querySelectorAll("[data-stage]").length === 5,
      );
      await p.evaluate(() => document.fonts.ready);
      await p.waitForFunction(
        () => !document.querySelector("#trained-option").disabled,
      );
      for (const id of ["#mode-pvp", "#mode-bot", "#cpu-policy"])
        await fits(p, id, width, height);
      assert(await p.evaluate(() => document.fonts.check("16px ArcadePixel")));
      await shot(p, `${width}-mode`);
      await p.locator("#mode-bot").click();
      for (const item of await p.locator("[data-stage]").all()) {
        const box = await item.boundingBox();
        assert(box.height >= 44 && box.width >= 44);
      }
      for (const id of ["volcano", "water", "rain", "desert", "jungle"])
        await fits(p, `[data-stage="${id}"]`, width, height);
      await shot(p, `${width}-stage`);
      await p.locator('[data-stage="water"]').click();
      assert.equal(await p.locator(".fighter-card").count(), 12);
      for (const item of await p.locator(".fighter-card").all()) {
        const id = await item.getAttribute("data-id");
        await fits(p, `[data-id="${id}"]`, width, height);
      }
      await shot(p, `${width}-fighter`);
      await p.locator('[data-id="ashfang"]').click();
      await p.locator('[data-id="reefclaw"]').click();
      await p.locator('[data-id="glaciop"]').click();
      await p.locator("#lock-team").click();
      await p.locator("#battle-screen").waitFor();
      assert.match(await p.locator("#battle-mode").textContent(), /TRAINED CPU/);
      await fits(p, "#arena", width, height);
      await fits(p, "#glass-joystick", width, height);
      for (const a of ["q", "e", "r", "space"])
        await fits(p, `[data-action="${a}"]`, width, height);
      await shot(p, `${width}-battle`);
      await p.waitForFunction(()=>window.__test.state()?.phase==='fight');
      await p.evaluate(()=>window.__test.knockout());
      await p.locator('[data-replace="reefclaw"]').waitFor();
      await fits(p,'[data-replace="reefclaw"]',width,height);
      await fits(p,'[data-replace="glaciop"]',width,height);
      await shot(p,`${width}-reserve`);
      await p.locator('[data-replace="glaciop"]').click();
      await p.waitForFunction(()=>window.__test.state().fighters[0].id==='glaciop');
      await p.waitForFunction(()=>document.querySelector('#p1-name').textContent==='GLACIOP');
      assert.equal(requests.some(u=>/three|graphics3d|creatures3d|worlds3d/.test(u)),false);
      assert.equal(await p.locator('#arena').evaluate(c=>c.getContext('2d').imageSmoothingEnabled),false);
      if(width===390){await p.setViewportSize({width:844,height:390});await fits(p,'#arena',844,390);assert.equal(await p.evaluate(()=>window.__test.state().fighters[0].id),'glaciop');await p.setViewportSize({width,height});}
      await p.locator("#battle-moves").click();
      assert(await p.locator("#moves-dialog").isVisible());
      await p.locator('[data-close="moves-dialog"]').click();
      await p.locator("#exit-battle").click();
      await p.locator("#confirm-exit").click();
      assert(await p.locator("#mode-screen").isVisible());
      assert(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      );
      assert.deepEqual(errors, []);
      await context.close();
      console.log(
        `PASS arcade setup, 5 stages, 12 fighters, trained CPU, reserve choices, dialogs and touch controls: ${width}x${height}`,
      );
    }
    // Exercise a real trained fight and model-missing classic fallback; WebGL is not needed.
    const c = await browser.newContext({
      viewport: { width: 1100, height: 800 },
    });
    await c.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        return /webgl/.test(type) ? null : get.call(this, type, ...args);
      };
    });
    const p = await c.newPage();
    await p.goto(site.url);
    await p.waitForFunction(
      () => document.querySelectorAll("[data-stage]").length === 5,
    );
    await p.waitForFunction(
      () => !document.querySelector("#trained-option").disabled,
    );
    await p.locator("#mode-bot").click();
    await p.locator('[data-stage="rain"]').click();
    await p.locator('[data-id="ashfang"]').click();
      await p.locator('[data-id="reefclaw"]').click();
      await p.locator('[data-id="glaciop"]').click();
      await p.locator("#lock-team").click();
    await p.waitForFunction(
      () => {
        const e = document.querySelector("#p1-hp");
        if (!e) return false;
        const [hp, max] = e.textContent.split("/").map(Number);
        return hp < max;
      },
      null,
      { timeout: 30000 },
    );
    await shot(p, "trained-cpu-active-fight");
    assert.match(await p.locator("#battle-mode").textContent(), /TRAINED CPU/);
    await c.close();
    const offline = await browser.newPage();
    await offline.route("**/ml/practice-policy.json*", (r) =>
      r.fulfill({ status: 503, body: "unavailable" }),
    );
    await offline.goto(site.url);
    await offline
      .locator("#cpu-note")
      .filter({ hasText: "unavailable" })
      .waitFor();
    await offline.locator("#mode-bot").click();
    await offline.locator('[data-stage="volcano"]').click();
    await offline.locator('[data-id="zipcat"]').click();
    await offline.locator("#lock-team").click();
    assert.match(
      await offline.locator("#battle-mode").textContent(),
      /CLASSIC CPU/,
    );
    await offline.close();
    console.log(
      "PASS trained opponent inflicts damage in browser, 2D pixel rendering, and missing-model classic fallback",
    );
  } finally {
    await browser.close();
    site.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
