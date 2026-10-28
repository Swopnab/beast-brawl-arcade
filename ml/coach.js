// Transparent synthetic-data teacher: imitation learning, not reinforcement learning.
import { observation, POLICY_ACTIONS } from "../ml-policy.js";
export function coach(s, index = 1) {
  const x = observation(s, index),
    d = x[0] * 1080,
    reach = x[13] * 240;
  if (x[5] > 0 || x[6] > 0) return "wait";
  if (x[11] > 0) return d < reach ? "strike" : "approach";
  if (x[7] * 600 < 120) {
    if (x[10] === 0) return "deflect";
    return x[2] < 0.5 ? "duck" : "jump";
  }
  if (x[8] && x[9] * 30 < 6 && d < 180 && x[10] === 0) return "deflect";
  if (x[4] >= 1 && d < 170) return "ultimate";
  if (x[12] > 0 && d < 170) return "strike";
  if (x[2] < 0.25 && d < 110) return "retreat";
  if (d > 300 && x[3] < 0.25) return "ranged";
  if (d > reach - 10) return "approach";
  return "strike";
}
