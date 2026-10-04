/* Publication data. Every number here is taken from the paper itself (or, for GCD, the NeurIPS rebuttal
   and final poster). Edit this file to add papers or attach PDFs; the page renders from it.

   status:  "accepted" | "review"
   pdf:     path to a public PDF (e.g. "assets/papers/gcd.pdf") or an arXiv URL, or null.
            Papers under double-blind review stay null until the review ends.
   poster:  optional { image, caption, pdf } */
window.PAPERS = [
  {
    id: "gcd",
    short: "GCD",
    title: "GCD: Correcting Hidden-State Bias in Off-Policy Agentic RL",
    venue: "NeurIPS 2026",
    venueLong: "Conference on Neural Information Processing Systems (NeurIPS 2026), Main Track",
    status: "accepted",
    statusLabel: "Accepted · Main Track",
    year: 2026,
    role: "First author (co-first, listed first)",
    authors: [
      { name: "Changyuan Chen", me: true, eq: true },
      { name: "Jianyu Xiang", eq: true },
      { name: "Jiasheng Luo", eq: true },
      { name: "Ziye Wang", eq: true },
      { name: "Nallappan Gunasekaran", corr: true }
    ],
    authorNote: "* Equal contribution (co-first authors). † Corresponding author. Rebuttal completed by Changyuan Chen during his internship at Tsinghua University.",
    topics: ["Agentic RL", "ML systems"],
    thumb: "gcd",
    tldr: "Reusing a KV cache across policy updates makes the sampler a hidden mix of old and new weights. The importance ratio cannot see it; GCD bounds it, detects where the bound fails, and recomputes only there.",
    highlights: [
      ["67.1 vs 48.1", "MATH-500 at staleness 512 — M2PO+GCD stays stable while M2PO collapses"],
      ["+5.7", "τ-bench retail pass^4 at staleness 256 (44.1 vs 38.4, p < 0.001)"],
      ["1.38×", "rollout throughput vs full recomputation (Qwen3.5-9B, staleness 512)"]
    ],
    problem: "Partial-rollout RL systems keep generating with a stale KV cache after the policy is updated. Attention then reads keys and values written by the old weights while the MLP and output layers use the new ones, so tokens are actually sampled from a hybrid policy. The token-level importance ratio cannot detect this: its denominator was stored at rollout time, while its numerator comes from the hybrid pass — the ratio looks well-behaved, but its target policy is wrong.",
    method: [
      "Measure the hidden gap directly: on Qwen3.5-9B the median bias is 0.034 nats/token at staleness 256 and 0.108 at staleness 512.",
      "Derive a per-layer high-probability drift bound with separate terms for full-attention and Gated DeltaNet layers (tightness 0.64–0.80 on the 95.9% of tokens it covers).",
      "Add a tail-event detector for the tokens outside the bound's regime of validity, and selectively recompute only those positions.",
      "Prove that the corrected weight composes with the M2PO trust region, so GCD plugs into existing off-policy recipes."
    ],
    results: [
      ["MATH-500, staleness 512", "M2PO+GCD 67.1% vs M2PO 48.1% (collapses)"],
      ["τ-bench retail pass^4, staleness 256", "44.1 vs 38.4 (+5.7, p < 0.001)"],
      ["Rollout throughput", "1.38× full recomputation (Qwen3.5-9B, staleness 512); extra compute ≈ 1.9% of a full recompute"],
      ["Ground-truth check (rebuttal)", "corrected weight closer to full recomputation on 68% / 74% of tokens (staleness 256 / 512) vs 58% / 61% for a matched-mean damping control"],
      ["Llama-3.1-8B (rebuttal)", "stable at staleness 512, where M2PO diverges in 3/3 seeds"],
      ["Where the bias lives (camera-ready)", "detector fires on 7.9% of agent-reasoning tokens vs 0.6% of tool output and 0.3% of system prompt; full-attention layers are 25% of layers but carry 72–77% of the bias"]
    ],
    setup: "GRPO on 4×H100 (FP8, FSDP-2, verl + vLLM); Qwen3.5 2B/4B/9B and Llama-3.1-8B.",
    bibtex: "@inproceedings{chen2026gcd,\n  title     = {{GCD}: Correcting Hidden-State Bias in Off-Policy Agentic {RL}},\n  author    = {Chen, Changyuan and Xiang, Jianyu and Luo, Jiasheng and Wang, Ziye and Gunasekaran, Nallappan},\n  booktitle = {Advances in Neural Information Processing Systems (NeurIPS)},\n  year      = {2026}\n}",
    pdf: null,
    pdfNote: "The camera-ready paper and the full NeurIPS poster will be linked here as soon as they are public.",
    poster: { image: "assets/papers/gcd-poster-panel.jpg", caption: "NeurIPS 2026 poster — summary panel" },
    featured: true
  },
  {
    id: "qd-mas",
    short: "Diversity > Convergence",
    title: "Diversity over Convergence: An Empirical Study of Quality-Diversity Evolution for Multi-Agent Collaboration Structures",
    venue: "Under review",
    venueLong: "Under double-blind review — the venue is withheld until the review concludes",
    status: "review",
    statusLabel: "",
    year: 2027,
    role: "First author",
    authors: [{ name: "Changyuan Chen", me: true }],
    authorNote: "First author. The full author list is withheld during double-blind review.",
    topics: ["Multi-agent", "Evaluation"],
    thumb: "qd",
    tldr: "Instead of converging on one multi-agent design, evolve an archive of them. Diverse archives map the space far better — but under noisy, cost-heterogeneous evaluation the choice of QD algorithm barely matters, and we show why.",
    highlights: [
      ["up to 10×", "QD-Score over handcrafted designs (p_Holm = 0.0006)"],
      ["0.78–0.84", "structure-map coverage vs 0.12 for six handcrafted designs"],
      ["13.2×", "per-design evaluation-cost heterogeneity behind a powered null"]
    ],
    problem: "An LLM multi-agent system has a collaboration structure: how many agents it uses, its communication topology, the reasoning operator each agent runs, and how answers are aggregated. Prior work either hand-designs one structure or searches for a single best one. Both assume there is one best structure to converge on.",
    method: [
      "Encode agent count, communication topology, per-agent reasoning operators and answer aggregation as one executable genome.",
      "Compare seven search strategies — curiosity-driven and vanilla MAP-Elites, a MaAS-style learned supernet, random archive filling, single-objective evolution, AFlow-style MCTS and handcrafted designs — under one fitness and one budget.",
      "Evaluate on competition MATH and GSM8K with Qwen2.5-7B-Instruct and a batched vLLM execution engine; ten seeds, Holm-corrected permutation tests.",
      "State a budget-allocation proposition and measure both of its terms independently to explain when the algorithm choice starts to matter."
    ],
    results: [
      ["Archives vs single designs", "QD-Score up to 10× over handcrafted designs (p_Holm = 0.0006); coverage 0.78–0.84 vs 0.12"],
      ["Powered null", "QD algorithms are statistically indistinguishable in the standard space (all p_Holm ≥ 0.08)"],
      ["Why", "saturation, the noise floor and 13.2× per-design cost heterogeneity"],
      ["When it breaks", "in a 7× larger space the algorithms separate (p_Holm = 0.042)"],
      ["Design rules", "LLM-as-judge aggregation (lift 1.67 / 3.07) transfers across tasks; best team size and topology are task-dependent"]
    ],
    setup: "Qwen2.5-7B-Instruct; competition MATH and GSM8K; ten seeds.",
    bibtex: null,
    pdf: null,
    pdfNote: "Under double-blind review — the manuscript will be posted after the review period."
  },
  {
    id: "deltaadmet",
    short: "DeltaADMET-R1",
    title: "Learning Deployable Policy Improvements from Measured Molecular Panels",
    venue: "ICLR 2027",
    venueLong: "International Conference on Learning Representations (ICLR 2027) — under review",
    status: "review",
    statusLabel: "Under review",
    year: 2027,
    role: "First author · Tsinghua University research internship (Prof. Yanyan Lan)",
    authors: [{ name: "Changyuan Chen", me: true }],
    authorNote: "First author. Work done during a research internship at Tsinghua University with Prof. Yanyan Lan. The full author list is withheld during double-blind review.",
    topics: ["AI for Science", "Constrained RL"],
    thumb: "admet",
    tldr: "A molecular policy can earn a higher reward yet retain little of it once endpoint regression is controlled. DeltaADMET-R1 makes the retained utility — not raw reward — the RL objective.",
    highlights: [
      ["≈ 20%", "more controlled utility than matched scalar projection at the same TV budget"],
      ["193 / 197", "test sources covered under 95% source-conformal calibration"],
      ["≈ 30%", "higher certified gain from identity-aligned permutation averaging"]
    ],
    problem: "Multi-endpoint molecular optimization must balance improvements in one assay against regressions in another. A higher scalar reward can hide a weaker endpoint on an individual panel, and at deployment the current panel's outcomes are not available to check.",
    method: [
      "Build an exact anchor-relative target with a non-regression constraint for every endpoint in every context.",
      "Add a total-variation controller that gives a tight, outcome-free bound on each endpoint's regression at deployment.",
      "Train with CPDPO-R, a contextwise primal–dual method with one dual variable per context and endpoint.",
      "Prove that identity-aligned permutation averaging contracts TV; calibrate with source-conformal and PAC rules."
    ],
    results: [
      ["Controlled utility (Qwen3-8B + LoRA)", "≈ 20% more than matched scalar projection at the same TV budget (five seeds; paired 95% CI excludes 0)"],
      ["Calibration", "edge kept under post hoc 95% source-conformal calibration (193/197 test sources covered)"],
      ["Boundary, reported", "on Qwen3-4B and Mistral-7B, higher raw reward did not become a controlled advantage"],
      ["Where improvement is lost", "a global target sacrifices 3.14–44.99% of contexts; identity-aligned averaging lifts certified gain by ≈ 30%"]
    ],
    setup: "Trained on scaffold-disjoint Biogen panels; TDC and OpenADMET used only for external evaluation.",
    bibtex: null,
    pdf: null,
    pdfNote: "Under double-blind review — the manuscript will be posted after the review period."
  },
  {
    id: "clipstore",
    short: "ClipStore",
    title: "Bitwise-Identical Latent Reuse for Causal Video Encoders",
    venue: "ICLR 2027",
    venueLong: "International Conference on Learning Representations (ICLR 2027) — under review",
    status: "review",
    statusLabel: "Under review",
    year: 2027,
    role: "Second author",
    authors: [{ name: "Changyuan Chen", me: true }],
    authorNote: "Second author. The full author list is withheld during double-blind review.",
    topics: ["ML systems"],
    thumb: "clip",
    tldr: "Overlapping video clips cannot simply share encoder features: each clip starts its own causal state. ClipStore derives exactly which features can be shared, and every output stays bitwise identical to independent encoding.",
    highlights: [
      ["4,944 / 4,944", "timed outputs bitwise identical to independent encoding"],
      ["2.51×", "faster than independent encoding; 9.9% less time than the faster fixed-cut baseline"],
      ["21.9%", "fewer retained bytes than the fixed-cut baseline"]
    ],
    problem: "Latent caches for video-generation training encode many overlapping clips of the same video, but pixel overlap alone does not justify reusing features: each clip starts its own causal state and sampling phase. Which intermediate values can be shared while every output stays identical to independent encoding?",
    method: [
      "Derive exact-reuse regions from the encoder's dependency graph at several depths, separating initialization and phase from the 113-frame receptive field.",
      "Read shallow features first, then switch to deep features while keeping request-local suffix state.",
      "Store only the planned reads in packed read unions, under a constant storage bound."
    ],
    results: [
      ["Exactness", "all 4,944 timed outputs bitwise identical to independent encoding (frozen Wan2.1 encoder)"],
      ["Speed", "2.51× vs independent encoding; 9.9% less time than the faster fixed-cut baseline"],
      ["Storage", "21.9% fewer retained bytes than the fixed-cut baseline"],
      ["Honest scope", "end-to-end 50-step text-to-video gain is only 1.006×; decoder continuation resumes bitwise, 1.19–2.85× faster than re-decoding"]
    ],
    setup: "Frozen Wan2.1 video VAE encoder.",
    bibtex: null,
    pdf: null,
    pdfNote: "Under double-blind review — the manuscript will be posted after the review period."
  },
  {
    id: "selfplay",
    short: "Uncertainty ≠ QC",
    title: "Uncertainty Is Not Quality Control: Label-Free Self-Play Drifts Toward Ill-Posed Problems",
    venue: "ACL 2027",
    venueLong: "Annual Meeting of the Association for Computational Linguistics (ACL 2027) — under review",
    status: "review",
    statusLabel: "Under review",
    year: 2027,
    role: "First author",
    authors: [{ name: "Changyuan Chen", me: true }],
    authorNote: "First author. The full author list is withheld during review.",
    topics: ["Self-improvement", "Evaluation"],
    thumb: "selfplay",
    tldr: "Label-free self-play keeps the problems a model is unsure about. Among model-written problems, those are mostly the ill-posed ones — so the curriculum drifts, and confident answers to unanswerable questions more than double.",
    highlights: [
      ["+11.5–27 pts", "rise in the ill-posed share of admitted problems within two rounds"],
      ["29% → 59–76%", "Qwen3-4B confident answers to unanswerable questions, while accuracy plateaus"],
      ["136", "pre-registered predictions, every outcome reported"]
    ],
    problem: "Label-free self-play (R-Zero, TTRL, Absolute Zero) trains a model on problems it wrote itself and is unsure about, and treats that agreement band as implicit quality control. We show that the band keeps what training has not yet resolved — and among model-written problems, that is mostly the ill-posed (unanswerable or ambiguous) ones.",
    method: [
      "Measure the ill-posed share of the admitted curriculum across rounds on Qwen3-4B/8B, Phi-4-mini and one Qwen3-14B round, and replicate the official R-Zero code.",
      "Confirm every measurement under blind re-judging, an open-weight judge and expert mathematician annotation.",
      "Isolate the filter by scoring one fixed pool with successive solvers, and fit a class-conditional sharpening law (solvable > ambiguous > unanswerable).",
      "Test label-free admission rules, an 'unknown' reward, and test-time abstention as remedies."
    ],
    results: [
      ["Drift", "ill-posed share rises 11.5–27 points within two rounds, in every seed"],
      ["Official R-Zero code", "drifts too (32.5% → 55.5%, 34.0% → 61.0%), mostly through its challenger"],
      ["Mechanism", "class-conditional sharpening law predicts a held-out pool with MAE 2.4 points"],
      ["Consequence", "Qwen3-4B confident answers to unanswerable questions: 29% → 59–76%, while accuracy plateaus"],
      ["Remedies", "no label-free admission rule tested stops the drift; rewarding 'unknown' backfires; test-time abstention works"]
    ],
    setup: "Qwen3-4B/8B, Phi-4-mini, Qwen3-14B; 136 pre-registered predictions with exploratory analyses marked.",
    bibtex: null,
    pdf: null,
    pdfNote: "Under review — the manuscript will be posted after the review period."
  },
  {
    id: "prosper",
    short: "ProSPER",
    title: "Who Taught Whom? Progress-Shapley Credit for Collusion-Resistant Recursive Self-Improvement of Multi-Agent LLM Teams",
    venue: "AAMAS 2027",
    venueLong: "International Conference on Autonomous Agents and Multiagent Systems (AAMAS 2027) — under review",
    status: "review",
    statusLabel: "Under review",
    year: 2027,
    role: "First author",
    authors: [{ name: "Changyuan Chen", me: true }],
    authorNote: "First author. The full author list is withheld during double-blind review.",
    topics: ["Self-improvement", "Multi-agent", "Agentic RL"],
    thumb: "prosper",
    tldr: "When a proposer, solver, verifier and reviser are all trained with RL on task outcomes, the team learns to collude. ProSPER pays each agent its Shapley share of the team's measured learning progress instead.",
    highlights: [
      ["36.3 → 49.9", "average over 13 math, code and reasoning benchmarks (Qwen3-8B-Base)"],
      ["5.6%", "verifier false-accept rate, vs 66% under outcome rewards"],
      ["12 rounds", "of continued recursive improvement; baselines peak by round 5"]
    ],
    problem: "Self-evolving LLM systems are moving from two-role proposer–solver self-play to heterogeneous teams in which proposers, solvers, verifiers and revisers are all trained by reinforcement learning. Rewarding each agent for task outcomes can be satisfied without any learning: verifiers approve wrong answers, solvers exploit them, and the curriculum collapses after a few rounds. Which agent actually made the team learn?",
    method: [
      "Define progress as the first-order improvement that a coalition's generated data induces on a small verifiable anchor set; absent agents are replaced by frozen reference players from the previous round.",
      "Pay each agent its Shapley share of that progress. For a fixed learner state the incentive game is an exact potential game with budget-balanced credit, and colluding false-accept strategies are strictly dominated under stated conditions.",
      "Guard the recursion with a held-out gate that bounds regression across rounds.",
      "Make exact 4-agent Shapley credit affordable with shared substitution trees and projected LoRA gradients (1.31× rollout cost)."
    ],
    results: [
      ["13 benchmarks (Qwen3-8B-Base)", "average 36.3 → 49.9, +4.6 over the strongest self-evolution baseline"],
      ["Label efficiency", "+3.0 over RLVR trained on 17k labels, using about 1.5k labeled problems (11× fewer)"],
      ["Recursion", "keeps improving for 12 rounds; every baseline plateaus or regresses by round 5"],
      ["Collusion", "verifier false-accept rate 31% → 66% under outcome rewards vs 5.6% with ProSPER; proposal Vendi diversity +50%"],
      ["Cost", "exact 4-agent Shapley credit at 1.31× rollout cost"]
    ],
    setup: "Four rank-64 LoRA roles on Qwen3-8B-Base, 3 seeds; code tasks come with 5–8 proposer-written unit tests executed in a sandbox.",
    bibtex: null,
    pdf: null,
    pdfNote: "Under double-blind review — the manuscript will be posted after the review period."
  }
];
