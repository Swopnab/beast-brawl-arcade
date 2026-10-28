import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createMatch, step, emptyInput, queueAction } from "../combat.js";
import { FIGHTERS } from "../fighters.js";
import {
  validatePolicy,
  logits,
  createLearnedBot,
  legalActions,
  observation,
  predictAction,
} from "../ml-policy.js";
const model = JSON.parse(
    fs.readFileSync(new URL("../ml/practice-policy.json", import.meta.url)),
  ),
  parity = JSON.parse(
    fs.readFileSync(
      new URL("../evaluation/inference-parity.json", import.meta.url),
    ),
  );
test("exported browser network matches PyTorch outputs on held-out examples", () => {
  validatePolicy(model);
  let worst = 0;
  parity.features.forEach((x, i) =>
    logits(model, x).forEach(
      (v, j) => (worst = Math.max(worst, Math.abs(v - parity.logits[i][j]))),
    ),
  );
  assert(worst < 0.0001, `Maximum output error: ${worst}`);
});
test("invalid weights and malformed observations are rejected", () => {
  const bad = structuredClone(model);
  bad.layers[0].weights[0][0] = NaN;
  assert.throws(() => validatePolicy(bad));
  assert.throws(() => logits(model, [NaN]));
});
test("legality masks prevent unavailable ultimates, deflects, or action during recovery", () => {
  const s = createMatch("ashfang", "zipcat", { mode: "bot" });
  s.phase = "fight";
  s.fighters[1].deflectCooldown = 20;
  assert(!legalActions(s).includes("ultimate"));
  assert(!legalActions(s).includes("deflect"));
  s.fighters[1].cooldown = 10;
  assert.deepEqual(legalActions(s), ["wait"]);
  assert.equal(predictAction(model, s), "wait");
});
test("learned bot damages a rival and completes matches across the twelve fighters", () => {
  for (const f of FIGHTERS) {
    const s = createMatch("ashfang", f.id, {
        mode: "bot",
        botPolicy: "trained",
        matchId: f.id,
      }),
      bot = createLearnedBot(model);
    let damage = false;
    for (let i = 0; i < 12500 && s.phase !== "finished"; i++) {
      step(s, [emptyInput(), emptyInput()], bot);
      damage ||= s.fighters[0].hp < s.fighters[0].maxHp;
    }
    assert(damage, `${f.id} attacks`);
    assert.equal(s.phase, "finished");
  }
});
test("online matches never invoke the practice policy", () => {
  const s = createMatch("ashfang", "zipcat", { mode: "online" });
  s.phase = "fight";
  let called = 0;
  step(s, [emptyInput(), emptyInput()], () => {
    called++;
    return emptyInput();
  });
  assert.equal(called, 0);
});
test("model uses observable combat state and exports fourteen finite features", () => {
  const s = createMatch("ashfang", "zipcat", { mode: "bot" });
  assert.equal(observation(s).length, 14);
  assert(observation(s).every(Number.isFinite));
});
