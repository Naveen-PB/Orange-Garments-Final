const fs = require('fs');
const path = require('path');

const publicProdDir = path.join(__dirname, '..', 'frontend', 'public', 'images', 'products');
const publicPlaceDir = path.join(__dirname, '..', 'frontend', 'public', 'images', 'placeholders');
const srcProdDir = path.join(__dirname, '..', 'frontend', 'src', 'assest', 'products', 'garments');

[publicProdDir, publicPlaceDir, srcProdDir].forEach(d => {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
  }
});

// SVG Generation Helpers
function createSvgContainer(content, bg1 = '#f8fafc', bg2 = '#e2e8f0', brand = 'Orange Garments') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg1}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="12" stdDeviation="14" flood-opacity="0.15"/>
    </filter>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <rect width="500" height="500" rx="24" fill="url(#bgGrad)"/>
  <!-- Subtly stylish border and brand watermark -->
  <rect x="12" y="12" width="476" height="476" rx="16" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.6"/>
  <g filter="url(#shadow)">
    ${content}
  </g>
  <text x="250" y="472" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" fill="#94a3b8" text-anchor="middle" letter-spacing="2">${brand.toUpperCase()}</text>
</svg>`;
}

// 1. Shirt SVG Generator
function generateShirtSvg(color, accent, isBack = false, pattern = 'solid', label = 'Shirt') {
  let patternDef = '';
  let patternFill = color;

  if (pattern === 'checkered') {
    patternDef = `<pattern id="p_${label.replace(/\s+/g, '')}" width="20" height="20" patternUnits="userSpaceOnUse">
      <rect width="20" height="20" fill="${color}"/>
      <rect width="10" height="10" fill="${accent}" opacity="0.3"/>
      <rect x="10" y="10" width="10" height="10" fill="${accent}" opacity="0.3"/>
    </pattern>`;
    patternFill = `url(#p_${label.replace(/\s+/g, '')})`;
  } else if (pattern === 'striped') {
    patternDef = `<pattern id="p_${label.replace(/\s+/g, '')}" width="16" height="16" patternUnits="userSpaceOnUse">
      <rect width="16" height="16" fill="${color}"/>
      <line x1="0" y1="0" x2="0" y2="16" stroke="${accent}" stroke-width="4" opacity="0.4"/>
    </pattern>`;
    patternFill = `url(#p_${label.replace(/\s+/g, '')})`;
  }

  const frontDetails = `
    <!-- Placket & Buttons -->
    <rect x="242" y="115" width="16" height="275" fill="${accent}" opacity="0.2"/>
    <line x1="250" y1="115" x2="250" y2="390" stroke="#00000022" stroke-width="1.5"/>
    <circle cx="250" cy="140" r="4" fill="#ffffff" stroke="#475569" stroke-width="1"/>
    <circle cx="250" cy="180" r="4" fill="#ffffff" stroke="#475569" stroke-width="1"/>
    <circle cx="250" cy="220" r="4" fill="#ffffff" stroke="#475569" stroke-width="1"/>
    <circle cx="250" cy="260" r="4" fill="#ffffff" stroke="#475569" stroke-width="1"/>
    <circle cx="250" cy="300" r="4" fill="#ffffff" stroke="#475569" stroke-width="1"/>
    <circle cx="250" cy="340" r="4" fill="#ffffff" stroke="#475569" stroke-width="1"/>
    <!-- Left Chest Pocket -->
    <path d="M 180 180 L 220 180 L 220 225 L 200 235 L 180 225 Z" fill="${patternFill}" stroke="#00000033" stroke-width="1.5"/>
    <!-- Collar -->
    <path d="M 215 110 L 250 145 L 285 110 L 265 95 L 235 95 Z" fill="${accent}" stroke="#00000033" stroke-width="1.5"/>
    <path d="M 215 110 L 250 135 L 235 95 Z" fill="#ffffff" opacity="0.2"/>
    <path d="M 285 110 L 250 135 L 265 95 Z" fill="#000000" opacity="0.1"/>
  `;

  const backDetails = `
    <!-- Back Yoke Seam -->
    <path d="M 160 145 Q 250 155 340 145" fill="none" stroke="#00000033" stroke-width="2"/>
    <!-- Center Back Pleat -->
    <line x1="250" y1="155" x2="250" y2="385" stroke="#00000022" stroke-width="1.5" stroke-dasharray="4,4"/>
    <!-- Back Collar -->
    <path d="M 220 100 Q 250 112 280 100 L 275 92 Q 250 100 225 92 Z" fill="${accent}" stroke="#00000033" stroke-width="1.5"/>
  `;

  const content = `
    ${patternDef}
    <!-- Main Body & Sleeves -->
    <g id="shirtBody">
      <!-- Body contour -->
      <path d="M 185 105 L 115 145 L 90 235 L 130 250 L 155 195 L 160 380 Q 250 405 340 380 L 345 195 L 370 250 L 410 235 L 385 145 L 315 105 Z" 
            fill="${patternFill}" stroke="#00000033" stroke-width="2"/>
      <!-- Sleeve Cuffs -->
      <path d="M 90 235 L 130 250 L 126 260 L 86 245 Z" fill="${accent}" stroke="#00000033" stroke-width="1.5"/>
      <path d="M 410 235 L 370 250 L 374 260 L 414 245 Z" fill="${accent}" stroke="#00000033" stroke-width="1.5"/>
      <!-- Inner Neck Arc -->
      <path d="M 215 105 Q 250 120 285 105" fill="none" stroke="#00000044" stroke-width="2"/>
    </g>
    ${isBack ? backDetails : frontDetails}
  `;

  return createSvgContainer(content, '#f8fafc', '#edf2f7', `${label} ${isBack ? '(Back)' : ''}`);
}

// 2. Pant SVG Generator
function generatePantSvg(color, accent, isBack = false, pattern = 'solid', label = 'Pants') {
  const frontDetails = `
    <!-- Fly and Waist Button -->
    <line x1="250" y1="120" x2="250" y2="190" stroke="#00000044" stroke-width="2"/>
    <path d="M 250 190 Q 262 195 262 170" fill="none" stroke="#00000033" stroke-width="1.5"/>
    <circle cx="250" cy="107" r="4.5" fill="#e2e8f0" stroke="#475569" stroke-width="1.5"/>
    <!-- Slash Pockets -->
    <path d="M 185 120 Q 215 140 210 170" fill="none" stroke="#00000044" stroke-width="2"/>
    <path d="M 315 120 Q 285 140 290 170" fill="none" stroke="#00000044" stroke-width="2"/>
  `;

  const backDetails = `
    <!-- Back Pockets -->
    <rect x="190" y="145" width="42" height="42" rx="4" fill="${accent}" opacity="0.25" stroke="#00000044" stroke-width="1.5"/>
    <rect x="268" y="145" width="42" height="42" rx="4" fill="${accent}" opacity="0.25" stroke="#00000044" stroke-width="1.5"/>
    <line x1="190" y1="155" x2="232" y2="155" stroke="#00000033" stroke-width="1"/>
    <line x1="268" y1="155" x2="310" y2="155" stroke="#00000033" stroke-width="1"/>
    <!-- Back Center Seam -->
    <line x1="250" y1="95" x2="250" y2="230" stroke="#00000033" stroke-width="2"/>
  `;

  const content = `
    <!-- Waistband -->
    <path d="M 175 95 L 325 95 L 325 120 L 175 120 Z" fill="${accent}" stroke="#00000033" stroke-width="2"/>
    <!-- Belt Loops -->
    <rect x="195" y="93" width="6" height="29" rx="2" fill="${color}" stroke="#00000033" stroke-width="1"/>
    <rect x="247" y="93" width="6" height="29" rx="2" fill="${color}" stroke="#00000033" stroke-width="1"/>
    <rect x="299" y="93" width="6" height="29" rx="2" fill="${color}" stroke="#00000033" stroke-width="1"/>
    <!-- Legs -->
    <path d="M 175 120 L 170 395 Q 170 410 205 410 L 225 410 L 250 230 L 275 410 L 295 410 Q 330 410 330 395 L 325 120 Z" 
          fill="${color}" stroke="#00000033" stroke-width="2"/>
    <!-- Creases / Seams -->
    <line x1="202" y1="210" x2="202" y2="395" stroke="#00000018" stroke-width="1.5"/>
    <line x1="298" y1="210" x2="298" y2="395" stroke="#00000018" stroke-width="1.5"/>
    <!-- Hem Stitches -->
    <line x1="172" y1="398" x2="223" y2="398" stroke="#00000033" stroke-width="1.5" stroke-dasharray="3,3"/>
    <line x1="277" y1="398" x2="328" y2="398" stroke="#00000033" stroke-width="1.5" stroke-dasharray="3,3"/>
    ${isBack ? backDetails : frontDetails}
  `;

  return createSvgContainer(content, '#f8fafc', '#edf2f7', `${label} ${isBack ? '(Back)' : ''}`);
}

// 3. T-Shirt SVG Generator
function generateTshirtSvg(color, accent, isBack = false, pattern = 'solid', label = 'T-Shirt', isPolo = false, isLongSleeve = false) {
  let patternDef = '';
  let patternFill = color;

  if (pattern === 'striped') {
    patternDef = `<pattern id="p_${label.replace(/\s+/g, '')}" width="20" height="20" patternUnits="userSpaceOnUse">
      <rect width="20" height="20" fill="${color}"/>
      <line x1="0" y1="10" x2="20" y2="10" stroke="${accent}" stroke-width="5" opacity="0.4"/>
    </pattern>`;
    patternFill = `url(#p_${label.replace(/\s+/g, '')})`;
  }

  const sleeveD = isLongSleeve
    ? `M 175 110 L 80 180 L 60 330 L 95 340 L 130 225 L 140 380 Q 250 395 360 380 L 370 225 L 405 340 L 440 330 L 420 180 L 325 110 Z`
    : `M 175 110 L 100 155 L 75 220 L 120 240 L 145 195 L 150 380 Q 250 395 350 380 L 355 195 L 380 240 L 425 220 L 400 155 L 325 110 Z`;

  const graphicEmblem = !isBack && pattern !== 'striped' ? `
    <!-- Graphic Print / Logo on Chest -->
    <circle cx="250" cy="220" r="32" fill="${accent}" opacity="0.25"/>
    <path d="M 235 220 L 250 205 L 265 220 L 250 235 Z" fill="${accent}" opacity="0.7"/>
    <text x="250" y="265" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="${accent}" opacity="0.8" text-anchor="middle" letter-spacing="1">AUTHENTIC</text>
  ` : '';

  const poloCollar = isPolo ? `
    <!-- Polo Collar and Placket -->
    <path d="M 215 105 L 250 140 L 285 105 L 270 95 L 230 95 Z" fill="${accent}" stroke="#00000033" stroke-width="1.5"/>
    <rect x="243" y="130" width="14" height="60" fill="${accent}" opacity="0.4"/>
    <circle cx="250" cy="148" r="3" fill="#ffffff"/>
    <circle cx="250" cy="170" r="3" fill="#ffffff"/>
  ` : `
    <!-- Crew Neck Ribbing -->
    <path d="M 210 100 Q 250 135 290 100" fill="none" stroke="${accent}" stroke-width="8"/>
    <path d="M 210 100 Q 250 135 290 100" fill="none" stroke="#00000033" stroke-width="1.5"/>
  `;

  const content = `
    ${patternDef}
    <!-- T-Shirt Body -->
    <path d="${sleeveD}" fill="${patternFill}" stroke="#00000033" stroke-width="2"/>
    ${isBack ? `
      <!-- Back Neck Arc -->
      <path d="M 210 100 Q 250 115 290 100" fill="none" stroke="${accent}" stroke-width="6"/>
    ` : (poloCollar + graphicEmblem)}
    <!-- Hem Stitches -->
    <path d="M 152 370 Q 250 385 348 370" fill="none" stroke="#00000022" stroke-width="1.5" stroke-dasharray="4,4"/>
  `;

  return createSvgContainer(content, '#f8fafc', '#edf2f7', `${label} ${isBack ? '(Back)' : ''}`);
}

// 4. Sweater SVG Generator
function generateSweaterSvg(color, accent, isBack = false, label = 'Sweater') {
  const content = `
    <!-- Knit Cable Texture Pattern -->
    <pattern id="knitPattern" width="16" height="24" patternUnits="userSpaceOnUse">
      <path d="M 4 0 Q 8 6 4 12 Q 0 18 4 24" fill="none" stroke="#ffffff" opacity="0.12" stroke-width="1.5"/>
      <path d="M 12 0 Q 16 6 12 12 Q 8 18 12 24" fill="none" stroke="#000000" opacity="0.08" stroke-width="1.5"/>
    </pattern>
    <!-- Sweater Silhouette -->
    <path d="M 180 110 L 90 175 L 70 330 L 110 340 L 140 230 L 145 375 Q 250 390 355 375 L 360 230 L 390 340 L 430 330 L 410 175 L 320 110 Z" 
          fill="${color}" stroke="#00000033" stroke-width="2"/>
    <!-- Knit Overlay -->
    <path d="M 180 110 L 90 175 L 70 330 L 110 340 L 140 230 L 145 375 Q 250 390 355 375 L 360 230 L 390 340 L 430 330 L 410 175 L 320 110 Z" 
          fill="url(#knitPattern)"/>
    <!-- Thick Ribbed Collar -->
    <path d="M 210 102 Q 250 135 290 102 L 285 92 Q 250 112 215 92 Z" fill="${accent}" stroke="#00000033" stroke-width="2"/>
    <!-- Ribbed Cuffs -->
    <rect x="70" y="322" width="40" height="18" rx="2" transform="rotate(15 90 330)" fill="${accent}" stroke="#00000033" stroke-width="1.5"/>
    <rect x="390" y="322" width="40" height="18" rx="2" transform="rotate(-15 410 330)" fill="${accent}" stroke="#00000033" stroke-width="1.5"/>
    <!-- Ribbed Waistband -->
    <path d="M 145 365 Q 250 380 355 365 L 355 385 Q 250 400 145 385 Z" fill="${accent}" stroke="#00000033" stroke-width="2"/>
  `;

  return createSvgContainer(content, '#f8fafc', '#edf2f7', `${label} ${isBack ? '(Back)' : ''}`);
}

// 5. Hoodie SVG Generator
function generateHoodieSvg(color, accent, isBack = false, hasZip = false, label = 'Hoodie') {
  const frontDetails = `
    <!-- Kangaroo Pocket or Zip -->
    ${hasZip ? `
      <line x1="250" y1="130" x2="250" y2="385" stroke="#94a3b8" stroke-width="3"/>
      <!-- Split Pockets -->
      <path d="M 180 345 L 240 345 L 240 270 L 195 295 Z" fill="${accent}" opacity="0.3" stroke="#00000033" stroke-width="1.5"/>
      <path d="M 320 345 L 260 345 L 260 270 L 305 295 Z" fill="${accent}" opacity="0.3" stroke="#00000033" stroke-width="1.5"/>
    ` : `
      <!-- Classic Kangaroo Pocket -->
      <path d="M 180 350 L 320 350 L 305 270 L 195 270 Z" fill="${accent}" opacity="0.25" stroke="#00000033" stroke-width="1.5"/>
      <!-- Pocket Entry Curve -->
      <path d="M 195 270 Q 210 310 180 350" fill="none" stroke="#00000033" stroke-width="2"/>
      <path d="M 305 270 Q 290 310 320 350" fill="none" stroke="#00000033" stroke-width="2"/>
    `}
    <!-- Drawstrings -->
    <path d="M 235 130 Q 230 170 232 205" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
    <circle cx="232" cy="207" r="2.5" fill="#475569"/>
    <path d="M 265 130 Q 270 170 268 205" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
    <circle cx="268" cy="207" r="2.5" fill="#475569"/>
    <!-- Hood Overlap -->
    <path d="M 215 110 Q 250 140 285 110" fill="none" stroke="#00000033" stroke-width="2"/>
  `;

  const backDetails = `
    <!-- Hanging Hood on Back -->
    <path d="M 200 95 Q 250 180 300 95 Q 250 80 200 95 Z" fill="${accent}" stroke="#00000044" stroke-width="2"/>
    <path d="M 220 100 Q 250 160 280 100" fill="none" stroke="#00000022" stroke-width="1.5"/>
  `;

  const content = `
    <!-- Hood Outline -->
    <path d="M 195 105 Q 250 45 305 105 Z" fill="${accent}" stroke="#00000033" stroke-width="2"/>
    <!-- Hoodie Body -->
    <path d="M 180 110 L 85 170 L 65 330 L 105 340 L 138 230 L 140 375 Q 250 395 360 375 L 362 230 L 395 340 L 435 330 L 415 170 L 320 110 Z" 
          fill="${color}" stroke="#00000033" stroke-width="2"/>
    <!-- Ribbed Cuffs -->
    <rect x="65" y="322" width="40" height="20" rx="3" transform="rotate(15 85 330)" fill="${accent}" stroke="#00000033" stroke-width="1.5"/>
    <rect x="395" y="322" width="40" height="20" rx="3" transform="rotate(-15 415 330)" fill="${accent}" stroke="#00000033" stroke-width="1.5"/>
    <!-- Ribbed Waistband -->
    <path d="M 140 365 Q 250 385 360 365 L 360 388 Q 250 408 140 388 Z" fill="${accent}" stroke="#00000033" stroke-width="2"/>
    ${isBack ? backDetails : frontDetails}
  `;

  return createSvgContainer(content, '#f8fafc', '#edf2f7', `${label} ${isBack ? '(Back)' : ''}`);
}

// 6. Jacket SVG Generator
function generateJacketSvg(color, accent, isBack = false, type = 'bomber', label = 'Jacket') {
  const frontDetails = `
    <!-- Center Zip -->
    <line x1="250" y1="110" x2="250" y2="385" stroke="#94a3b8" stroke-width="3"/>
    <!-- Pockets -->
    <path d="M 175 280 L 220 280 L 220 330 L 175 330 Z" fill="${accent}" opacity="0.3" stroke="#00000044" stroke-width="1.5"/>
    <path d="M 280 280 L 325 280 L 325 330 L 280 330 Z" fill="${accent}" opacity="0.3" stroke="#00000044" stroke-width="1.5"/>
    <!-- Slanted Chest Pocket -->
    <line x1="180" y1="180" x2="215" y2="195" stroke="#00000044" stroke-width="2"/>
    <!-- Collar / Lapels -->
    <path d="M 205 105 L 250 145 L 225 180 L 195 125 Z" fill="${accent}" stroke="#00000033" stroke-width="1.5"/>
    <path d="M 295 105 L 250 145 L 275 180 L 305 125 Z" fill="${accent}" stroke="#00000033" stroke-width="1.5"/>
  `;

  const backDetails = `
    <!-- Back Yoke and Seams -->
    <path d="M 155 160 Q 250 175 345 160" fill="none" stroke="#00000044" stroke-width="2"/>
    <line x1="250" y1="172" x2="250" y2="380" stroke="#00000033" stroke-width="2"/>
  `;

  const content = `
    <!-- Jacket Body -->
    <path d="M 185 105 L 90 160 L 65 325 L 105 338 L 138 230 L 140 375 Q 250 395 360 375 L 362 230 L 395 338 L 435 325 L 410 160 L 315 105 Z" 
          fill="${color}" stroke="#00000044" stroke-width="2.5"/>
    ${isBack ? backDetails : frontDetails}
  `;

  return createSvgContainer(content, '#f8fafc', '#edf2f7', `${label} ${isBack ? '(Back)' : ''}`);
}

// 7. General Placeholder Generator
function generatePlaceholder(category, title, iconPath, primaryColor = '#ea580c') {
  const content = `
    <g transform="translate(100, 100)">
      <rect width="300" height="300" rx="20" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
      <circle cx="150" cy="120" r="60" fill="${primaryColor}15"/>
      <g transform="translate(110, 80) scale(1.6)">
        ${iconPath}
      </g>
      <text x="150" y="215" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" fill="#1e293b" text-anchor="middle">${title}</text>
      <text x="150" y="240" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="500" fill="#64748b" text-anchor="middle">Orange Garments Collection</text>
      <rect x="95" y="258" width="110" height="24" rx="12" fill="${primaryColor}20"/>
      <text x="150" y="274" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="${primaryColor}" text-anchor="middle">PREMIUM QUALITY</text>
    </g>
  `;
  return createSvgContainer(content, '#fff7ed', '#ffedd5', `Orange Garments • ${category}`);
}

// Write files to both public and src directories
function writeSvg(filename, svgString) {
  const pubPath = path.join(publicProdDir, filename);
  fs.writeFileSync(pubPath, svgString, 'utf-8');

  const srcPath = path.join(srcProdDir, filename);
  fs.writeFileSync(srcPath, svgString, 'utf-8');
}

function writePlaceholder(filename, svgString) {
  const pubPath = path.join(publicPlaceDir, filename);
  fs.writeFileSync(pubPath, svgString, 'utf-8');
}

console.log('Generating Garment Product Images...');

// 1. Shirts (1 to 10)
const shirts = [
  { color: '#38bdf8', accent: '#0284c7', pattern: 'solid', name: 'Classic Cotton Shirt' },
  { color: '#1e3a8a', accent: '#dc2626', pattern: 'checkered', name: 'Slim Fit Checkered Shirt' },
  { color: '#d6c7b2', accent: '#b09f87', pattern: 'solid', name: 'Linen Blend Casual Shirt' },
  { color: '#2563eb', accent: '#1d4ed8', pattern: 'solid', name: 'Denim Button-Down Shirt' },
  { color: '#059669', accent: '#10b981', pattern: 'striped', name: 'Printed Tropical Shirt' },
  { color: '#f8fafc', accent: '#cbd5e1', pattern: 'solid', name: 'Oxford White Shirt' },
  { color: '#991b1b', accent: '#18181b', pattern: 'checkered', name: 'Flannel Checked Shirt' },
  { color: '#a7f3d0', accent: '#34d399', pattern: 'solid', name: 'Mandarin Collar Shirt' },
  { color: '#334155', accent: '#f59e0b', pattern: 'striped', name: 'Graphic Printed Shirt' },
  { color: '#60a5fa', accent: '#ffffff', pattern: 'striped', name: 'Striped Business Shirt' },
];

shirts.forEach((s, i) => {
  const id = i + 1;
  writeSvg(`shirt-${id}.svg`, generateShirtSvg(s.color, s.accent, false, s.pattern, s.name));
  writeSvg(`shirt-${id}-back.svg`, generateShirtSvg(s.color, s.accent, true, s.pattern, s.name));
});

// 2. Pants (1 to 9)
const pants = [
  { color: '#d4b896', accent: '#bfa07c', name: 'Slim Fit Chinos' },
  { color: '#2563eb', accent: '#1d4ed8', name: 'Regular Fit Jeans' },
  { color: '#4d5b44', accent: '#3d4836', name: 'Relaxed Fit Cargo Pants' },
  { color: '#475569', accent: '#334155', name: 'Tapered Stretch Trousers' },
  { color: '#18181b', accent: '#27272a', name: 'Tailored Fit Dress Pants' },
  { color: '#94a3b8', accent: '#64748b', name: 'Jogger Pants' },
  { color: '#b5a382', accent: '#998767', name: 'Cargo Joggers' },
  { color: '#e2e8f0', accent: '#cbd5e1', name: 'Linen Blend Pants' },
  { color: '#1e3a8a', accent: '#172554', name: 'Stretch Skinny Jeans' },
];

pants.forEach((p, i) => {
  const id = i + 1;
  writeSvg(`pant-${id}.svg`, generatePantSvg(p.color, p.accent, false, 'solid', p.name));
  writeSvg(`pant-${id}-back.svg`, generatePantSvg(p.color, p.accent, true, 'solid', p.name));
});

// 3. T-Shirts (1 to 10)
const tshirts = [
  { color: '#ea580c', accent: '#f97316', pattern: 'solid', isPolo: false, isLong: false, name: 'Graphic Tee' },
  { color: '#f8fafc', accent: '#94a3b8', pattern: 'solid', isPolo: false, isLong: false, name: 'Basic Crew Neck T-Shirt' },
  { color: '#1e293b', accent: '#3b82f6', pattern: 'solid', isPolo: false, isLong: false, name: 'V-Neck T-Shirt' },
  { color: '#0284c7', accent: '#ffffff', pattern: 'striped', isPolo: false, isLong: false, name: 'Striped T-Shirt' },
  { color: '#18181b', accent: '#ef4444', pattern: 'solid', isPolo: false, isLong: false, name: 'Round Neck Cotton T-Shirt' },
  { color: '#2563eb', accent: '#1d4ed8', pattern: 'solid', isPolo: true, isLong: false, name: 'Polo T-Shirt' },
  { color: '#15803d', accent: '#86efac', pattern: 'solid', isPolo: false, isLong: false, name: 'Printed T-Shirt' },
  { color: '#64748b', accent: '#475569', pattern: 'solid', isPolo: false, isLong: true, name: 'Long Sleeve T-Shirt' },
  { color: '#334155', accent: '#06b6d4', pattern: 'solid', isPolo: false, isLong: false, name: 'Sleeveless T-Shirt' },
  { color: '#d97706', accent: '#fbbf24', pattern: 'solid', isPolo: false, isLong: false, name: 'Cotton Blend T-Shirt' },
];

tshirts.forEach((t, i) => {
  const id = i + 1;
  writeSvg(`tshirt-${id}.svg`, generateTshirtSvg(t.color, t.accent, false, t.pattern, t.name, t.isPolo, t.isLong));
  writeSvg(`tshirt-${id}-back.svg`, generateTshirtSvg(t.color, t.accent, true, t.pattern, t.name, t.isPolo, t.isLong));
});

// 4. Sweaters (1 to 5)
const sweaters = [
  { color: '#c29b68', accent: '#a17c4a', name: 'Chunky Knit Sweater' },
  { color: '#e8dec8', accent: '#d6c8ad', name: 'Cable Knit Sweater' },
  { color: '#65a30d', accent: '#4d7c0f', name: 'Lightweight Pullover' },
  { color: '#475569', accent: '#334155', name: 'Hooded Sweater' },
  { color: '#881337', accent: '#9f1239', name: 'Fleece Pullover' },
];

sweaters.forEach((sw, i) => {
  const id = i + 1;
  writeSvg(`sweater-${id}.svg`, generateSweaterSvg(sw.color, sw.accent, false, sw.name));
  writeSvg(`sweater-${id}-back.svg`, generateSweaterSvg(sw.color, sw.accent, true, sw.name));
});

// 5. Hoodies (1 to 5)
const hoodies = [
  { color: '#64748b', accent: '#475569', hasZip: false, name: 'Classic Hoodie' },
  { color: '#18181b', accent: '#ea580c', hasZip: false, name: 'Graphic Print Hoodie' },
  { color: '#2563eb', accent: '#1d4ed8', hasZip: true, name: 'Zipper Hoodie' },
  { color: '#166534', accent: '#14532d', hasZip: false, name: 'Fleece Lined Hoodie' },
  { color: '#ea580c', accent: '#c2410c', hasZip: false, name: 'Athletic Hoodie' },
];

hoodies.forEach((h, i) => {
  const id = i + 1;
  writeSvg(`hoodie-${id}.svg`, generateHoodieSvg(h.color, h.accent, false, h.hasZip, h.name));
  writeSvg(`hoodie-${id}-back.svg`, generateHoodieSvg(h.color, h.accent, true, h.hasZip, h.name));
});

// 6. Jackets (1 to 5)
const jackets = [
  { color: '#1d4ed8', accent: '#1e40af', type: 'denim', name: 'Denim Jacket' },
  { color: '#1c1917', accent: '#292524', type: 'leather', name: 'Leather Jacket' },
  { color: '#0f172a', accent: '#1e293b', type: 'puffer', name: 'Puffer Jacket' },
  { color: '#3f6212', accent: '#365314', type: 'bomber', name: 'Bomber Jacket' },
  { color: '#b91c1c', accent: '#1e3a8a', type: 'windbreaker', name: 'Windbreaker Jacket' },
];

jackets.forEach((j, i) => {
  const id = i + 1;
  writeSvg(`jacket-${id}.svg`, generateJacketSvg(j.color, j.accent, false, j.type, j.name));
  writeSvg(`jacket-${id}-back.svg`, generateJacketSvg(j.color, j.accent, true, j.type, j.name));
});

// Placeholders
const shirtIcon = `<path d="M 12 5 L 7 8 L 5 14 L 8 15 L 9 12 L 10 24 L 20 24 L 21 12 L 22 15 L 25 14 L 23 8 L 18 5 Z" fill="#ea580c"/>`;
const pantIcon = `<path d="M 9 5 L 21 5 L 20 24 L 16 24 L 15 13 L 14 24 L 10 24 Z" fill="#2563eb"/>`;
const tshirtIcon = `<path d="M 11 5 Q 15 8 19 5 L 25 9 L 23 13 L 20 12 L 20 24 L 10 24 L 10 12 L 7 13 L 5 9 Z" fill="#16a34a"/>`;
const sweaterIcon = `<path d="M 10 6 Q 15 8 20 6 L 26 10 L 24 19 L 21 17 L 21 24 L 9 24 L 9 17 L 6 19 L 4 10 Z" fill="#d97706"/>`;
const hoodieIcon = `<path d="M 12 4 Q 15 2 18 4 L 25 9 L 23 14 L 21 13 L 21 24 L 9 24 L 9 13 L 7 14 L 5 9 Z" fill="#7c3aed"/>`;
const jacketIcon = `<path d="M 11 4 L 19 4 L 26 9 L 23 15 L 21 13 L 21 24 L 9 24 L 9 13 L 7 15 L 4 9 Z" fill="#0284c7"/>`;
const generalIcon = `<path d="M 12 5 L 18 5 L 24 9 L 22 14 L 20 13 L 20 24 L 10 24 L 10 13 L 8 14 L 6 9 Z" fill="#ea580c"/>`;

writePlaceholder('placeholder-garment.svg', generatePlaceholder('Garments', 'Orange Garments', generalIcon, '#ea580c'));
writePlaceholder('placeholder-shirt.svg', generatePlaceholder('Shirts', 'Premium Shirts', shirtIcon, '#ea580c'));
writePlaceholder('placeholder-pant.svg', generatePlaceholder('Pants', 'Stylish Pants', pantIcon, '#2563eb'));
writePlaceholder('placeholder-tshirt.svg', generatePlaceholder('T-Shirts', 'Trendy T-Shirts', tshirtIcon, '#16a34a'));
writePlaceholder('placeholder-sweater.svg', generatePlaceholder('Sweaters', 'Warm Sweaters', sweaterIcon, '#d97706'));
writePlaceholder('placeholder-hoodie.svg', generatePlaceholder('Hoodies', 'Comfort Hoodies', hoodieIcon, '#7c3aed'));
writePlaceholder('placeholder-jacket.svg', generatePlaceholder('Jackets', 'Modern Jackets', jacketIcon, '#0284c7'));

console.log('Successfully generated all garment images and placeholders!');
