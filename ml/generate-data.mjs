import fs from "node:fs";
import { createMatch } from "../combat.js";
import { FIGHTERS } from "../fighters.js";
import { observation, POLICY_ACTIONS, FEATURES } from "../ml-policy.js";
import { coach } from "./coach.js";
let seed = 20261027;
function random() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
}
const range = (a, b) => a + (b - a) * random();
const output = process.argv[2] || "ml/data.jsonl";
const file = fs.openSync(output, "w");
const counts = { train: 0, validation: 0, test: 0 };
for (let episode = 0; episode < 320; episode++) {
  const split = episode < 240 ? "train" : episode < 280 ? "validation" : "test";
  for (let row = 0; row < 240; row++) {
    const self = FIGHTERS[Math.floor(random() * 12)].id,
      other = FIGHTERS[Math.floor(random() * 12)].id;
    const s = createMatch(other, self, {
      mode: "online",
      seed: episode + 1,
      matchId: "synthetic-" + episode,
    });
    s.phase = "fight";
    s.frame = row * 8;
    const [op, f] = s.fighters,
      d = range(85, 850),
      side = random() < 0.5 ? -1 : 1;
    f.x = side > 0 ? 100 : 1100;
    op.x = f.x + side * d;
    f.energy = random() < 0.2 ? 100 : range(0, 100);
    f.hp = range(0.08, 1) * f.maxHp;
    op.hp = range(0.08, 1) * op.maxHp;
    f.y = random() < 0.15 ? -range(30, 160) : 0;
    f.cooldown = random() < 0.18 ? Math.floor(range(1, 50)) : 0;
    f.stun = random() < 0.05 ? Math.floor(range(1, 25)) : 0;
    f.deflectCooldown = random() < 0.45 ? Math.floor(range(1, 40)) : 0;
    f.counterWindow = random() < 0.15 ? Math.floor(range(1, 45)) : 0;
    if (random() < 0.28)
      op.attack = { age: Math.floor(range(0, 15)), active: 12 };
    if (random() < 0.3)
      s.projectiles = [
        { owner: 0, x: f.x + side * range(30, 500), vx: -side * 13 },
      ];
    const x = observation(s),
      y = POLICY_ACTIONS.indexOf(coach(s));
    fs.writeSync(file, JSON.stringify({ episode, split, x, y }) + "\n");
    counts[split]++;
  }
}
fs.closeSync(file);
console.log(
  JSON.stringify(
    {
      output,
      counts,
      features: FEATURES,
      actions: POLICY_ACTIONS,
      seed: 20261027,
      note: "Independent synthetic snapshots grouped by generation episode; no human gameplay data.",
    },
    null,
    2,
  ),
);
