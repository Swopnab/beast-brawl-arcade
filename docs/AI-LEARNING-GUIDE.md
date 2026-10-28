# Beast Brawl: understand the code before putting it on your resume

This project has two separate stories: an arcade game and a small machine-learning experiment. You can explain either without pretending to know every library.

## The three names from your current resume

| Name     | What it does here                                                | What you should be able to explain                                                                                       |
| -------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Three.js | Rendered the previous 3D edition; the current pixel edition uses Canvas.        | A scene contains models, a camera and lights. The renderer turns them into pixels. It is graphics, not machine learning. |
| PeerJS   | Handles room setup and connection events for the two players.    | The host runs combat; the guest sends input. Disconnecting pauses the room; a saved seat token allows reconnection.      |
| WebRTC   | Carries game data directly between the two browsers after setup. | It transports messages. It does not decide damage, control the CPU, or train a model.                                    |

You do not need to foreground networking libraries on an AI/ML resume. PeerJS and WebRTC remain because they provide multiplayer. Three.js is retained only in legacy source, not loaded by the current pixel edition. A plain description such as “browser-to-browser multiplayer with reconnectable rooms” is accurate, provided you can explain the host/guest design.

## What the new trained opponent actually does

The CPU takes fourteen numeric features: distance/direction, both health ratios, its energy/cooldown/stun, approaching projectile distance, rival attack timing, its deflect cooldown, height, counter window and reach. It chooses one of nine actions: approach, retreat, strike, ranged attack, deflect, ultimate, duck, jump or wait.

A small PyTorch network learns to imitate `ml/coach.js`, a transparent scripted coach. This is **supervised imitation learning**, also called behavior cloning. It is not reinforcement learning, a self-learning opponent, an LLM, or a model trained on human gameplay. The classic CPU remains available as a separate option.

The model is trained offline. Exported weights in `ml/practice-policy.json` run through a small JavaScript forward pass in `ml-policy.js`. No Python server, paid API or GPU service runs while someone plays. The model decides every eight simulation frames. Combat still enforces ordinary cooldowns, energy costs, damage and other game rules.

## The tools you now have concrete project evidence for

- **Python:** loads the generated dataset, runs training and writes artifacts.
- **PyTorch:** defines the neural network, calculates loss/gradients and updates weights.
- **Pandas:** reads the JSONL data, groups split counts and writes per-action evaluation tables.
- **JavaScript:** creates synthetic snapshots, runs browser inference and connects decisions to combat.
- **Automated testing:** checks inference parity with PyTorch, legal actions, all twelve fighters, online isolation and responsive gameplay.

TensorFlow, LangChain, Docker, AWS and Azure are not required for this feature. Keep those names on your resume only when you have separate hands-on experience you can explain. A certification or “Foundational” label is not the same claim as building and deploying with a tool.

## Reproduce it yourself

Use Node.js 22+ and Python 3.12. From the repository root:

```sh
python3.12 -m venv .venv
.venv/bin/python -m pip install -r ml/requirements.txt
npm ci
node ml/generate-data.mjs
.venv/bin/python ml/train.py
node ml/evaluate.mjs
npm test
npm run dev
```

The packages are free. The dataset is generated locally and ignored by Git. The checked-in model lets the game run without training packages. On Windows, use the equivalent Python executable in `.venv/Scripts/`.

1. Open `ml/coach.js`. Explain why the coach approaches at long range, attacks nearby, and considers incoming projectiles.
2. Run the generator. It makes 76,800 **independent synthetic snapshots**, grouped into generation batches. These are not 320 real played matches.
3. Read the split: 57,600 training states, 9,600 validation states, and 9,600 test states. Batch IDs do not overlap. Training updates weights; validation selects the checkpoint; test measures it once after selection.
4. Find `nn.Linear`, `nn.ReLU`, `CrossEntropyLoss`, `zero_grad`, `backward`, and `optimizer.step` in `ml/train.py`. Explain each in your own words.
5. Change one coach rule, regenerate and retrain. Predict which action will be affected before looking at the result.
6. Read `evaluation/practice-policy.json` and `policy-actions.csv`. Accuracy is agreement with the coach; macro F1 gives rare actions equal weight. Check rare-action results instead of quoting accuracy alone.
7. Read the parity test. JavaScript and PyTorch should produce nearly identical scores on the same inputs.
8. Play **Classic CPU** and **Trained CPU** on the same fighter/stage. Explain a failure you observed rather than assuming the trained model is better.

## How to read the results honestly

The final measured classifier results are in `evaluation/practice-policy.json`. The majority-action baseline is also reported because most sampled states call for approaching. Synthetic teacher agreement does not establish skill against people or robustness to every real match state.

`evaluation/policy-simulation.json` compares classic and trained CPUs against the scripted coach on twelve fixed pairings/seeds each. This is a small controlled game check, not a statistically established human win rate. Neither experiment is a production AI benchmark.

The action mask prevents unavailable ultimates, airborne duck/jump commands and attacks during cooldown. It is a rules guard around the model, not evidence that the model learned every combat rule.

## Interview questions to answer before using the ML bullet

- What are the input features, labels and data source?
- Why use a validation split as well as a test split?
- Why can 97% accuracy still hide poor performance on rare actions?
- What is a neural-network forward pass? What does training change?
- Why export weights rather than call a paid inference API?
- What happens when the model file fails to load?
- How would you collect consented human examples or evaluate generalization to new opponents?
- Why is the simpler classic bot still useful?

Running AI-generated code once does not establish proficiency. Rerun it, change it, inspect a failure and explain the tradeoffs. That is the knowledge this project can help you build.

## Team-battle update

The current edition has attack/defense/speed budgets, elemental damage and teams of up to three. The trained policy still controls only the active CPU fighter. Reserve selection uses the type chart directly; it is not learned. The original classifier metric describes the original synthetic dataset, not the new team strategy. `evaluation/policy-simulation.json` has been rerun on the current combat rules, and `evaluation/roster-balance.json` contains symmetric scripted roster checks. Neither report measures human win rates.
