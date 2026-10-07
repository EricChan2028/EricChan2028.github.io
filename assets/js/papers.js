/* Publication data. Every number here is taken from the paper itself (or, for GCD, the NeurIPS rebuttal
   and final poster). Edit this file to add papers or attach PDFs; the page renders from it.

   status:   "accepted" | "review"
   pdf:      path to a public PDF (e.g. "assets/papers/gcd.pdf") or an arXiv URL, or null.
             Papers under double-blind review stay null until the review ends.
   poster:   optional { image, caption, pdf }
   question / approach:  the two-line summary shown on the card; stats: two [number, label] pairs under it.
   bars:     the card's result chart { title, max, lower, items: [{ label, value, text, hi, ours, soft, warn }], note }.
             Bars start at 0 and are drawn to scale against `max`; `hi` draws a range (value..hi).
   figures:  figures for the detail sheet { src, w, h, tab: "overview" | "results", narrow, alt, caption }. */
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
    question: "Partial-rollout RL keeps generating from a stale KV cache after each policy update, so tokens come from a hidden mix of old and new weights, and the importance ratio cannot see it.",
    approach: "Bound the drift layer by layer, detect the tokens where the bound fails, and recompute only those positions.",
    bars: {
      title: "MATH-500 at staleness 512 (%)",
      max: 100,
      items: [
        { label: "M2PO + GCD", value: 67.1, ours: true },
        { label: "GCD only", value: 58.7, ours: true, soft: true },
        { label: "M2PO", value: 48.1 }
      ],
      note: "Five of the six other off-policy baselines diverge by staleness 512 (Qwen3.5-9B, five seeds)"
    },
    stats: [["+5.7", "τ-bench retail pass⁴ at staleness 256 (p < 0.001)"], ["1.38×", "rollout throughput vs full recomputation"]],
    tldr: "Reusing a KV cache across policy updates makes the sampler a hidden mix of old and new weights. The importance ratio cannot see it; GCD bounds it, detects where the bound fails, and recomputes only there.",
    highlights: [
      ["67.1 vs 48.1", "MATH-500 at staleness 512 — M2PO+GCD stays stable while M2PO collapses"],
      ["+5.7", "τ-bench retail pass⁴ at staleness 256 (44.1 vs 38.4, p < 0.001)"],
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
      ["τ-bench retail pass⁴, staleness 256", "44.1 vs 38.4 (+5.7, p < 0.001)"],
      ["Rollout throughput", "1.38× full recomputation (Qwen3.5-9B, staleness 512); extra compute ≈ 1.9% of a full recompute"],
      ["Ground-truth check (rebuttal)", "corrected weight closer to full recomputation on 68% / 74% of tokens (staleness 256 / 512) vs 58% / 61% for a matched-mean damping control"],
      ["Llama-3.1-8B (rebuttal)", "stable at staleness 512, where M2PO diverges in 3/3 seeds"],
      ["Where the bias lives (camera-ready)", "detector fires on 7.9% of agent-reasoning tokens vs 0.6% of tool output and 0.3% of system prompt; full-attention layers are 25% of layers but carry 72–77% of the bias"]
    ],
    figures: [
      { src: "assets/papers/figs/gcd-bias.webp", w: 1700, h: 1109, tab: "overview",
        alt: "Line chart on a log scale: the measured KV-drift bias and the GCD bound both rise with staleness from 1 to 512.",
        caption: "The problem, measured. Median and 95th-percentile KV-drift bias |b_t| grow with staleness, and the GCD bound (Theorem 5) stays close to the measured median (median / bound 0.64 → 0.76). Qwen3.5-9B, 1,000 held-out τ-bench retail prompts; data from Table 1, redrawn for the NeurIPS poster." },
      { src: "assets/papers/figs/gcd-math.webp", w: 1743, h: 1109, tab: "results",
        alt: "Line chart of MATH-500 accuracy against staleness: M2PO + GCD stays near 70% while M2PO drops to 48.1% at staleness 512.",
        caption: "MATH-500 accuracy vs staleness (Qwen3.5-9B, five seeds; Table 2). M2PO + GCD degrades gracefully; M2PO falls to 48.1% at staleness 512, and five of the six other off-policy baselines have diverged (×) by then." },
      { src: "assets/papers/figs/gcd-tau.webp", w: 1743, h: 1129, tab: "results",
        alt: "Line chart of τ-bench retail pass⁴ against staleness, with the gap between M2PO + GCD and M2PO growing to +18.9 at staleness 512.",
        caption: "τ-bench retail pass⁴ vs staleness (three seeds; Table 3). The gain from GCD grows with staleness: +5.7 at 256 (44.1 vs 38.4, p < 0.001) and +18.9 at 512." },
      { src: "assets/papers/figs/gcd-throughput.webp", w: 1573, h: 728, tab: "results",
        alt: "Bar chart of rollout throughput: GCD 1,666, naive KV reuse 1,453 and full recompute 1,204 tokens per second per GPU.",
        caption: "Rollout throughput on Qwen3.5-9B (4×H100, staleness 512; Table 8). GCD is 1.38× faster than full recomputation and 1.15× faster than naive KV reuse, which needs a smaller stable batch and carries about 10× the bias." },
      { src: "assets/papers/figs/gcd-weights.webp", w: 1629, h: 843, tab: "results",
        alt: "Bar chart of the error of each importance weight against the full-recompute weight at staleness 256 and 512; the GCD weights have the smallest error.",
        caption: "Is it really bias correction? Error of each importance weight against the full-recompute weight (rebuttal). The GCD weight is 46% / 56% closer than naive reuse at staleness 256 / 512, well ahead of a matched global-damping control; GCD-S is a signed-calibration variant from the rebuttal." }
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
    question: "Should an LLM multi-agent system converge on one best collaboration structure, or keep a diverse archive of them?",
    approach: "Encode agent count, topology, reasoning operators and answer aggregation as one executable genome, and compare seven search strategies under one fitness and budget.",
    bars: {
      title: "Structure-map coverage",
      max: 1,
      items: [
        { label: "QD archives", value: 0.78, hi: 0.84, text: "0.78–0.84", ours: true },
        { label: "Six handcrafted designs", value: 0.12, text: "0.12" }
      ],
      note: "Yet in the standard space the QD algorithms are statistically indistinguishable (all p_Holm ≥ 0.08); the paper explains why"
    },
    stats: [["up to 10×", "QD-Score over handcrafted designs (p_Holm = 0.0006)"], ["13.2×", "per-design cost heterogeneity behind the powered null"]],
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
    figures: [],
    figureNote: "Figures from this paper will be added after the double-blind review period.",
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
    question: "When a molecular policy's raw reward rises, how much of that improvement survives once regression on every assay endpoint is controlled?",
    approach: "Make the TV-controlled, endpoint-wise utility itself the RL objective, optimized with a contextwise primal–dual method (CPDPO-R).",
    bars: {
      title: "Controlled test gain, Qwen3-8B (×10⁻³)",
      max: 0.5,
      items: [
        { label: "CPDPO-R (ours)", value: 0.4396, text: "0.440", ours: true },
        { label: "Matched scalar projection", value: 0.3665, text: "0.367" }
      ],
      note: "≈ 20% more; on Qwen3-4B the edge disappears (0.431 vs 0.435)"
    },
    stats: [["193 / 197", "test sources covered under 95% source-conformal calibration"], ["≈ 30%", "higher certified gain from identity-aligned averaging"]],
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
    figures: [
      { src: "assets/papers/figs/admet-overview.webp", w: 1800, h: 828, tab: "overview",
        alt: "Diagram: historical assay outcomes train the CPDPO-R objective; at deployment an action-first LLM ranks a molecular panel and a TV controller mixes its policy toward a frozen anchor.",
        caption: "Figure 1. DeltaADMET-R1 separates historical feedback from deployment inputs. CPDPO-R differentiates the expected utility of the TV-controlled policy; target CE instead fits an exact measured update. Both routes use a frozen anchor, and current-panel assay outcomes are never available at deployment." },
      { src: "assets/papers/figs/admet-control.webp", w: 1800, h: 695, tab: "results",
        alt: "Interval plot: CPDPO-R retains more test gain than scalar projection under deterministic, 95% conformal and 90% conformal control.",
        caption: "Figure 2. The training objective matters after control: Qwen3-8B test gain under deterministic and source-conformal control (left) and paired CPDPO-R − scalar differences with 95% intervals (right). The conformal points are post hoc analyses of the same policies. Units: 10⁻³ normalized utility." },
      { src: "assets/papers/figs/admet-scale.webp", w: 1800, h: 704, tab: "results",
        alt: "Bar charts of raw and retained gain at 4B and 8B, and interval plot of 8B paired effects.",
        caption: "Figure 3. Model scale changes the controlled comparison. At 4B, a higher raw gain does not become a retained advantage (0.431 vs 0.435); at 8B, CPDPO-R retains 0.440 vs 0.367 under the same budget (ε = .005). Right: five-seed 8B paired effects with 95% intervals." }
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
    question: "Overlapping video clips share pixels, but each clip starts its own causal state. Which encoder features can be shared while every output stays identical?",
    approach: "Derive exact-reuse regions from the encoder's dependency graph, then run a phase-aware two-depth read plan under a constant storage bound.",
    bars: {
      title: "Construction time, 16 × 129-frame latents (s)",
      lower: true,
      max: 75,
      items: [
        { label: "ClipStore", value: 28.50, text: "28.5", ours: true },
        { label: "Fixed cut A", value: 31.64, text: "31.6" },
        { label: "Fixed cut B", value: 34.06, text: "34.1" },
        { label: "Independent encoding", value: 71.63, text: "71.6" }
      ],
      note: "Every output stays bitwise identical to independent encoding (4,944 / 4,944)"
    },
    stats: [["2.51×", "faster than independent encoding"], ["21.9%", "fewer retained bytes than the fixed-cut baseline"]],
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
    figures: [
      { src: "assets/papers/figs/clip-overview.webp", w: 1800, h: 999, tab: "overview",
        alt: "Diagram of two overlapping clips, why cropping source features fails near a clip start, and ClipStore's reuse schedule across encoder cuts A, B and C.",
        caption: "Figure 1. Motivation and design. (1) Overlapping requests start independent causal states. (2) Cropping source features can fail near a request start, where dependencies reach earlier frames; reuse begins only when dependencies, initialization and sampling phase match. (3) ClipStore computes A and B, then reads A while continuing B, and finally reads B; C keeps one continuous request-local state." },
      { src: "assets/papers/figs/clip-construction.webp", w: 1800, h: 1031, tab: "results",
        alt: "Bar chart of complete construction time: independent 71.63 s, fixed A 31.64 s, fixed B 34.06 s, ClipStore 28.50 s.",
        caption: "Figure 5. Complete construction of sixteen 129-frame latents (means of twelve runs; whiskers: observed range). ClipStore is 2.51× faster than independent encoding and takes 9.9% less time than the faster fixed cut." },
      { src: "assets/papers/figs/clip-scaling.webp", w: 1800, h: 1091, tab: "results",
        alt: "Four line charts of complete time and retained features against request count and clip length for fixed A, fixed B and ClipStore.",
        caption: "Figure 4. Scaling with request count (a) and clip length (b): complete time (top) and retained payload (bottom), four-video means. Every method receives the same plan and source extent." }
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
    question: "Label-free self-play trains on the problems a model is unsure about. Does that rule filter out ill-posed problems, as R-Zero assumes?",
    approach: "Track the ill-posed share of the admitted curriculum across rounds, models and judges, then isolate the filter by scoring one fixed pool with successive solvers.",
    bars: {
      title: "Ill-posed share of admitted problems, Qwen3-4B (%)",
      max: 100,
      items: [
        { label: "Round 1", value: 56.7 },
        { label: "Round 2", value: 72.7, warn: true, soft: true },
        { label: "Round 3", value: 79.9, warn: true }
      ],
      note: "The official R-Zero code drifts too: 32.5% → 55.5% and 34.0% → 61.0%"
    },
    stats: [["28% → 41–48%", "self-consistent answers to unanswerable questions (Qwen3-4B)"], ["136", "pre-registered predictions, every outcome reported"]],
    tldr: "Label-free self-play keeps the problems a model is unsure about. Among model-written problems, those are mostly the ill-posed ones, so the curriculum drifts toward unanswerable and ambiguous questions.",
    highlights: [
      ["+11.5–27 pts", "rise in the ill-posed share of admitted problems within two rounds"],
      ["28% → 41–48%", "Qwen3-4B self-consistent answers to unanswerable questions by round three, while benchmark accuracy plateaus"],
      ["136", "pre-registered predictions, every outcome reported"]
    ],
    problem: "Label-free self-play (R-Zero, TTRL, Absolute Zero) trains a model on problems it wrote itself and is unsure about, and treats that agreement band as implicit quality control. We show that the band keeps what training has not yet resolved — and among model-written problems, that is mostly the ill-posed (unanswerable or ambiguous) ones.",
    method: [
      "Measure the ill-posed share of the admitted curriculum across rounds on Qwen3-4B/8B, Phi-4-mini and one Qwen3-14B round, and replicate the official R-Zero code.",
      "Check the drift under blind re-judging, an open-weight judge and expert human annotation.",
      "Isolate the filter by scoring one fixed pool with successive solvers, and fit a class-conditional sharpening law (solvable > ambiguous > unanswerable).",
      "Test label-free admission rules, an 'unknown' reward, and test-time abstention as remedies."
    ],
    results: [
      ["Drift", "ill-posed share rises 11.5–27 points within two rounds, in every seed"],
      ["Official R-Zero code", "drifts too (32.5% → 55.5%, 34.0% → 61.0%), mostly through its challenger"],
      ["Mechanism", "class-conditional sharpening law predicts a held-out pool with MAE 2.4 points"],
      ["Consequence", "Qwen3-4B self-consistent answers to unanswerable questions: 28% → 41–48% by round three, while benchmark accuracy plateaus; most of this rise is majority-vote sharpening itself"],
      ["Remedies", "no label-free admission rule tested stops the drift; rewarding 'unknown' backfires; test-time abstention works"]
    ],
    figures: [
      { src: "assets/papers/figs/selfplay-overview.webp", w: 1800, h: 972, tab: "overview",
        alt: "Overview diagram: the label-free loop, the drift of the ill-posed share, why solvable problems exit the agreement band, and what the solver learns.",
        caption: "Figure 1. Overview. (a) The label-free loop. (b) The ill-posed share of admitted problems rises in every model, under every judge. (c) On one fixed pool, solvable problems sharpen out of the agreement band while ill-posed ones stay. (d) The solver answers more unanswerable questions self-consistently, declines more of them in words, and abstains when offered the option." },
      { src: "assets/papers/figs/selfplay-drift.webp", w: 1800, h: 672, tab: "results",
        alt: "Left: ill-posed share of admitted problems rising over self-play rounds for four models. Right: self-consistent answers to unanswerable questions against benchmark accuracy.",
        caption: "Figure 2. (a) Ill-posed share of admitted problems by round (mean over seeds; shaded: range), including the official R-Zero code and blind re-judging. (b) Self-consistent answers to unanswerable questions against benchmark accuracy, from each base model to its round-3 solvers." },
      { src: "assets/papers/figs/selfplay-filter.webp", w: 1800, h: 1604, tab: "results", narrow: true,
        alt: "Top: fraction of solvable, ambiguous and unsolvable problems inside the band across solver checkpoints. Bottom: observed and predicted ill-posed share on a held-out pool.",
        caption: "Figure 3. The filter, isolated. (a) Fraction of each class of a fixed pool still inside the agreement band as the solver trains: solvable problems leave fastest. (b) A class-conditional sharpening model fitted on one pool predicts the ill-posed share admitted from a held-out pool (mean absolute error 2.4 points); a single rate does not." },
      { src: "assets/papers/figs/selfplay-answers.webp", w: 1800, h: 1486, tab: "results", narrow: true,
        alt: "Stacked bars of how Qwen3-4B answers unanswerable and hard answerable questions at base and after five rounds.",
        caption: "Figure 4. How Qwen3-4B answers 112 unanswerable and 112 hard answerable questions at base and after five rounds (eight samples each). Sharpening turns scattered guesses into stated assumptions and declines." }
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
    question: "When a proposer, solver, verifier and reviser all train with RL on task outcomes, the team can earn reward without learning. Which agent actually made the team learn?",
    approach: "Pay each agent its Shapley share of the team's measured learning progress on a small labeled anchor set, and gate every recursive round on held-out accuracy.",
    bars: {
      title: "Average over 13 benchmarks (Qwen3-8B-Base)",
      max: 60,
      items: [
        { label: "ProSPER", value: 49.9, ours: true },
        { label: "RLVR, 17k labels", value: 46.9 },
        { label: "INFUSER (best self-evolution)", value: 45.3 },
        { label: "Base model", value: 36.3 }
      ],
      note: "Verifier false-accept rate 5.6%, vs 66% under outcome rewards"
    },
    stats: [["12 rounds", "of continued improvement; every baseline peaks by round 5"], ["1.31×", "rollout cost for exact 4-agent Shapley credit"]],
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
    figures: [
      { src: "assets/papers/figs/prosper-overview.webp", w: 1800, h: 1196, tab: "overview",
        alt: "Overview diagram of ProSPER: outcome credit lets a team game its rewards; ProSPER credits Shapley shares of anchor progress, with gated recursion.",
        caption: "Figure 1. Overview of ProSPER. (a) Under outcome credit, a self-training team can maximize its rewards without learning. (b) ProSPER pays each agent its Shapley share of the team's learning progress, using frozen reference players from the previous round for absent agents. (c) A held-out gate promotes a team only if its paired gate accuracy does not drop. (d) The labeled anchor only scores data." },
      { src: "assets/papers/figs/prosper-recursion.webp", w: 1800, h: 909, tab: "results",
        alt: "Line chart of average accuracy over 13 benchmarks across 12 recursive rounds: ProSPER keeps rising to 49.9 while baselines peak by round 5.",
        caption: "Figure 3. Recursive improvement: average accuracy over 13 benchmarks after each round. Every baseline peaks by round 3–5 and then plateaus or regresses, while ProSPER keeps improving through round 12." },
      { src: "assets/papers/figs/prosper-diagnostics.webp", w: 1800, h: 865, tab: "results",
        alt: "Left: verifier false-accept rate rising to 66% under outcome rewards and falling to 5.6% under ProSPER. Right: proposer task diversity.",
        caption: "Figure 4. Collusion and collapse diagnostics. Left: the verifier's false-accept rate on held-out labeled solutions climbs from 31% to 66% under outcome rewards and falls to 5.6% with ProSPER. Right: the diversity (Vendi score) of proposed tasks." },
      { src: "assets/papers/figs/prosper-credit.webp", w: 1800, h: 838, tab: "results",
        alt: "Stacked bars of each role's share of team credit across rounds; the verifier's share grows from 9% to 27%.",
        caption: "Figure 5. Progress-Shapley credit shares across rounds. The verifier starts as a near-free-rider (9%) and becomes a principal contributor (27% by round 12) once its critiques begin to filter harmful data." }
    ],
    setup: "Four rank-64 LoRA roles on Qwen3-8B-Base, 3 seeds; code tasks come with 5–8 proposer-written unit tests executed in a sandbox.",
    bibtex: null,
    pdf: null,
    pdfNote: "Under double-blind review — the manuscript will be posted after the review period."
  }
];
