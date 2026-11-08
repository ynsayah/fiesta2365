// Affiche générée pour chaque fête : une rosace géométrique déterministe (inspirée des motifs
// textiles et des zelliges) dont la couleur dépend du type de fête. Sert de visuel quand
// aucune photo libre n'existe, et de fond sous la photo pendant son chargement.
export const CAT_COLORS = {
  lumieres: ['#F2B134', '#7A2E0E'], morts: ['#E8743B', '#3B1F4A'], religieuse: ['#E9D7A5', '#22336B'],
  patronale: ['#E0457B', '#2A2A72'], recolte: ['#C9B03A', '#1F4D3A'], ancestrale: ['#D9663C', '#2B2440'],
  nationale: ['#3BA7A0', '#1B2A55'], foire: ['#F08A4B', '#24364F'], nature: ['#8CC7A1', '#1A3B4A'],
};
function hash(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

export function posterSVG(slug, category, { w = 800, h = 600, title = '' } = {}) {
  const [fg, bg] = CAT_COLORS[category] || CAT_COLORS.ancestrale;
  const H = hash(slug);
  const n = 6 + (H % 7);            // symétrie 6 à 12
  const rings = 3 + ((H >> 4) % 3); // 3 à 5 couronnes
  const cx = w * (0.55 + ((H >> 8) % 30) / 100), cy = h * (0.45 + ((H >> 12) % 20) / 100);
  const R = Math.max(w, h) * 0.62;
  let shapes = '';
  for (let r = rings; r >= 1; r--) {
    const rad = (R * r) / rings, inner = rad * (0.42 + ((H >> (r + 3)) % 25) / 100);
    const k = n * (r % 2 ? 1 : 2), pts = [];
    for (let i = 0; i < k * 2; i++) {
      const a = (Math.PI * i) / k + (r % 2 ? 0 : Math.PI / k / 2);
      const rr = i % 2 ? inner : rad;
      pts.push((cx + rr * Math.cos(a)).toFixed(1) + ',' + (cy + rr * Math.sin(a)).toFixed(1));
    }
    const op = (0.16 + 0.17 * ((rings - r) / rings)).toFixed(2);
    shapes += `<polygon points="${pts.join(' ')}" fill="${r % 2 ? fg : 'none'}" fill-opacity="${op}" stroke="${fg}" stroke-opacity="0.55" stroke-width="1.4"/>`;
  }
  // petits points comme des broderies
  let dots = '';
  for (let i = 0; i < n * 3; i++) {
    const a = (2 * Math.PI * i) / (n * 3), rr = R * 0.18;
    dots += `<circle cx="${(cx + rr * Math.cos(a)).toFixed(1)}" cy="${(cy + rr * Math.sin(a)).toFixed(1)}" r="2.6" fill="${fg}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${title.replace(/"/g, '&quot;')}"><rect width="100%" height="100%" fill="${bg}"/>${shapes}${dots}<circle cx="${cx}" cy="${cy}" r="${(R * 0.07).toFixed(1)}" fill="${fg}"/></svg>`;
}
export function posterDataURI(slug, category, opts) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(posterSVG(slug, category, opts));
}
