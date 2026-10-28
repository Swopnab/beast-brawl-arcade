// Controlled game rollouts against a scripted coach, not human win-rate evidence.
import fs from "node:fs";
import { createMatch, step, queueAction, emptyInput } from "../combat.js";
import { FIGHTERS } from "../fighters.js";
import { createLearnedBot } from "../ml-policy.js";
import { coach } from "./coach.js";
const model = JSON.parse(
    fs.readFileSync(new URL("./practice-policy.json", import.meta.url)),
  ),
  runs = [];
for (const policy of ["classic", "trained"])
  for (let i = 0; i < 12; i++) {
    const s = createMatch(FIGHTERS[i].id, FIGHTERS[(i + 5) % 12].id, {
      mode: "bot",
      botPolicy: policy,
      seed: 1000 + i,
      matchId: policy + i,
    });
    const bot = policy === "trained" ? createLearnedBot(model) : null;
    let held = emptyInput(),
      ticks = 0;
    while (s.phase !== "finished" && ticks < 12500) {
      if (s.phase === "fight" && s.frame % 8 === 0) {
        held = emptyInput();
        const action = coach(s, 0),
          dx = s.fighters[1].x - s.fighters[0].x;
        if (action === "approach" || action === "retreat") {
          const direction = Math.sign(dx) * (action === "retreat" ? -1 : 1);
          held.left = direction < 0;
          held.right = direction > 0;
        }
        held.duck = action === "duck";
        held.jump = action === "jump";
        const command = {
          strike: "e",
          ranged: "q",
          deflect: "r",
          ultimate: "space",
        }[action];
        if (command) queueAction(s, 0, command, held);
      }
      step(s, [held, emptyInput()], bot);
      ticks++;
    }
    runs.push({
      policy,
      seed: 1000 + i,
      player: FIGHTERS[i].id,
      cpu: FIGHTERS[(i + 5) % 12].id,
      winner: s.winner,
      ticks,
      finished: s.phase === "finished",
      cpu_round_wins: s.fighters[1].roundWins,
    });
  }
const summary = Object.fromEntries(
  ["classic", "trained"].map((policy) => {
    const r = runs.filter((x) => x.policy === policy);
    return [
      policy,
      {
        matches: r.length,
        cpu_wins: r.filter((x) => x.winner === 1).length,
        draws: r.filter((x) => x.winner === null).length,
        completed: r.filter((x) => x.finished).length,
      },
    ];
  }),
);
fs.writeFileSync(
  new URL("../evaluation/policy-simulation.json", import.meta.url),
  JSON.stringify(
    {
      opponent:
        "Scripted coach controlling player 1 every eight ticks. Twelve fixed fighter pairings and seeds per policy. Not human gameplay.",
      summary,
      runs,
    },
    null,
    2,
  ) + "\n",
);
console.log(summary);
