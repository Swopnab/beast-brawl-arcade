# Resume wording after you can reproduce and explain the work

The current game genuinely uses Three.js, PeerJS and WebRTC. They are graphics/networking tools, not AI frameworks. There is no need to list every library in a project subtitle.

A focused project entry can use:

**Beast Brawl Arcade - ML Practice Opponent & Multiplayer Game**

**Python, PyTorch, Pandas, JavaScript**

- Trained a PyTorch practice opponent on 57,600 synthetic combat states and evaluated coach agreement on 9,600 held-out states.
- Integrated exported neural-network weights into a browser game with 12 fighters and 5 arenas, with automated inference, combat and multiplayer checks.

If you quote a result, use the current evaluation file and explicitly call it **synthetic coach agreement**, not player accuracy or human win rate. See the per-action metrics too. Do not describe this as reinforcement learning or self-play training.

A shorter networking bullet, if you want to retain it:

- Built browser-to-browser two-player matches with shared combat state and reconnectable rooms.

For the skills section, Python, PyTorch and Pandas now have identifiable source files in this project. Retain a “Foundational” tool only if you can explain it and point to your own hands-on exercise or project. This change does not establish experience with TensorFlow, LangChain, Docker, AWS or Azure. Review `AI-LEARNING-GUIDE.md` before promoting any skill to an interview claim.
