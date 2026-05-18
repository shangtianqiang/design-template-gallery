const fs = require('fs');
const path = require('path');

const designDir = path.join(__dirname, 'design-md');
const outputFile = path.join(__dirname, 'preview-gallery.html');

// Read all DESIGN.md files
const designContents = {};
const dirs = fs.readdirSync(designDir);

for (const dir of dirs) {
  const designPath = path.join(designDir, dir, 'DESIGN.md');
  if (fs.existsSync(designPath)) {
    designContents[dir] = fs.readFileSync(designPath, 'utf-8');
  }
}

console.log(`Loaded ${Object.keys(designContents).length} DESIGN.md files`);

// Generate the complete HTML
const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Design Template Gallery</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --bg: #0a0a0a;
    --surface: #141414;
    --surface-2: #1e1e1e;
    --border: #2a2a2a;
    --text: #e8e8e8;
    --text-dim: #888;
    --accent: #7c5cfc;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
  }

  .app {
    display: flex;
    height: 100vh;
  }

  .sidebar {
    width: 260px;
    background: var(--surface);
    border-right: 1px solid var(--border);
    padding: 24px 16px;
    overflow-y: auto;
    flex-shrink: 0;
  }

  .main {
    flex: 1;
    overflow-y: auto;
    padding: 32px;
  }

  .sidebar h1 {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 8px;
    letter-spacing: -0.5px;
  }

  .sidebar .subtitle {
    font-size: 12px;
    color: var(--text-dim);
    margin-bottom: 24px;
  }

  .filter-group {
    margin-bottom: 20px;
  }

  .filter-group h3 {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: var(--text-dim);
    margin-bottom: 10px;
  }

  .filter-btn {
    display: block;
    width: 100%;
    padding: 8px 12px;
    margin-bottom: 4px;
    background: none;
    border: none;
    color: var(--text);
    text-align: left;
    font-size: 13px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .filter-btn:hover { background: var(--surface-2); }
  .filter-btn.active { background: var(--accent); color: #fff; }
  .filter-btn .count {
    float: right;
    font-size: 11px;
    color: var(--text-dim);
    background: var(--surface-2);
    padding: 1px 6px;
    border-radius: 10px;
  }
  .filter-btn.active .count { background: rgba(255,255,255,0.2); color: #fff; }

  .grid-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .grid-header h2 { font-size: 22px; font-weight: 600; letter-spacing: -0.5px; }
  .grid-header .result-count { font-size: 13px; color: var(--text-dim); }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 20px;
  }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s, border-color 0.2s;
  }

  .card:hover {
    transform: translateY(-2px);
    border-color: var(--accent);
  }

  .card-preview {
    height: 220px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }

  .card-info {
    padding: 16px;
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-name {
    font-size: 15px;
    font-weight: 600;
    text-transform: capitalize;
  }

  .card-meta {
    display: flex;
    gap: 6px;
  }

  .tag {
    font-size: 10px;
    padding: 3px 8px;
    border-radius: 20px;
    border: 1px solid var(--border);
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .pv-hero {
    font-size: 26px;
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -1px;
    margin-bottom: 8px;
  }

  .pv-desc {
    font-size: 12px;
    line-height: 1.5;
    opacity: 0.7;
    max-width: 80%;
  }

  .pv-actions {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .pv-btn {
    padding: 8px 20px;
    font-size: 12px;
    font-weight: 600;
    border: none;
    cursor: default;
    letter-spacing: 0.3px;
  }

  .pv-btn-outline {
    background: transparent;
    border: 1.5px solid;
  }

  .pv-swatches {
    position: absolute;
    bottom: 12px;
    right: 12px;
    display: flex;
    gap: 4px;
  }

  .pv-swatch {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid rgba(128,128,128,0.2);
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.8);
    z-index: 1000;
    display: none;
    justify-content: center;
    align-items: center;
    padding: 40px;
  }

  .modal-overlay.open { display: flex; }

  .modal {
    width: 100%;
    max-width: 900px;
    max-height: 90vh;
    border-radius: 16px;
    overflow-y: auto;
    position: relative;
  }

  .modal-top-bar {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px;
    background: inherit;
  }

  .modal-close, .copy-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: rgba(128,128,128,0.3);
    color: inherit;
    font-size: 18px;
    cursor: pointer;
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .copy-btn {
    width: auto;
    border-radius: 8px;
    padding: 8px 14px;
    font-size: 12px;
    background: rgba(128,128,128,0.2);
    border: 1px solid rgba(128,128,128,0.3);
    gap: 6px;
    transition: all 0.2s;
  }

  .copy-btn:hover {
    background: rgba(128,128,128,0.4);
  }

  .copy-btn.copied {
    background: rgba(76, 175, 80, 0.3);
    border-color: rgba(76, 175, 80, 0.5);
  }

  .copy-btn svg {
    width: 14px;
    height: 14px;
  }

  .modal-content {
    padding: 0 40px 48px;
  }

  .modal-hero {
    font-size: 48px;
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: -2px;
    margin-bottom: 16px;
  }

  .modal-sub {
    font-size: 16px;
    line-height: 1.6;
    opacity: 0.75;
    max-width: 600px;
    margin-bottom: 32px;
  }

  .modal-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 48px;
  }

  .modal-btn {
    padding: 14px 32px;
    font-size: 14px;
    font-weight: 600;
    border: none;
    cursor: default;
  }

  .modal-btn-outline {
    background: transparent;
    border: 1.5px solid;
  }

  .modal-section-title {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 2px;
    opacity: 0.5;
    margin-bottom: 16px;
  }

  .modal-colors {
    display: flex;
    gap: 12px;
    margin-bottom: 48px;
    flex-wrap: wrap;
  }

  .modal-color {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .modal-color-circle {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: 2px solid rgba(128,128,128,0.2);
  }

  .modal-color-hex {
    font-size: 11px;
    font-family: 'SF Mono', Monaco, monospace;
    opacity: 0.6;
  }

  .modal-typography {
    margin-bottom: 48px;
  }

  .modal-type-display {
    font-size: 40px;
    font-weight: 700;
    letter-spacing: -1.5px;
    line-height: 1.1;
    margin-bottom: 8px;
  }

  .modal-type-body {
    font-size: 15px;
    line-height: 1.7;
    opacity: 0.8;
    max-width: 500px;
  }

  .modal-type-label {
    font-size: 11px;
    opacity: 0.4;
    margin-bottom: 4px;
  }

  .modal-buttons {
    display: flex;
    gap: 12px;
    margin-bottom: 48px;
    flex-wrap: wrap;
    align-items: center;
  }

  .modal-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 48px;
  }

  .modal-card-item {
    padding: 20px;
    border-radius: 8px;
  }

  .modal-card-item h4 {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .modal-card-item p {
    font-size: 12px;
    opacity: 0.7;
    line-height: 1.5;
  }

  .modal-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    margin-bottom: 32px;
    border-bottom: 1px solid rgba(128,128,128,0.15);
  }

  .modal-nav-logo {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: -0.5px;
    text-transform: capitalize;
  }

  .modal-nav-links {
    display: flex;
    gap: 24px;
    font-size: 13px;
    opacity: 0.6;
  }

  .search-box {
    width: 100%;
    padding: 10px 14px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    font-size: 13px;
    margin-bottom: 20px;
    outline: none;
  }

  .search-box:focus { border-color: var(--accent); }
  .search-box::placeholder { color: var(--text-dim); }

  @media (max-width: 768px) {
    .sidebar { display: none; }
    .grid { grid-template-columns: 1fr; }
    .modal { margin: 10px; }
    .modal-hero { font-size: 32px; }
    .modal-cards { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>

<div class="app">
  <aside class="sidebar">
    <h1>Design Gallery</h1>
    <p class="subtitle">71 brand design templates</p>

    <input type="text" class="search-box" placeholder="Search templates..." id="searchBox">

    <div class="filter-group">
      <h3>Category</h3>
      <button class="filter-btn active" data-filter="all">All <span class="count">71</span></button>
      <button class="filter-btn" data-filter="dev">Developer Tools <span class="count">17</span></button>
      <button class="filter-btn" data-filter="ai">AI & LLM <span class="count">10</span></button>
      <button class="filter-btn" data-filter="fintech">Fintech <span class="count">7</span></button>
      <button class="filter-btn" data-filter="ecommerce">E-commerce <span class="count">5</span></button>
      <button class="filter-btn" data-filter="productivity">Productivity <span class="count">10</span></button>
      <button class="filter-btn" data-filter="design">Design Tools <span class="count">4</span></button>
      <button class="filter-btn" data-filter="auto">Automotive <span class="count">7</span></button>
      <button class="filter-btn" data-filter="media">Media <span class="count">6</span></button>
      <button class="filter-btn" data-filter="enterprise">Enterprise <span class="count">5</span></button>
    </div>

    <div class="filter-group">
      <h3>Mood</h3>
      <button class="filter-btn" data-mood="dark">Dark <span class="count">19</span></button>
      <button class="filter-btn" data-mood="minimal">Minimal <span class="count">14</span></button>
      <button class="filter-btn" data-mood="warm">Warm <span class="count">13</span></button>
      <button class="filter-btn" data-mood="corporate">Corporate <span class="count">8</span></button>
      <button class="filter-btn" data-mood="bold">Bold <span class="count">6</span></button>
      <button class="filter-btn" data-mood="playful">Playful <span class="count">6</span></button>
      <button class="filter-btn" data-mood="editorial">Editorial <span class="count">5</span></button>
    </div>

    <div class="filter-group">
      <h3>Button Style</h3>
      <button class="filter-btn" data-btn="pill">Pill <span class="count">34</span></button>
      <button class="filter-btn" data-btn="rounded">Rounded <span class="count">28</span></button>
      <button class="filter-btn" data-btn="sharp">Sharp <span class="count">9</span></button>
    </div>
  </aside>

  <main class="main">
    <div class="grid-header">
      <h2 id="gridTitle">All Templates</h2>
      <span class="result-count" id="resultCount">71 templates</span>
    </div>
    <div class="grid" id="grid"></div>
  </main>
</div>

<div class="modal-overlay" id="modalOverlay">
  <div class="modal" id="modal">
    <div class="modal-top-bar">
      <button class="copy-btn" id="copyBtn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        Copy DESIGN.md
      </button>
      <button class="modal-close" id="modalClose">&times;</button>
    </div>
    <div class="modal-content" id="modalContent"></div>
  </div>
</div>

<script>
const designContents = ${JSON.stringify(designContents)};

const templates = [
  {name:"airbnb",primaryColor:"#ff385c",canvasColor:"#ffffff",textColor:"#222222",fontFamily:"Airbnb Cereal VF",borderRadius:8,buttonStyle:"rounded",mood:"warm",cat:"ecommerce"},
  {name:"airtable",primaryColor:"#181d26",canvasColor:"#ffffff",textColor:"#181d26",fontFamily:"Haas Grotesk",borderRadius:12,buttonStyle:"rounded",mood:"editorial",cat:"productivity"},
  {name:"apple",primaryColor:"#0066cc",canvasColor:"#ffffff",textColor:"#1d1d1f",fontFamily:"SF Pro Display",borderRadius:9999,buttonStyle:"pill",mood:"minimal",cat:"media"},
  {name:"binance",primaryColor:"#fcd535",canvasColor:"#0b0e11",textColor:"#eaecef",fontFamily:"BinanceNova",borderRadius:6,buttonStyle:"rounded",mood:"dark",cat:"fintech"},
  {name:"bmw-m",primaryColor:"#ffffff",canvasColor:"#000000",textColor:"#ffffff",fontFamily:"BMW Type Next",borderRadius:0,buttonStyle:"sharp",mood:"dark",cat:"auto"},
  {name:"bmw",primaryColor:"#1c69d4",canvasColor:"#ffffff",textColor:"#262626",fontFamily:"BMW Type Next",borderRadius:0,buttonStyle:"sharp",mood:"corporate",cat:"auto"},
  {name:"bugatti",primaryColor:"#ffffff",canvasColor:"#000000",textColor:"#ffffff",fontFamily:"Bugatti Display",borderRadius:9999,buttonStyle:"pill",mood:"minimal",cat:"auto"},
  {name:"cal",primaryColor:"#111111",canvasColor:"#ffffff",textColor:"#111111",fontFamily:"Cal Sans",borderRadius:8,buttonStyle:"rounded",mood:"minimal",cat:"productivity"},
  {name:"claude",primaryColor:"#cc785c",canvasColor:"#faf9f5",textColor:"#141413",fontFamily:"Copernicus",borderRadius:8,buttonStyle:"rounded",mood:"warm",cat:"ai"},
  {name:"clay",primaryColor:"#0a0a0a",canvasColor:"#fffaf0",textColor:"#0a0a0a",fontFamily:"Plain Black",borderRadius:12,buttonStyle:"rounded",mood:"playful",cat:"productivity"},
  {name:"clickhouse",primaryColor:"#faff69",canvasColor:"#0a0a0a",textColor:"#ffffff",fontFamily:"Inter",borderRadius:8,buttonStyle:"rounded",mood:"dark",cat:"dev"},
  {name:"cohere",primaryColor:"#17171c",canvasColor:"#ffffff",textColor:"#212121",fontFamily:"CohereText",borderRadius:32,buttonStyle:"pill",mood:"editorial",cat:"ai"},
  {name:"coinbase",primaryColor:"#0052ff",canvasColor:"#ffffff",textColor:"#0a0b0d",fontFamily:"Coinbase Display",borderRadius:100,buttonStyle:"pill",mood:"corporate",cat:"fintech"},
  {name:"composio",primaryColor:"#0007cd",canvasColor:"#0f0f0f",textColor:"#ffffff",fontFamily:"abcDiatype",borderRadius:8,buttonStyle:"rounded",mood:"dark",cat:"dev"},
  {name:"cursor",primaryColor:"#f54e00",canvasColor:"#f7f7f4",textColor:"#26251e",fontFamily:"CursorGothic",borderRadius:8,buttonStyle:"rounded",mood:"warm",cat:"dev"},
  {name:"elevenlabs",primaryColor:"#292524",canvasColor:"#f5f5f5",textColor:"#0c0a09",fontFamily:"Waldenburg",borderRadius:9999,buttonStyle:"pill",mood:"editorial",cat:"ai"},
  {name:"expo",primaryColor:"#000000",canvasColor:"#ffffff",textColor:"#171717",fontFamily:"Inter",borderRadius:8,buttonStyle:"rounded",mood:"minimal",cat:"dev"},
  {name:"ferrari",primaryColor:"#da291c",canvasColor:"#181818",textColor:"#ffffff",fontFamily:"FerrariSans",borderRadius:0,buttonStyle:"sharp",mood:"bold",cat:"auto"},
  {name:"figma",primaryColor:"#000000",canvasColor:"#ffffff",textColor:"#000000",fontFamily:"figmaSans",borderRadius:50,buttonStyle:"pill",mood:"playful",cat:"design"},
  {name:"framer",primaryColor:"#ffffff",canvasColor:"#090909",textColor:"#ffffff",fontFamily:"GT Walsheim",borderRadius:100,buttonStyle:"pill",mood:"dark",cat:"design"},
  {name:"hashicorp",primaryColor:"#000000",canvasColor:"#000000",textColor:"#ffffff",fontFamily:"hashicorpSans",borderRadius:8,buttonStyle:"rounded",mood:"dark",cat:"dev"},
  {name:"ibm",primaryColor:"#0f62fe",canvasColor:"#ffffff",textColor:"#161616",fontFamily:"IBM Plex Sans",borderRadius:0,buttonStyle:"sharp",mood:"corporate",cat:"enterprise"},
  {name:"intercom",primaryColor:"#111111",canvasColor:"#f5f1ec",textColor:"#111111",fontFamily:"Saans",borderRadius:8,buttonStyle:"rounded",mood:"warm",cat:"productivity"},
  {name:"kraken",primaryColor:"#7132f5",canvasColor:"#ffffff",textColor:"#101114",fontFamily:"Kraken-Brand",borderRadius:12,buttonStyle:"rounded",mood:"corporate",cat:"fintech"},
  {name:"lamborghini",primaryColor:"#FFC000",canvasColor:"#000000",textColor:"#ffffff",fontFamily:"LamboType",borderRadius:0,buttonStyle:"sharp",mood:"dark",cat:"auto"},
  {name:"linear",primaryColor:"#5e6ad2",canvasColor:"#010102",textColor:"#f7f8f8",fontFamily:"Linear Display",borderRadius:8,buttonStyle:"rounded",mood:"dark",cat:"dev"},
  {name:"lovable",primaryColor:"#1c1c1c",canvasColor:"#f7f4ed",textColor:"#1c1c1c",fontFamily:"Camera Plain",borderRadius:6,buttonStyle:"rounded",mood:"warm",cat:"ai"},
  {name:"mastercard",primaryColor:"#141413",canvasColor:"#F3F0EE",textColor:"#141413",fontFamily:"MarkForMC",borderRadius:20,buttonStyle:"rounded",mood:"warm",cat:"fintech"},
  {name:"meta",primaryColor:"#0064e0",canvasColor:"#ffffff",textColor:"#1c1e21",fontFamily:"Optimistic VF",borderRadius:100,buttonStyle:"pill",mood:"corporate",cat:"ecommerce"},
  {name:"minimax",primaryColor:"#0a0a0a",canvasColor:"#ffffff",textColor:"#0a0a0a",fontFamily:"DM Sans",borderRadius:8,buttonStyle:"rounded",mood:"minimal",cat:"ai"},
  {name:"mintlify",primaryColor:"#0a0a0a",canvasColor:"#ffffff",textColor:"#0a0a0a",fontFamily:"Inter",borderRadius:8,buttonStyle:"rounded",mood:"minimal",cat:"dev"},
  {name:"miro",primaryColor:"#1c1c1e",canvasColor:"#ffffff",textColor:"#1c1c1e",fontFamily:"Roobert PRO",borderRadius:8,buttonStyle:"rounded",mood:"playful",cat:"productivity"},
  {name:"mistral",primaryColor:"#fa520f",canvasColor:"#ffffff",textColor:"#1f1f1f",fontFamily:"PP Editorial Old",borderRadius:8,buttonStyle:"rounded",mood:"warm",cat:"ai"},
  {name:"mongodb",primaryColor:"#00ed64",canvasColor:"#ffffff",textColor:"#001e2b",fontFamily:"Euclid Circular",borderRadius:100,buttonStyle:"pill",mood:"dark",cat:"dev"},
  {name:"nike",primaryColor:"#111111",canvasColor:"#ffffff",textColor:"#111111",fontFamily:"Nike Futura ND",borderRadius:100,buttonStyle:"pill",mood:"bold",cat:"ecommerce"},
  {name:"notion",primaryColor:"#5645d4",canvasColor:"#ffffff",textColor:"#1a1a1a",fontFamily:"Notion Sans",borderRadius:8,buttonStyle:"rounded",mood:"minimal",cat:"productivity"},
  {name:"nvidia",primaryColor:"#76b900",canvasColor:"#ffffff",textColor:"#000000",fontFamily:"NVIDIA-EMEA",borderRadius:2,buttonStyle:"sharp",mood:"corporate",cat:"enterprise"},
  {name:"ollama",primaryColor:"#000000",canvasColor:"#ffffff",textColor:"#000000",fontFamily:"SF Pro Rounded",borderRadius:9999,buttonStyle:"pill",mood:"minimal",cat:"dev"},
  {name:"opencode",primaryColor:"#201d1d",canvasColor:"#fdfcfc",textColor:"#201d1d",fontFamily:"Berkeley Mono",borderRadius:4,buttonStyle:"sharp",mood:"minimal",cat:"dev"},
  {name:"pinterest",primaryColor:"#e60023",canvasColor:"#ffffff",textColor:"#000000",fontFamily:"Pin Sans",borderRadius:16,buttonStyle:"rounded",mood:"warm",cat:"media"},
  {name:"playstation",primaryColor:"#0070d1",canvasColor:"#ffffff",textColor:"#000000",fontFamily:"PlayStation SST",borderRadius:100,buttonStyle:"pill",mood:"bold",cat:"media"},
  {name:"posthog",primaryColor:"#f7a501",canvasColor:"#eeefe9",textColor:"#23251d",fontFamily:"IBM Plex Sans",borderRadius:6,buttonStyle:"rounded",mood:"playful",cat:"dev"},
  {name:"raycast",primaryColor:"#ffffff",canvasColor:"#07080a",textColor:"#f4f4f6",fontFamily:"Inter",borderRadius:100,buttonStyle:"pill",mood:"dark",cat:"dev"},
  {name:"renault",primaryColor:"#ffed00",canvasColor:"#ffffff",textColor:"#000000",fontFamily:"NouvelR",borderRadius:4,buttonStyle:"sharp",mood:"bold",cat:"auto"},
  {name:"replicate",primaryColor:"#ea2804",canvasColor:"#f9f7f3",textColor:"#202020",fontFamily:"rb-freigeist",borderRadius:8,buttonStyle:"rounded",mood:"warm",cat:"ai"},
  {name:"resend",primaryColor:"#fcfdff",canvasColor:"#000000",textColor:"#fcfdff",fontFamily:"Domaine Display",borderRadius:12,buttonStyle:"rounded",mood:"dark",cat:"dev"},
  {name:"revolut",primaryColor:"#494fdf",canvasColor:"#ffffff",textColor:"#191c1f",fontFamily:"Aeonik Pro",borderRadius:100,buttonStyle:"pill",mood:"corporate",cat:"fintech"},
  {name:"runwayml",primaryColor:"#000000",canvasColor:"#000000",textColor:"#ffffff",fontFamily:"abcNormal",borderRadius:6,buttonStyle:"rounded",mood:"dark",cat:"ai"},
  {name:"sanity",primaryColor:"#f36458",canvasColor:"#0b0b0b",textColor:"#ffffff",fontFamily:"waldenburg",borderRadius:99999,buttonStyle:"pill",mood:"dark",cat:"dev"},
  {name:"sentry",primaryColor:"#150f23",canvasColor:"#ffffff",textColor:"#1f1633",fontFamily:"Sentri Display",borderRadius:8,buttonStyle:"rounded",mood:"playful",cat:"dev"},
  {name:"shopify",primaryColor:"#000000",canvasColor:"#ffffff",textColor:"#000000",fontFamily:"NeueHaasGrotesk",borderRadius:9999,buttonStyle:"pill",mood:"minimal",cat:"ecommerce"},
  {name:"slack",primaryColor:"#4a154b",canvasColor:"#ffffff",textColor:"#1d1d1d",fontFamily:"Avant Garde",borderRadius:90,buttonStyle:"pill",mood:"warm",cat:"productivity"},
  {name:"spacex",primaryColor:"#000000",canvasColor:"#000000",textColor:"#ffffff",fontFamily:"D-DIN-Bold",borderRadius:32,buttonStyle:"pill",mood:"dark",cat:"enterprise"},
  {name:"spotify",primaryColor:"#1ed760",canvasColor:"#121212",textColor:"#ffffff",fontFamily:"SpotifyMixUI",borderRadius:500,buttonStyle:"pill",mood:"dark",cat:"media"},
  {name:"starbucks",primaryColor:"#006241",canvasColor:"#f2f0eb",textColor:"#000000",fontFamily:"SoDoSans",borderRadius:50,buttonStyle:"pill",mood:"warm",cat:"ecommerce"},
  {name:"stripe",primaryColor:"#533afd",canvasColor:"#ffffff",textColor:"#0d253d",fontFamily:"Sohne",borderRadius:100,buttonStyle:"pill",mood:"corporate",cat:"fintech"},
  {name:"supabase",primaryColor:"#3ecf8e",canvasColor:"#ffffff",textColor:"#171717",fontFamily:"Circular",borderRadius:8,buttonStyle:"rounded",mood:"minimal",cat:"dev"},
  {name:"superhuman",primaryColor:"#1b1938",canvasColor:"#ffffff",textColor:"#292827",fontFamily:"Super Sans VF",borderRadius:8,buttonStyle:"rounded",mood:"editorial",cat:"productivity"},
  {name:"tesla",primaryColor:"#3E6AE1",canvasColor:"#ffffff",textColor:"#171A20",fontFamily:"Universal Sans",borderRadius:4,buttonStyle:"sharp",mood:"minimal",cat:"auto"},
  {name:"theverge",primaryColor:"#3cffd0",canvasColor:"#131313",textColor:"#ffffff",fontFamily:"Manuka",borderRadius:24,buttonStyle:"pill",mood:"bold",cat:"media"},
  {name:"together",primaryColor:"#000000",canvasColor:"#ffffff",textColor:"#000000",fontFamily:"The Future",borderRadius:100,buttonStyle:"pill",mood:"dark",cat:"ai"},
  {name:"uber",primaryColor:"#000000",canvasColor:"#ffffff",textColor:"#000000",fontFamily:"UberMove",borderRadius:999,buttonStyle:"pill",mood:"minimal",cat:"media"},
  {name:"vercel",primaryColor:"#171717",canvasColor:"#ffffff",textColor:"#171717",fontFamily:"Geist",borderRadius:100,buttonStyle:"pill",mood:"minimal",cat:"dev"},
  {name:"vodafone",primaryColor:"#e60000",canvasColor:"#ffffff",textColor:"#25282b",fontFamily:"Vodafone",borderRadius:100,buttonStyle:"pill",mood:"bold",cat:"enterprise"},
  {name:"voltagent",primaryColor:"#00d992",canvasColor:"#101010",textColor:"#f2f2f2",fontFamily:"Inter",borderRadius:8,buttonStyle:"rounded",mood:"dark",cat:"dev"},
  {name:"warp",primaryColor:"#f7f5f0",canvasColor:"#2b2622",textColor:"#f7f5f0",fontFamily:"Inter",borderRadius:8,buttonStyle:"rounded",mood:"dark",cat:"dev"},
  {name:"webflow",primaryColor:"#080808",canvasColor:"#ffffff",textColor:"#080808",fontFamily:"WF Visual Sans",borderRadius:8,buttonStyle:"rounded",mood:"minimal",cat:"design"},
  {name:"wired",primaryColor:"#000000",canvasColor:"#ffffff",textColor:"#000000",fontFamily:"WiredDisplay",borderRadius:4,buttonStyle:"sharp",mood:"editorial",cat:"media"},
  {name:"wise",primaryColor:"#9fe870",canvasColor:"#ffffff",textColor:"#0e0f0c",fontFamily:"Wise Sans",borderRadius:100,buttonStyle:"pill",mood:"playful",cat:"fintech"},
  {name:"xai",primaryColor:"#ffffff",canvasColor:"#0a0a0a",textColor:"#ffffff",fontFamily:"Universal Sans",borderRadius:100,buttonStyle:"pill",mood:"dark",cat:"ai"},
  {name:"zapier",primaryColor:"#ff4f00",canvasColor:"#fffefb",textColor:"#201515",fontFamily:"Degular Display",borderRadius:100,buttonStyle:"pill",mood:"warm",cat:"productivity"}
];

let currentFilter = { type: "cat", value: "all" };
let currentModalName = null;

function getContrastColor(hex) {
  if (!hex || hex.length < 7) return "#000000";
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return (r*0.299 + g*0.587 + b*0.114) > 150 ? "#000000" : "#ffffff";
}

function getBtnBg(t) {
  if (t.buttonStyle === "pill" && t.canvasColor === "#000000") return t.primaryColor === "#ffffff" ? "#ffffff" : t.primaryColor;
  if (t.mood === "dark") return t.primaryColor;
  return t.primaryColor;
}

function getBtnText(t) {
  return getContrastColor(getBtnBg(t));
}

function getBtnBorder(t) {
  if (t.mood === "dark" && t.primaryColor === "#ffffff") return t.primaryColor;
  return "none";
}

function isDark(hex) {
  if (!hex || hex.length < 7) return false;
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return (r*0.299 + g*0.587 + b*0.114) < 80;
}

function renderCard(t) {
  const btnBg = getBtnBg(t);
  const btnText = getBtnText(t);
  const btnBorder = getBtnBorder(t);
  const br = Math.min(t.borderRadius, 999);
  const canvasIsDark = isDark(t.canvasColor);
  const linkColor = t.accentColor || (canvasIsDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)");

  return \`
    <div class="card" onclick="openModal('\${t.name}')">
      <div class="card-preview" style="background:\${t.canvasColor}; color:\${t.textColor};">
        <div>
          <div class="pv-hero" style="font-family:'\${t.fontFamily}',sans-serif; color:\${t.textColor};">
            Build faster.
          </div>
          <div class="pv-desc" style="color:\${t.textColor};">
            Ship products your customers love with our platform.
          </div>
        </div>
        <div>
          <div class="pv-actions">
            <button class="pv-btn" style="background:\${btnBg}; color:\${btnText}; border-radius:\${br}px; border:\${btnBorder};">
              Get Started
            </button>
            <span style="font-size:12px; color:\${linkColor}; text-decoration:underline; cursor:default;">Learn more →</span>
          </div>
        </div>
        <div class="pv-swatches">
          <div class="pv-swatch" style="background:\${t.primaryColor};"></div>
          <div class="pv-swatch" style="background:\${t.canvasColor};"></div>
          <div class="pv-swatch" style="background:\${t.textColor};"></div>
        </div>
      </div>
      <div class="card-info" style="background:\${canvasIsDark ? 'var(--surface)' : 'var(--surface)'};">
        <span class="card-name">\${t.name}</span>
        <div class="card-meta">
          <span class="tag">\${t.mood}</span>
          <span class="tag">\${t.buttonStyle}</span>
        </div>
      </div>
    </div>
  \`;
}

function renderGrid(templatesToShow) {
  const grid = document.getElementById("grid");
  grid.innerHTML = templatesToShow.map(renderCard).join("");
  document.getElementById("resultCount").textContent = templatesToShow.length + " templates";
}

function filterTemplates() {
  const search = document.getElementById("searchBox").value.toLowerCase();
  let filtered = templates;

  if (currentFilter.type === "cat" && currentFilter.value !== "all") {
    filtered = filtered.filter(t => t.cat === currentFilter.value);
  } else if (currentFilter.type === "mood") {
    filtered = filtered.filter(t => t.mood === currentFilter.value);
  } else if (currentFilter.type === "btn") {
    filtered = filtered.filter(t => t.buttonStyle === currentFilter.value);
  }

  if (search) {
    filtered = filtered.filter(t =>
      t.name.toLowerCase().includes(search) ||
      t.cat.toLowerCase().includes(search) ||
      t.mood.toLowerCase().includes(search)
    );
  }

  renderGrid(filtered);
}

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    if (btn.dataset.filter !== undefined) {
      currentFilter = { type: "cat", value: btn.dataset.filter };
      document.getElementById("gridTitle").textContent = btn.dataset.filter === "all" ? "All Templates" : btn.textContent.trim().split(/\\d/)[0].trim();
    } else if (btn.dataset.mood !== undefined) {
      currentFilter = { type: "mood", value: btn.dataset.mood };
      document.getElementById("gridTitle").textContent = btn.dataset.mood.charAt(0).toUpperCase() + btn.dataset.mood.slice(1) + " Mood";
    } else if (btn.dataset.btn !== undefined) {
      currentFilter = { type: "btn", value: btn.dataset.btn };
      document.getElementById("gridTitle").textContent = btn.dataset.btn.charAt(0).toUpperCase() + btn.dataset.btn.slice(1) + " Buttons";
    }

    filterTemplates();
  });
});

document.getElementById("searchBox").addEventListener("input", filterTemplates);

// Copy button
document.getElementById("copyBtn").addEventListener("click", async function() {
  if (!currentModalName) return;

  const content = designContents[currentModalName];
  if (!content) {
    alert("Content not found for: " + currentModalName);
    return;
  }

  try {
    await navigator.clipboard.writeText(content);
    showCopied(this);
  } catch (err) {
    // Fallback
    const textarea = document.createElement("textarea");
    textarea.value = content;
    textarea.style.cssText = "position:fixed;left:-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    showCopied(this);
  }
});

function showCopied(btn) {
  const original = btn.innerHTML;
  btn.classList.add("copied");
  btn.innerHTML = \`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    Copied!
  \`;
  setTimeout(() => {
    btn.classList.remove("copied");
    btn.innerHTML = original;
  }, 2000);
}

// Modal
function openModal(name) {
  currentModalName = name;
  const t = templates.find(x => x.name === name);
  if (!t) return;

  const btnBg = getBtnBg(t);
  const btnText = getBtnText(t);
  const br = Math.min(t.borderRadius, 999);
  const canvasIsDark = isDark(t.canvasColor);
  const cardBg = canvasIsDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const linkColor = t.accentColor || (canvasIsDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)");

  document.getElementById("modal").style.background = t.canvasColor;
  document.getElementById("modal").style.color = t.textColor;

  document.getElementById("modalContent").innerHTML = \`
    <nav class="modal-nav" style="border-color:\${canvasIsDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'};">
      <span class="modal-nav-logo" style="font-family:'\${t.fontFamily}',sans-serif;">\${t.name}</span>
      <div class="modal-nav-links" style="color:\${t.textColor};">
        <span>Product</span>
        <span>Pricing</span>
        <span>Docs</span>
        <span>Blog</span>
      </div>
    </nav>

    <div class="modal-hero" style="font-family:'\${t.fontFamily}',sans-serif; color:\${t.textColor};">
      Build something<br>remarkable.
    </div>
    <div class="modal-sub" style="color:\${t.textColor};">
      The modern platform for teams who ship. Design, develop, and deploy — all in one place. Trusted by thousands of companies worldwide.
    </div>
    <div class="modal-actions">
      <button class="modal-btn" style="background:\${btnBg}; color:\${btnText}; border-radius:\${br}px;">
        Start building
      </button>
      <button class="modal-btn modal-btn-outline" style="border-color:\${canvasIsDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}; color:\${t.textColor}; border-radius:\${br}px;">
        View demo
      </button>
    </div>

    <div class="modal-section-title" style="color:\${t.textColor};">Color Palette</div>
    <div class="modal-colors">
      <div class="modal-color">
        <div class="modal-color-circle" style="background:\${t.primaryColor};"></div>
        <span class="modal-color-hex" style="color:\${t.textColor};">\${t.primaryColor}</span>
        <span style="font-size:10px; opacity:0.4; color:\${t.textColor};">Primary</span>
      </div>
      <div class="modal-color">
        <div class="modal-color-circle" style="background:\${t.canvasColor};"></div>
        <span class="modal-color-hex" style="color:\${t.textColor};">\${t.canvasColor}</span>
        <span style="font-size:10px; opacity:0.4; color:\${t.textColor};">Canvas</span>
      </div>
      <div class="modal-color">
        <div class="modal-color-circle" style="background:\${t.textColor};"></div>
        <span class="modal-color-hex" style="color:\${t.textColor};">\${t.textColor}</span>
        <span style="font-size:10px; opacity:0.4; color:\${t.textColor};">Text</span>
      </div>
      \${t.accentColor ? \`
      <div class="modal-color">
        <div class="modal-color-circle" style="background:\${t.accentColor};"></div>
        <span class="modal-color-hex" style="color:\${t.textColor};">\${t.accentColor}</span>
        <span style="font-size:10px; opacity:0.4; color:\${t.textColor};">Accent</span>
      </div>\` : ''}
    </div>

    <div class="modal-section-title" style="color:\${t.textColor};">Typography</div>
    <div class="modal-typography">
      <div class="modal-type-label" style="color:\${t.textColor};">Display — \${t.fontFamily}</div>
      <div class="modal-type-display" style="font-family:'\${t.fontFamily}',sans-serif; color:\${t.textColor};">
        The quick brown fox jumps over the lazy dog.
      </div>
      <div style="height:24px;"></div>
      <div class="modal-type-label" style="color:\${t.textColor};">Body</div>
      <div class="modal-type-body" style="color:\${t.textColor};">
        Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed. Good typography establishes a strong visual hierarchy.
      </div>
    </div>

    <div class="modal-section-title" style="color:\${t.textColor};">Buttons</div>
    <div class="modal-buttons">
      <button class="modal-btn" style="background:\${btnBg}; color:\${btnText}; border-radius:\${br}px; border:none;">
        Primary
      </button>
      <button class="modal-btn modal-btn-outline" style="border-color:\${canvasIsDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}; color:\${t.textColor}; border-radius:\${br}px;">
        Secondary
      </button>
      <span style="font-size:12px; opacity:0.4; color:\${t.textColor};">border-radius: \${t.borderRadius}px · \${t.buttonStyle}</span>
    </div>

    <div class="modal-section-title" style="color:\${t.textColor};">Cards</div>
    <div class="modal-cards">
      <div class="modal-card-item" style="background:\${cardBg}; border-radius:\${Math.min(br, 12)}px;">
        <h4 style="color:\${t.textColor};">Analytics</h4>
        <p style="color:\${t.textColor};">Real-time insights into your product performance and user behavior.</p>
      </div>
      <div class="modal-card-item" style="background:\${cardBg}; border-radius:\${Math.min(br, 12)}px;">
        <h4 style="color:\${t.textColor};">Integrations</h4>
        <p style="color:\${t.textColor};">Connect with 200+ tools your team already uses every day.</p>
      </div>
      <div class="modal-card-item" style="background:\${cardBg}; border-radius:\${Math.min(br, 12)}px;">
        <h4 style="color:\${t.textColor};">Security</h4>
        <p style="color:\${t.textColor};">Enterprise-grade security with SOC 2, GDPR, and HIPAA compliance.</p>
      </div>
    </div>
  \`;

  document.getElementById("modalOverlay").classList.add("open");
}

document.getElementById("modalClose").addEventListener("click", () => {
  document.getElementById("modalOverlay").classList.remove("open");
  currentModalName = null;
});

document.getElementById("modalOverlay").addEventListener("click", (e) => {
  if (e.target === document.getElementById("modalOverlay")) {
    document.getElementById("modalOverlay").classList.remove("open");
    currentModalName = null;
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.getElementById("modalOverlay").classList.remove("open");
    currentModalName = null;
  }
});

// Initial render
renderGrid(templates);
</script>
</body>
</html>`;

// Write the file
fs.writeFileSync(outputFile, html, 'utf-8');

console.log('Build complete!');
console.log(`Total DESIGN.md content: ${(JSON.stringify(designContents).length / 1024 / 1024).toFixed(2)} MB`);
console.log(`Output file: ${outputFile}`);
