// A small exported PyTorch network. Training stays offline; inference stays in the browser.
import { fighter } from "./fighters.js?v=12";
import { emptyInput, queueAction } from "./combat.js?v=12";
export const FEATURES = [
  "distance",
  "direction",
  "health",
  "rival_health",
  "energy",
  "cooldown",
  "stun",
  "projectile_distance",
  "rival_attack",
  "rival_windup",
  "deflect_cooldown",
  "airborne",
  "counter",
  "reach",
];
export const POLICY_ACTIONS = [
  "approach",
  "retreat",
  "strike",
  "ranged",
  "deflect",
  "ultimate",
  "duck",
  "jump",
  "wait",
];
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export function observation(s, index = 1) {
  const f = s.fighters[index],
    op = s.fighters[1 - index],
    dx = op.x - f.x;
  const shots = s.projectiles.filter(
    (p) => p.owner !== index && p.vx * (f.x - p.x) > 0,
  );
  const incoming = shots.length
    ? Math.min(...shots.map((p) => Math.abs(p.x - f.x)))
    : 600;
  return [
    clamp(Math.abs(dx) / 1080),
    clamp(dx / 1080, -1, 1),
    f.hp / f.maxHp,
    op.hp / op.maxHp,
    f.energy / 100,
    clamp(f.cooldown / 66),
    clamp(f.stun / 30),
    clamp(incoming / 600),
    op.attack ? 1 : 0,
    op.attack ? clamp((op.attack.active - op.attack.age) / 30) : 1,
    clamp(f.deflectCooldown / 40),
    clamp(-f.y / 240),
    clamp(f.counterWindow / 45),
    fighter(f.id).reach / 240,
  ];
}
export function validatePolicy(model) {
  if (
    model?.schema !== 1 ||
    JSON.stringify(model.features) !== JSON.stringify(FEATURES) ||
    JSON.stringify(model.actions) !== JSON.stringify(POLICY_ACTIONS) ||
    !Array.isArray(model.layers) ||
    model.layers.length !== 3
  )
    throw new Error("Unsupported practice model");
  let width = FEATURES.length;
  for (const layer of model.layers) {
    if (
      !Array.isArray(layer.weights) ||
      !layer.weights.length ||
      layer.bias?.length !== layer.weights.length ||
      layer.weights.some(
        (row) => row.length !== width || row.some((n) => !Number.isFinite(n)),
      ) ||
      layer.bias.some((n) => !Number.isFinite(n))
    )
      throw new Error("Invalid practice weights");
    width = layer.bias.length;
  }
  if (width !== POLICY_ACTIONS.length)
    throw new Error("Invalid practice output");
  return model;
}
export function logits(model, features) {
  if (
    features.length !== FEATURES.length ||
    features.some((x) => !Number.isFinite(x))
  )
    throw new Error("Invalid observation");
  let values = features;
  for (let i = 0; i < model.layers.length; i++) {
    const layer = model.layers[i];
    values = layer.weights.map((row, j) => {
      const value = row.reduce(
        (sum, w, k) => sum + w * values[k],
        layer.bias[j],
      );
      return i < model.layers.length - 1 ? Math.max(0, value) : value;
    });
  }
  return values;
}
export function legalActions(s, index = 1) {
  const f = s.fighters[index],
    op = s.fighters[1 - index],
    d = Math.abs(f.x - op.x);
  if (s.phase !== "fight" || f.stun || f.cooldown || f.attack) return ["wait"];
  return POLICY_ACTIONS.filter((a) => a !== "ultimate" || f.energy >= 100)
    .filter((a) => a !== "deflect" || !f.deflectCooldown)
    .filter((a) => !["duck", "jump"].includes(a) || f.y === 0)
    .filter((a) => a !== "approach" || d > 90);
}
export function predictAction(model, s, index = 1) {
  const scores = logits(model, observation(s, index)),
    allowed = legalActions(s, index);
  return allowed.reduce(
    (best, a) =>
      scores[POLICY_ACTIONS.indexOf(a)] > scores[POLICY_ACTIONS.indexOf(best)]
        ? a
        : best,
    allowed[0],
  );
}
export function createLearnedBot(model) {
  validatePolicy(model);
  let held = emptyInput(),
    last = -Infinity,
    lastMatch = null, lastPair = null;
  return (s) => {
    if (s.id !== lastMatch || s.frame < last || lastPair !== s.fighters.map(f=>f.id).join()) {
      last = -Infinity;
      lastMatch = s.id;lastPair = s.fighters.map(f=>f.id).join();
      held = emptyInput();
    }
    if (s.phase !== "fight") return emptyInput();
    if (s.frame - last < 8) return held;
    last = s.frame;
    const action = predictAction(model, s),
      f = s.fighters[1],
      dx = s.fighters[0].x - f.x;
    held = emptyInput();
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
    if (command) queueAction(s, 1, command, held);
    return held;
  };
}
