import { useState, useEffect } from "react";

// ─── Global CSS ───────────────────────────────────────────────────────────────
// v3 fixes applied:
//   CC-001  input border #767676 (4.54:1 on white)
//   CC-002  text-tertiary #636366 light / #a8a8b0 dark (5.04:1 / 4.56:1)
//   CC-003  text-link #005bb5 light (6.11:1 on white)
//   MOTION-001  transitions gated by prefers-reduced-motion
const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display",
                 "Helvetica Neue", Arial, sans-serif;
    --font-mono: "SF Mono", ui-monospace, "Cascadia Mono", Menlo, Courier, monospace;

    --bg-page:           #f2f2f7;
    --bg-card:           #ffffff;
    --bg-input:          #ffffff;
    --bg-header:         #1c3a6e;
    --bg-tab-inactive:   #f5f5f7;
    --bg-tab-active:     #ffffff;
    --bg-formula:        #f5f5f7;
    --bg-note:           #fffbe6;

    --border-card:       1px solid rgba(0,0,0,0.10);
    --border-input:      1.5px solid #767676;   /* CC-001: was #c6c6c8 (1.64:1→4.54:1) */
    --border-section:    1px solid rgba(0,0,0,0.08);

    --text-primary:      #1c1c1e;
    --text-secondary:    #3c3c43;
    --text-tertiary:     #636366;   /* CC-002: was #8e8e93 (3.0:1→5.04:1 on formula bar) */
    --text-header:       #ffffff;
    --text-header-sub:   #a8c4e5;
    --text-link:         #005bb5;   /* CC-003: was #0071e3 (3.81:1→6.11:1 on white) */
    --text-formula:      #1c3a6e;

    --focus-ring:        0 0 0 3px rgba(0,113,227,0.55);
    --shadow-card:       0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.05);

    --sev1-bg:#d1f5e0;  --sev1-border:#5ac87a;  --sev1-text:#145c30;
    --sev2-bg:#f5f5dc;  --sev2-border:#b5a800;  --sev2-text:#5a4d00;
    --sev3-bg:#fff0d0;  --sev3-border:#e09a00;  --sev3-text:#6b4000;
    --sev4-bg:#fde8d8;  --sev4-border:#d4622a;  --sev4-text:#7a2500;
    --sev5-bg:#fdd8d8;  --sev5-border:#c0392b;  --sev5-text:#6b0000;
    --cr-ok-bg:#d1f5e0;    --cr-ok-border:#5ac87a;    --cr-ok-text:#145c30;
    --cr-watch-bg:#fff0d0; --cr-watch-border:#e09a00;  --cr-watch-text:#6b4000;
    --cr-ortho-bg:#fde8d8; --cr-ortho-border:#d4622a; --cr-ortho-text:#7a2500;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --bg-page:           #1c1c1e;
      --bg-card:           #2c2c2e;
      --bg-input:          #3a3a3c;
      --bg-header:         #0d1f3c;
      --bg-tab-inactive:   #1c1c1e;
      --bg-tab-active:     #2c2c2e;
      --bg-formula:        #3a3a3c;
      --bg-note:           #2c2a1c;

      --border-card:       1px solid rgba(255,255,255,0.10);
      --border-input:      1.5px solid #8c8c8c;  /* CC-001 dark: 4.58:1 on dark card */
      --border-section:    1px solid rgba(255,255,255,0.07);

      --text-primary:      #f5f5f7;
      --text-secondary:    #d1d1d6;
      --text-tertiary:     #a8a8b0;  /* CC-002 dark: was #8e8e93 (3.11:1→4.56:1 on #3a3a3c) */
      --text-header:       #f5f5f7;
      --text-header-sub:   #7da6cc;
      --text-link:         #419cff;  /* CC-003: already 5.46:1 on dark page bg — no change */
      --text-formula:      #88b0e8;

      --shadow-card: 0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3);

      --sev1-bg:#0f3320; --sev1-border:#2d8a50; --sev1-text:#7fe8a8;
      --sev2-bg:#2e2a00; --sev2-border:#a89500; --sev2-text:#f5d800;
      --sev3-bg:#2e1e00; --sev3-border:#c07800; --sev3-text:#ffb830;
      --sev4-bg:#2e1000; --sev4-border:#b04a1a; --sev4-text:#ff8c5a;
      --sev5-bg:#2e0000; --sev5-border:#9b2319; --sev5-text:#ff7070;
      --cr-ok-bg:#0f3320;    --cr-ok-border:#2d8a50;    --cr-ok-text:#7fe8a8;
      --cr-watch-bg:#2e1e00; --cr-watch-border:#c07800;  --cr-watch-text:#ffb830;
      --cr-ortho-bg:#2e1000; --cr-ortho-border:#b04a1a;  --cr-ortho-text:#ff8c5a;
    }
  }

  body {
    font-family: var(--font-sans);
    background: var(--bg-page);
    color: var(--text-primary);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Inputs ─────────────────────────────────────────────── */
  input[type=number] {
    -moz-appearance: textfield;
    font-family: var(--font-mono);
    font-size: 1.1rem;
    width: 100%;
    padding: 12px 42px 12px 14px;
    background: var(--bg-input);
    color: var(--text-primary);
    border: var(--border-input);
    border-radius: 10px;
    outline: none;
    min-height: 44px;
    /* MOTION-001: transition moved to no-preference query below */
  }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { opacity: 1; }
  input[type=number]:hover  { border-color: #0071e3; }
  input[type=number]:focus-visible {
    border-color: #0071e3;
    box-shadow: var(--focus-ring);
  }

  /* ── Tab buttons ────────────────────────────────────────── */
  .tab-btn {
    background: var(--bg-tab-inactive);
    color: var(--text-tertiary);
    border: none;
    cursor: pointer;
    padding: 14px 12px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    border-bottom: 3px solid transparent;
    margin-bottom: -2px;
    /* MOTION-001: transition moved to no-preference query below */
  }
  .tab-btn:hover { background: var(--bg-card); color: var(--text-primary); }
  .tab-btn:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
    position: relative; z-index: 1;
  }
  .tab-btn.active {
    background: var(--bg-card);
    color: var(--text-primary);
    border-bottom-color: #0071e3;
  }
  .tab-label { font-size: 0.9rem; font-weight: 600; font-family: var(--font-mono); }
  .tab-sub   { font-size: 0.68rem; letter-spacing: 0.05em; text-transform: uppercase; }

  /* ── MOTION-001: gate animations on user preference ──────── */
  @media (prefers-reduced-motion: no-preference) {
    input[type=number] { transition: border-color 0.15s, box-shadow 0.15s; }
    .tab-btn           { transition: background 0.15s, color 0.15s; }
  }

  /* ── Links ──────────────────────────────────────────────── */
  a { color: var(--text-link); text-decoration: none; font-weight: 600; }
  a:hover { text-decoration: underline; }
  a:focus-visible { outline: 2px solid #0071e3; outline-offset: 2px; border-radius: 2px; }

  /* ── Severity table ─────────────────────────────────────── */
  .sev-table tbody tr:nth-child(even) td { background: rgba(0,0,0,0.025); }
  @media (prefers-color-scheme: dark) {
    .sev-table tbody tr:nth-child(even) td { background: rgba(255,255,255,0.03); }
  }

  /* ── Responsive grid stacking ───────────────────────────── */
  @media (max-width: 480px) {
    .input-row { grid-template-columns: 1fr !important; }
    .condition-grid { grid-template-columns: 1fr !important; }
    .condition-block-left {
      border-right: none !important;
      border-bottom: 1px solid rgba(0,0,0,0.08);
    }
  }

  /* ── Measurement diagram container ─────────────────────── */
  .diagram-wrap {
    display: flex;
    justify-content: center;
    margin: 4px 0 20px;
  }
  .diagram-wrap svg {
    width: 100%;
    max-width: 230px;
    height: auto;
    border-radius: 10px;
    overflow: visible;
  }

  /* ── Screen-reader-only utility ─────────────────────────── */
  .sr-only {
    position: absolute;
    width: 1px; height: 1px;
    padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0,0,0,0);
    white-space: nowrap; border: 0;
  }
`;

// ─── SVG Measurement Diagrams ─────────────────────────────────────────────────
// SVG-SR-001: SVG is aria-hidden; wrapper div carries role="img" + aria-label
// SVG-001: fixed duplicate x / invalid cy attribute on "B" label

function DiagramCVAI() {
  return (
    <div
      className="diagram-wrap"
      role="img"
      aria-label="CVAI measurement diagram: top-down skull outline with two crossing diagonals. Orange line is Diagonal A (the longer measurement). Blue line is Diagonal B (the shorter measurement). Both run from forehead to posterior skull at 30 degrees from the nose."
    >
      {/* aria-hidden removes all inner SVG content from the accessibility tree;
          the wrapper aria-label above is the sole accessible description */}
      <svg viewBox="0 0 220 244" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <title>CVAI Skull Diagonal Measurement</title>
        <ellipse cx="110" cy="114" rx="78" ry="94" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5"/>
        <rect x="28" y="99" width="10" height="22" rx="4" fill="none" stroke="var(--text-secondary)" strokeWidth="2"/>
        <rect x="182" y="99" width="10" height="22" rx="4" fill="none" stroke="var(--text-secondary)" strokeWidth="2"/>
        <path d="M104 21 Q110 15 116 21" fill="none" stroke="var(--text-secondary)" strokeWidth="2"/>
        {/* Diagonal A — orange */}
        <line x1="56" y1="48" x2="170" y2="190" stroke="#e05a00" strokeWidth="2.5"/>
        <circle cx="56"  cy="48"  r="4.5" fill="#e05a00"/>
        <circle cx="170" cy="190" r="4.5" fill="#e05a00"/>
        {/* Diagonal B — blue */}
        <line x1="164" y1="48" x2="70" y2="180" stroke="#0071e3" strokeWidth="2.5"/>
        <circle cx="164" cy="48"  r="4.5" fill="#0071e3"/>
        <circle cx="70"  cy="180" r="4.5" fill="#0071e3"/>
        {/* Labels */}
        <text x="36" y="44"  fontSize="14" fontWeight="700" fill="#e05a00" fontFamily="-apple-system,sans-serif">A</text>
        <text x="174" y="207" fontSize="14" fontWeight="700" fill="#e05a00" fontFamily="-apple-system,sans-serif">A</text>
        <text x="168" y="44"  fontSize="14" fontWeight="700" fill="#0071e3" fontFamily="-apple-system,sans-serif">B</text>
        <text x="53"  y="197" fontSize="14" fontWeight="700" fill="#0071e3" fontFamily="-apple-system,sans-serif">B</text>
        <text x="110" y="236" fontSize="10" fill="var(--text-tertiary)" textAnchor="middle" fontFamily="-apple-system,sans-serif">Diagonal A (longer) · Diagonal B (shorter)</text>
      </svg>
    </div>
  );
}

function DiagramCR() {
  return (
    <div
      className="diagram-wrap"
      role="img"
      aria-label="Cephalic Ratio measurement diagram: top-down skull outline with two perpendicular axes. Orange horizontal arrow shows Medial-Lateral (M/L) width. Blue vertical arrow shows Anterior-Posterior (A/P) length."
    >
      <svg viewBox="0 0 220 244" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <title>Cephalic Ratio Skull Axis Measurement</title>
        <ellipse cx="110" cy="114" rx="78" ry="94" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5"/>
        <rect x="28" y="99" width="10" height="22" rx="4" fill="none" stroke="var(--text-secondary)" strokeWidth="2"/>
        <rect x="182" y="99" width="10" height="22" rx="4" fill="none" stroke="var(--text-secondary)" strokeWidth="2"/>
        <path d="M104 21 Q110 15 116 21" fill="none" stroke="var(--text-secondary)" strokeWidth="2"/>
        {/* M/L axis — orange, horizontal */}
        <line x1="32" y1="114" x2="188" y2="114" stroke="#e05a00" strokeWidth="2.5"/>
        <polygon points="32,114 44,109 44,119"   fill="#e05a00"/>
        <polygon points="188,114 176,109 176,119" fill="#e05a00"/>
        {/* A/P axis — blue, vertical */}
        <line x1="110" y1="20"  x2="110" y2="208" stroke="#0071e3" strokeWidth="2.5"/>
        <polygon points="110,20 105,32 115,32"    fill="#0071e3"/>
        <polygon points="110,208 105,196 115,196" fill="#0071e3"/>
        {/* Labels */}
        <text x="6"   y="118" fontSize="11" fontWeight="700" fill="#e05a00" fontFamily="-apple-system,sans-serif">M/L</text>
        <text x="186" y="118" fontSize="11" fontWeight="700" fill="#e05a00" fontFamily="-apple-system,sans-serif">M/L</text>
        <text x="116" y="16"  fontSize="11" fontWeight="700" fill="#0071e3" fontFamily="-apple-system,sans-serif">A/P</text>
        <text x="116" y="222" fontSize="11" fontWeight="700" fill="#0071e3" fontFamily="-apple-system,sans-serif">A/P</text>
        <text x="110" y="236" fontSize="10" fill="var(--text-tertiary)" textAnchor="middle" fontFamily="-apple-system,sans-serif">M/L (medial/lateral) · A/P (anterior/posterior)</text>
      </svg>
    </div>
  );
}

// ─── Data & Logic ─────────────────────────────────────────────────────────────
// MED-002 (v2 fix retained): Level 4 is "8.75 to 11.0" inclusive; Level 5 is "> 11.0"
function getCvaiLevel(cvai) {
  if (cvai < 3.5)    return 0;
  if (cvai < 6.25)   return 1;
  if (cvai < 8.75)   return 2;
  if (cvai <= 11.0)  return 3; // ← corrected boundary: Level 4 includes 11.0
  return 4;
}

const SEVERITY = [
  { level:1, cvaiRange:"< 3.5",
    bgVar:"var(--sev1-bg)", borderVar:"var(--sev1-border)", textVar:"var(--sev1-text)",
    presentation:["All symmetry within normal limits"],
    recommendation:"No treatment required" },
  { level:2, cvaiRange:"3.5 – 6.25",
    bgVar:"var(--sev2-bg)", borderVar:"var(--sev2-border)", textVar:"var(--sev2-text)",
    presentation:["Minimal asymmetry in one posterior quadrant","No secondary changes"],
    recommendation:"Repositioning program" },
  { level:3, cvaiRange:"6.25 – 8.75",
    bgVar:"var(--sev3-bg)", borderVar:"var(--sev3-border)", textVar:"var(--sev3-text)",
    presentation:["Two quadrant involvement","Moderate to severe posterior quadrant flattening","Minimal ear shift and/or anterior involvement"],
    recommendation:"Conservative treatment: Repositioning · Cranial remolding orthosis (based on age and history)" },
  { level:4, cvaiRange:"8.75 – 11.0",
    bgVar:"var(--sev4-bg)", borderVar:"var(--sev4-border)", textVar:"var(--sev4-text)",
    presentation:["Two or three quadrant involvement","Severe posterior quadrant flattening","Moderate ear shift","Anterior involvement including noticeable orbit asymmetry"],
    recommendation:"Conservative treatment: Cranial remolding orthosis" },
  { level:5, cvaiRange:"> 11.0",
    bgVar:"var(--sev5-bg)", borderVar:"var(--sev5-border)", textVar:"var(--sev5-text)",
    presentation:["Three or four quadrant involvement","Severe posterior quadrant flattening","Severe ear shift","Anterior involvement including orbit and cheek asymmetry"],
    recommendation:"Conservative treatment: Cranial remolding orthosis" },
];

// Three-zone CR classification: CHOA threshold ">90" for orthotic; 85–90 as clinical monitoring
function getCrResult(cr) {
  if (cr > 90)  return { key:"ortho", bg:"var(--cr-ortho-bg)", border:"var(--cr-ortho-border)", text:"var(--cr-ortho-text)",
    label:"CR > 90 — Orthotic evaluation recommended",
    detail:"Per CHOA guideline: refer for cranial remolding orthosis evaluation." };
  if (cr >= 85) return { key:"watch", bg:"var(--cr-watch-bg)", border:"var(--cr-watch-border)", text:"var(--cr-watch-text)",
    label:"CR 85–90 — Borderline; monitor closely",
    detail:"Reassess at next visit. Document trajectory. No immediate orthotic indicated per CHOA threshold (>90)." };
  return        { key:"ok",    bg:"var(--cr-ok-bg)",    border:"var(--cr-ok-border)",    text:"var(--cr-ok-text)",
    label:"CR ≤ 85 — Within normal range",
    detail:"Continue routine developmental monitoring." };
}

// ─── Shared style constants ───────────────────────────────────────────────────
const card = {
  background:"var(--bg-card)", borderRadius:14, padding:"24px 20px",
  boxShadow:"var(--shadow-card)", border:"var(--border-card)"
};
const hd = {
  fontSize:"1.08rem", fontWeight:700, color:"var(--text-primary)",
  marginBottom:16, paddingBottom:10, borderBottom:"var(--border-section)", letterSpacing:"-0.01em"
};
const uTag = { fontSize:"0.68rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em" };

// ─── Shared UI components ────────────────────────────────────────────────────

function FormulaBar({ text }) {
  return (
    <div style={{ background:"var(--bg-formula)", borderRadius:9, padding:"9px 14px", marginBottom:10, display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
      <span style={{ ...uTag, color:"var(--text-tertiary)" }}>Formula</span>
      <code style={{ fontFamily:"var(--font-mono)", fontSize:"0.85rem", color:"var(--text-formula)", fontWeight:500 }}>{text}</code>
    </div>
  );
}

function MeasureNote({ children }) {
  return (
    <div style={{ background:"var(--bg-note)", border:"1px solid rgba(180,140,0,0.3)", borderRadius:8, padding:"8px 12px", marginBottom:14, fontSize:"0.82rem", lineHeight:1.55, color:"var(--text-secondary)" }}>
      <span style={{ marginRight:6 }}>📐</span>{children}
    </div>
  );
}

function NumberInput({ id, label, sublabel, value, onChange }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      <label htmlFor={id} style={{ fontSize:"0.82rem", fontWeight:600, color:"var(--text-secondary)", display:"flex", flexDirection:"column", gap:1 }}>
        {label}
        {sublabel && <span style={{ fontWeight:400, color:"var(--text-tertiary)", fontSize:"0.72rem" }}>{sublabel}</span>}
      </label>
      <div style={{ position:"relative" }}>
        <input
          id={id}
          type="number"
          min="0.1"
          step="0.1"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="—"
          aria-label={`${label} in millimeters`}
        />
        <span style={{ position:"absolute", right:11, top:"50%", transform:"translateY(-50%)", fontSize:"0.72rem", color:"var(--text-tertiary)", fontFamily:"var(--font-mono)", pointerEvents:"none" }}>mm</span>
      </div>
    </div>
  );
}

function SectionHead({ text }) {
  return <div style={{ ...uTag, color:"var(--text-tertiary)" }}>{text}</div>;
}

function ResultDetail({ bg, border, text, children }) {
  return (
    <div style={{ border:`1.5px solid ${border}`, background:bg, borderRadius:12, padding:"14px 16px", display:"flex", flexDirection:"column", gap:8, color:text }}>
      {children}
    </div>
  );
}

// ─── CVAI Calculator ──────────────────────────────────────────────────────────
// A31 fix: error in role="alert" (assertive); result in role="status" (polite)
function CvaiCalculator() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const fa = parseFloat(a), fb = parseFloat(b);
  const hasBoth = a !== "" && b !== "";
  const hasZero = hasBoth && !isNaN(fa) && !isNaN(fb) && (fa === 0 || fb === 0);
  const ready = hasBoth && !isNaN(fa) && !isNaN(fb) && fa > 0 && fb > 0;
  let cvai, sev;
  if (ready) {
    cvai = (Math.abs(fa - fb) / Math.max(fa, fb)) * 100;
    sev = SEVERITY[getCvaiLevel(cvai)];
  }

  return (
    <div>
      <FormulaBar text="CVAI = |A − B| ÷ max(A, B) × 100" />
      <MeasureNote>
        Measure at 30° from center of nose (outer edge of eyebrow), forehead to posterior skull, using calipers.
      </MeasureNote>
      <DiagramCVAI />
      <div className="input-row" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
        <NumberInput id="cvai-a" label="Diagonal A" sublabel="(longer)" value={a} onChange={setA} />
        <NumberInput id="cvai-b" label="Diagonal B" sublabel="(shorter)" value={b} onChange={setB} />
      </div>

      {/* A31: error uses role="alert" (assertive); result uses role="status" (polite) */}
      {hasZero && (
        <div role="alert" style={{ textAlign:"center", padding:"18px", background:"var(--cr-watch-bg)", border:"1.5px solid var(--cr-watch-border)", borderRadius:10, color:"var(--cr-watch-text)", fontSize:"0.86rem" }}>
          ⚠ Values must be greater than zero
        </div>
      )}

      {!hasZero && !ready && (
        <div style={{ textAlign:"center", color:"var(--text-tertiary)", fontSize:"0.86rem", padding:"24px 0", background:"var(--bg-formula)", borderRadius:10, border:"1.5px dashed rgba(128,128,128,0.25)" }}>
          Enter both measurements to calculate
        </div>
      )}

      {!hasZero && ready && (
        <div role="status" aria-live="polite" aria-atomic="true">
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", borderRadius:12, border:`2px solid ${sev.borderVar}`, background:sev.bgVar, padding:"14px 18px" }}>
              <span style={{ ...uTag, color:"var(--text-tertiary)", minWidth:44 }}>CVAI</span>
              <span style={{ fontFamily:"var(--font-mono)", fontSize:"2rem", fontWeight:600, color:sev.textVar, lineHeight:1 }}>{cvai.toFixed(2)}</span>
              <span style={{ fontWeight:700, fontSize:"0.95rem", color:sev.textVar, marginLeft:"auto" }}>Level {sev.level}</span>
              <span style={{ fontSize:"0.78rem", color:sev.textVar, fontWeight:500 }}>CVAI {sev.cvaiRange}</span>
            </div>
            <ResultDetail bg={sev.bgVar} border={sev.borderVar} text={sev.textVar}>
              <SectionHead text="Recommendation" />
              <div style={{ fontSize:"0.88rem", lineHeight:1.55 }}>{sev.recommendation}</div>
              <hr style={{ border:"none", borderTop:"1px solid rgba(0,0,0,0.08)", margin:"2px 0" }} />
              <SectionHead text="Clinical Presentation" />
              <ul style={{ paddingLeft:18, display:"flex", flexDirection:"column", gap:3, fontSize:"0.86rem", lineHeight:1.5 }}>
                {sev.presentation.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </ResultDetail>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CR Calculator ────────────────────────────────────────────────────────────
function CrCalculator() {
  const [ml, setMl] = useState("");
  const [ap, setAp] = useState("");
  const fm = parseFloat(ml), fa = parseFloat(ap);
  const hasBoth = ml !== "" && ap !== "";
  const hasZero = hasBoth && !isNaN(fm) && !isNaN(fa) && (fm === 0 || fa === 0);
  const ready = hasBoth && !isNaN(fm) && !isNaN(fa) && fm > 0 && fa > 0;
  let cr, res;
  if (ready) { cr = (fm / fa) * 100; res = getCrResult(cr); }

  return (
    <div>
      <FormulaBar text="CR = (M/L ÷ A/P) × 100" />
      <MeasureNote>
        Measure M/L (medial/lateral) and A/P (anterior/posterior) skull lengths with calipers.
        CR &gt; 90 indicates orthotic evaluation per CHOA guideline.
      </MeasureNote>
      <DiagramCR />
      <div className="input-row" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
        <NumberInput id="cr-ml" label="M/L" sublabel="(Medial/Lateral)" value={ml} onChange={setMl} />
        <NumberInput id="cr-ap" label="A/P" sublabel="(Anterior/Posterior)" value={ap} onChange={setAp} />
      </div>

      {hasZero && (
        <div role="alert" style={{ textAlign:"center", padding:"18px", background:"var(--cr-watch-bg)", border:"1.5px solid var(--cr-watch-border)", borderRadius:10, color:"var(--cr-watch-text)", fontSize:"0.86rem" }}>
          ⚠ Values must be greater than zero
        </div>
      )}

      {!hasZero && !ready && (
        <div style={{ textAlign:"center", color:"var(--text-tertiary)", fontSize:"0.86rem", padding:"24px 0", background:"var(--bg-formula)", borderRadius:10, border:"1.5px dashed rgba(128,128,128,0.25)" }}>
          Enter both measurements to calculate
        </div>
      )}

      {!hasZero && ready && (
        <div role="status" aria-live="polite" aria-atomic="true">
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", borderRadius:12, border:`2px solid ${res.border}`, background:res.bg, padding:"14px 18px" }}>
              <span style={{ ...uTag, color:"var(--text-tertiary)", minWidth:80 }}>Cephalic Ratio</span>
              <span style={{ fontFamily:"var(--font-mono)", fontSize:"2rem", fontWeight:600, color:res.text, lineHeight:1 }}>{cr.toFixed(1)}</span>
            </div>
            <ResultDetail bg={res.bg} border={res.border} text={res.text}>
              <SectionHead text="Assessment" />
              <div style={{ fontSize:"0.92rem", fontWeight:600 }}>{res.label}</div>
              <div style={{ fontSize:"0.86rem", lineHeight:1.55 }}>{res.detail}</div>
              {res.key === "ortho" && (
                <>
                  <hr style={{ border:"none", borderTop:"1px solid rgba(0,0,0,0.08)", margin:"2px 0" }} />
                  <SectionHead text="Clinical Presentation — Brachycephaly" />
                  <ul style={{ paddingLeft:18, fontSize:"0.86rem", lineHeight:1.5, display:"flex", flexDirection:"column", gap:3 }}>
                    {["Bilateral forehead bossing","Increased posterior vault","Bilateral protrusion of parietal bone above ears"].map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </>
              )}
            </ResultDetail>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Severity Table ───────────────────────────────────────────────────────────
// TH-SR-002: added scope="col" on th; table wrapped in role="region" with aria-label
// BADGE-SR-003: badge spans have aria-label="Level N"
// KB-002: overflow container has tabIndex and role="region"
function SeverityTable() {
  return (
    <section style={card} aria-labelledby="sev-heading">
      <h2 id="sev-heading" style={hd}>Plagiocephaly Severity Scale</h2>
      <div
        role="region"
        tabIndex={0}
        aria-label="Severity scale — scroll horizontally to view all columns"
        style={{ overflowX:"auto", borderRadius:8, border:"var(--border-section)", outline:"none" }}
        onFocus={e => { e.currentTarget.style.boxShadow = "var(--focus-ring)"; }}
        onBlur={e => { e.currentTarget.style.boxShadow = "none"; }}
      >
        <table className="sev-table" style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.83rem", minWidth:520 }}>
          <caption className="sr-only">CHOA Plagiocephaly Severity Scale: five levels from no asymmetry (Level 1) to severe multi-quadrant involvement (Level 5)</caption>
          <thead>
            <tr>
              {["Level","CVAI","Clinical Presentation","Recommendation"].map(h => (
                <th
                  key={h}
                  scope="col"
                  style={{ background:"var(--bg-formula)", color:"var(--text-secondary)", fontWeight:700, fontSize:"0.7rem", textTransform:"uppercase", letterSpacing:"0.06em", padding:"10px 12px", textAlign:"left", borderBottom:"var(--border-section)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SEVERITY.map(s => (
              <tr key={s.level}>
                <td style={{ padding:"10px 12px", textAlign:"center", width:58, verticalAlign:"top", borderBottom:"var(--border-section)" }}>
                  {/* BADGE-SR-003: aria-label provides "Level N" context beyond numeral */}
                  <span
                    aria-label={`Level ${s.level}`}
                    style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:30, height:30, borderRadius:"50%", fontWeight:700, fontSize:"0.88rem", background:s.bgVar, color:s.textVar, border:`2px solid ${s.borderVar}` }}
                  >
                    {s.level}
                  </span>
                </td>
                <td style={{ padding:"10px 12px", fontFamily:"var(--font-mono)", fontSize:"0.78rem", fontWeight:600, color:s.textVar, whiteSpace:"nowrap", width:100, verticalAlign:"top", borderBottom:"var(--border-section)" }}>
                  {s.cvaiRange}
                </td>
                <td style={{ padding:"10px 12px", lineHeight:1.5, verticalAlign:"top", borderBottom:"var(--border-section)" }}>
                  <ul style={{ paddingLeft:14 }}>{s.presentation.map((p, i) => <li key={i}>{p}</li>)}</ul>
                </td>
                <td style={{ padding:"10px 12px", fontStyle:"italic", fontSize:"0.82rem", lineHeight:1.5, verticalAlign:"top", borderBottom:"var(--border-section)" }}>
                  {s.recommendation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize:"0.72rem", color:"var(--text-tertiary)", marginTop:12, lineHeight:1.6, fontStyle:"italic" }}>
        This evaluation tool assists medical professionals in determining appropriate treatment.
        Recommendations are examples and not a substitute for individual evaluation, diagnosis,
        and treatment decisions by a medical professional.
      </p>
    </section>
  );
}

// ─── Age Guidelines ───────────────────────────────────────────────────────────
function AgeGuidelines() {
  const conds = [
    { title:"Plagiocephaly", leftBorder:true,
      presentation:["Ipsilateral ear shift","Ipsilateral frontal bossing","Contralateral frontal flattening"],
      doc:["Measure longest and shortest diagonal (forehead → posterior skull) with calipers","Calculate CVAI"] },
    { title:"Brachycephaly", leftBorder:false,
      presentation:["Bilateral forehead bossing","Increased posterior vault","Bilateral protrusion of parietal bone above ears"],
      doc:["Measure M/L and A/P skull lengths with calipers","Calculate Cephalic Ratio (CR)","CR > 90 → orthotic evaluation recommended"] },
  ];
  return (
    <section style={card} aria-labelledby="age-heading">
      <h2 id="age-heading" style={hd}>Age-Specific Clinical Guidelines</h2>

      {/* Birth–4 months */}
      <div style={{ border:"var(--border-section)", borderRadius:10, overflow:"hidden", marginBottom:16 }}>
        <div style={{ background:"var(--bg-formula)", padding:"10px 16px", display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
          <span style={{ background:"#d1f5e0", color:"#145c30", fontWeight:700, fontSize:"0.78rem", padding:"3px 10px", borderRadius:20 }}>Birth – 4 Months</span>
        </div>
        <ul style={{ padding:"14px 18px 14px 36px", display:"flex", flexDirection:"column", gap:8, fontSize:"0.85rem", lineHeight:1.6, color:"var(--text-secondary)" }}>
          <li>A documented <strong>two-month repositioning period</strong> is highly recommended prior to referring for cranial remolding orthosis evaluation.</li>
          <li>This conservative step is <strong>typically required by third-party payors</strong> before authorizing a cranial remolding orthosis.</li>
          <li><strong>Tummy Time Tools</strong> — parent handout with repositioning activities: <a href="https://choa.org/tummytimetools" target="_blank" rel="noreferrer">choa.org/tummytimetools</a></li>
          <li>If <strong>torticollis is suspected</strong>, early referral to physical therapy is recommended.</li>
        </ul>
      </div>

      {/* 4+ months */}
      <div style={{ border:"var(--border-section)", borderRadius:10, overflow:"hidden" }}>
        <div style={{ background:"var(--bg-formula)", padding:"10px 16px", display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
          <span style={{ background:"#dde3f0", color:"#1d3461", fontWeight:700, fontSize:"0.78rem", padding:"3px 10px", borderRadius:20 }}>4+ Months</span>
          <span style={{ fontSize:"0.77rem", color:"var(--text-tertiary)" }}>Assess for further treatment when secondary skull characteristics are observed</span>
        </div>
        <div className="condition-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr" }}>
          {conds.map((c, i) => (
            <div
              key={i}
              className={c.leftBorder ? "condition-block-left" : ""}
              style={{ padding:"16px", background:"var(--bg-card)", borderRight:c.leftBorder ? "var(--border-section)" : "none" }}
            >
              <div style={{ fontWeight:700, fontSize:"0.97rem", color:"var(--text-primary)", marginBottom:10, paddingBottom:6, borderBottom:"var(--border-section)" }}>{c.title}</div>
              <div style={{ ...uTag, color:"var(--text-tertiary)", margin:"8px 0 4px" }}>Clinical Presentation</div>
              <ul style={{ paddingLeft:16, fontSize:"0.83rem", lineHeight:1.6, color:"var(--text-secondary)", display:"flex", flexDirection:"column", gap:2 }}>
                {c.presentation.map((p, j) => <li key={j}>{p}</li>)}
              </ul>
              <div style={{ ...uTag, color:"var(--text-tertiary)", margin:"10px 0 4px" }}>Documentation</div>
              <ul style={{ paddingLeft:16, fontSize:"0.83rem", lineHeight:1.6, color:"var(--text-secondary)", display:"flex", flexDirection:"column", gap:2 }}>
                {c.doc.map((d, j) => <li key={j}>{d}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("cvai");

  // A18: Set document title on mount; restore on unmount for embedded use
  useEffect(() => {
    const prev = document.title;
    document.title = "Plagiocephaly Assessment — CHOA Clinical Reference";
    return () => { document.title = prev; };
  }, []);

  // KB-001: Arrow key navigation between tabs (WAI-ARIA tab pattern)
  const TABS = ["cvai", "cr"];
  const handleTabKeyDown = e => {
    const cur = TABS.indexOf(tab);
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = TABS[(cur + 1) % TABS.length];
      setTab(next);
      document.getElementById(`tab-${next}`)?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = TABS[(cur - 1 + TABS.length) % TABS.length];
      setTab(prev);
      document.getElementById(`tab-${prev}`)?.focus();
    }
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      {/* Skip navigation for keyboard-only users */}
      {/* CC-003: background updated from #0071e3 (4.25:1) to var(--bg-header) (10.2:1) */}
      <a
        href="#main"
        style={{ position:"absolute", left:-9999, top:4, zIndex:999, padding:"8px 14px", background:"var(--bg-header)", color:"#fff", borderRadius:4, fontWeight:600 }}
        onFocus={e => { e.target.style.left = "8px"; }}
        onBlur={e => { e.target.style.left = "-9999px"; }}
      >
        Skip to main content
      </a>

      <header style={{ background:"var(--bg-header)", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 12px rgba(0,0,0,0.28)" }}>
        <div style={{ maxWidth:860, margin:"0 auto", padding:"13px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
          <div>
            <h1 style={{ fontSize:"clamp(1rem,3vw,1.3rem)", fontWeight:700, color:"var(--text-header)", letterSpacing:"-0.02em" }}>
              Plagiocephaly Assessment
            </h1>
            <p style={{ fontSize:"0.67rem", color:"var(--text-header-sub)", marginTop:2, textTransform:"uppercase", letterSpacing:"0.05em" }}>
              CHOA Clinical Reference · CVAI &amp; Cephalic Ratio
            </p>
          </div>
          <span style={{ fontSize:"0.67rem", fontWeight:700, background:"#e8c84a", color:"#1c1c1e", padding:"4px 10px", borderRadius:5, letterSpacing:"0.05em", textTransform:"uppercase", flexShrink:0 }}>
            Clinical Ref
          </span>
        </div>
      </header>

      <main id="main" style={{ maxWidth:860, margin:"0 auto", padding:"20px 20px 48px", display:"flex", flexDirection:"column", gap:22 }}>

        {/* Calculator card */}
        <div style={{ background:"var(--bg-card)", borderRadius:14, boxShadow:"var(--shadow-card)", border:"var(--border-card)", overflow:"hidden" }}>

          {/* Tab list — KB-001: onKeyDown handles ArrowLeft/ArrowRight */}
          <div
            role="tablist"
            aria-label="Calculator type"
            style={{ display:"grid", gridTemplateColumns:"1fr 1fr", borderBottom:"2px solid rgba(128,128,128,0.12)" }}
            onKeyDown={handleTabKeyDown}
          >
            {[
              { id:"cvai", label:"CVAI",          sub:"Plagiocephaly" },
              { id:"cr",   label:"Cephalic Ratio", sub:"Brachycephaly" },
            ].map(t => (
              <button
                key={t.id}
                id={`tab-${t.id}`}
                role="tab"
                aria-selected={tab === t.id}
                aria-controls={`panel-${t.id}`}
                className={`tab-btn${tab === t.id ? " active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                <span className="tab-label">{t.label}</span>
                <span className="tab-sub">{t.sub}</span>
              </button>
            ))}
          </div>

          {/* Tab panels — display:none removes from accessibility tree */}
          <div id="panel-cvai" role="tabpanel" aria-labelledby="tab-cvai" style={{ padding:"20px 20px 24px", display:tab === "cvai" ? "block" : "none" }}>
            <CvaiCalculator />
          </div>
          <div id="panel-cr" role="tabpanel" aria-labelledby="tab-cr" style={{ padding:"20px 20px 24px", display:tab === "cr" ? "block" : "none" }}>
            <CrCalculator />
          </div>

          {/* HIPAA-DISC-001: No patient data disclaimer */}
          <div style={{ fontSize:"0.68rem", color:"var(--text-tertiary)", textAlign:"center", padding:"9px 20px 11px", borderTop:"var(--border-section)", background:"var(--bg-formula)" }}>
            No patient data is stored or transmitted by this calculator.
          </div>
        </div>

        <SeverityTable />
        <AgeGuidelines />
      </main>

      <footer style={{ textAlign:"center", padding:"16px 20px", fontSize:"0.72rem", color:"var(--text-tertiary)", display:"flex", justifyContent:"center", gap:8, flexWrap:"wrap" }}>
        <a href="https://choa.org/cranialremolding" target="_blank" rel="noreferrer">choa.org/cranialremolding</a>
        <span>·</span>
        <span>© 2015 Children's Healthcare of Atlanta · ORTH 961942</span>
      </footer>
    </>
  );
}
