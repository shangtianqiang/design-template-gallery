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

// Read the HTML template
let html = fs.readFileSync(outputFile, 'utf-8');

// Create the design data script
const dataScript = `
<script>
const designContents = ${JSON.stringify(designContents, null, 0)};
</script>
`;

// Add copy button styles
const copyStyles = `
  .copy-btn {
    position: absolute;
    top: 12px;
    right: 48px;
    z-index: 10;
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid rgba(128,128,128,0.3);
    background: rgba(128,128,128,0.2);
    color: inherit;
    font-size: 12px;
    cursor: pointer;
    backdrop-filter: blur(8px);
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
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
`;

// Add copy functionality
const copyScript = `
function copyDesignMd(name) {
  const content = designContents[name];
  if (!content) {
    alert('Design content not found for: ' + name);
    return;
  }

  navigator.clipboard.writeText(content).then(() => {
    const btn = document.querySelector('.copy-btn');
    const originalText = btn.innerHTML;
    btn.classList.add('copied');
    btn.innerHTML = \`
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      Copied!
    \`;

    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = originalText;
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = content;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);

    const btn = document.querySelector('.copy-btn');
    btn.classList.add('copied');
    const originalText = btn.innerHTML;
    btn.innerHTML = \`
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      Copied!
    \`;
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = originalText;
    }, 2000);
  });
}
`;

// Modify the openModal function to include the copy button
const modifiedOpenModal = `
function openModal(name) {
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

  // Add copy button
  const copyBtn = document.createElement('button');
  copyBtn.className = 'copy-btn';
  copyBtn.onclick = () => copyDesignMd(name);
  copyBtn.innerHTML = \`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
    Copy DESIGN.md
  \`;

  const modal = document.getElementById("modal");
  modal.insertBefore(copyBtn, modal.firstChild);

  document.getElementById("modalOverlay").classList.add("open");
}
`;

// Insert the styles
html = html.replace('</style>', copyStyles + '</style>');

// Insert the data script before the closing </body> tag
html = html.replace('</body>', dataScript + '</body>');

// Add the copy script and replace the openModal function
html = html.replace(
  /function openModal\(name\) \{[\s\S]*?document\.getElementById\("modalOverlay"\)\.classList\.add\("open"\);\s*\}/,
  modifiedOpenModal.trim()
);

// Write the updated HTML
fs.writeFileSync(outputFile, html, 'utf-8');

console.log('Build complete! preview-gallery.html has been updated with DESIGN.md content.');
console.log(`Total embedded content: ${(JSON.stringify(designContents).length / 1024 / 1024).toFixed(2)} MB`);
