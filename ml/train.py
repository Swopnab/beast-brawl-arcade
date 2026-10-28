"""Train a small behavior-cloning policy; export reproducible browser weights and evaluation."""

import copy, hashlib, json, random
from pathlib import Path
import pandas as pd
import torch
from torch import nn

ROOT = Path(__file__).resolve().parents[1]
torch.manual_seed(7)
random.seed(7)
torch.set_num_threads(1)
source = ROOT / "ml/data.jsonl"
df = pd.read_json(source, lines=True)
x = torch.tensor(df.x.tolist(), dtype=torch.float32)
y = torch.tensor(df.y.tolist(), dtype=torch.long)
parts = {
    name: torch.tensor(df.split.eq(name).to_numpy())
    for name in ["train", "validation", "test"]
}
for a, b in [("train", "validation"), ("train", "test"), ("validation", "test")]:
    assert not set(df[df.split == a].episode) & set(df[df.split == b].episode)
features = [
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
]
actions = [
    "approach",
    "retreat",
    "strike",
    "ranged",
    "deflect",
    "ultimate",
    "duck",
    "jump",
    "wait",
]
model = nn.Sequential(
    nn.Linear(len(features), 48),
    nn.ReLU(),
    nn.Linear(48, 32),
    nn.ReLU(),
    nn.Linear(32, len(actions)),
)
counts = torch.bincount(y[parts["train"]], minlength=len(actions)).float()
assert counts.min() > 0
loss = nn.CrossEntropyLoss(weight=(counts.sum() / counts).sqrt())
optimizer = torch.optim.Adam(model.parameters(), lr=0.003)
best = float("inf")
saved = None
history = []
for epoch in range(100):
    model.train()
    order = torch.where(parts["train"])[0]
    order = order[torch.randperm(len(order))]
    for batch in order.split(512):
        optimizer.zero_grad()
        value = loss(model(x[batch]), y[batch])
        value.backward()
        optimizer.step()
    model.eval()
    with torch.no_grad():
        val = float(loss(model(x[parts["validation"]]), y[parts["validation"]]))
    if val < best:
        best = val
        saved = copy.deepcopy(model.state_dict())
        best_epoch = epoch + 1
    history.append({"epoch": epoch + 1, "validation_loss": val})
    if epoch % 20 == 0:
        print("epoch", epoch + 1, "validation_loss", round(val, 4), flush=True)
model.load_state_dict(saved)
model.eval()
with torch.no_grad():
    scores = model(x[parts["test"]])
    pred = scores.argmax(1)
    true = y[parts["test"]]
per = []
for i, name in enumerate(actions):
    tp = int(((pred == i) & (true == i)).sum())
    fp = int(((pred == i) & (true != i)).sum())
    fn = int(((pred != i) & (true == i)).sum())
    precision = tp / max(1, tp + fp)
    recall = tp / max(1, tp + fn)
    per.append(
        {
            "action": name,
            "support": int((true == i).sum()),
            "precision": precision,
            "recall": recall,
            "f1": 2 * precision * recall / max(1e-12, precision + recall),
        }
    )
report = {
    "method": "Supervised imitation of a scripted coach on synthetic combat snapshots; not reinforcement learning or human play.",
    "torch": torch.__version__,
    "pandas": pd.__version__,
    "training_seed": 7,
    "data_seed": 20261027,
    "dataset_sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
    "splits": df.groupby("split").size().to_dict(),
    "split_rule": "Disjoint generation-batch IDs: 0-239 train, 240-279 validation, 280-319 test.",
    "best_epoch": best_epoch,
    "test_accuracy": float((pred == true).float().mean()),
    "test_macro_f1": sum(r["f1"] for r in per) / len(per),
    "majority_baseline_accuracy": float((true == int(counts.argmax())).float().mean()),
    "per_action": per,
    "limits": [
        "Teacher-agreement metrics are not human win rate or proof of strategic intelligence.",
        "Snapshots are synthetic and independent; not a real human-gameplay dataset.",
        "No online learning, human telemetry or paid API inference.",
    ],
}
(ROOT / "evaluation").mkdir(exist_ok=True)
(ROOT / "evaluation/practice-policy.json").write_text(
    json.dumps(report, indent=2) + "\n"
)
pd.DataFrame(per).to_csv(ROOT / "evaluation/policy-actions.csv", index=False)
export = {
    "schema": 1,
    "features": features,
    "actions": actions,
    "training": {
        "framework": "PyTorch",
        "method": "behavior cloning",
        "seed": 7,
        "dataset_sha256": report["dataset_sha256"],
    },
    "layers": [],
}
for layer in model:
    if isinstance(layer, nn.Linear):
        export["layers"].append(
            {
                "weights": layer.weight.detach().tolist(),
                "bias": layer.bias.detach().tolist(),
            }
        )
(ROOT / "ml/practice-policy.json").write_text(
    json.dumps(export, separators=(",", ":")) + "\n"
)
indices = torch.where(parts["test"])[0][:32]
with torch.no_grad():
    parity = {"features": x[indices].tolist(), "logits": model(x[indices]).tolist()}
(ROOT / "evaluation/inference-parity.json").write_text(
    json.dumps(parity, separators=(",", ":")) + "\n"
)
print(json.dumps(report, indent=2), flush=True)
