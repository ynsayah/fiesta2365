import { W, H, SPHERE, LAND, GRATICULE } from '../lib/map.js';
// Fond de carte partagé (mis en cache par le navigateur) : océan, graticule, terres.
export function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><path d="${SPHERE}" fill="#18224A"/><path d="${GRATICULE}" fill="none" stroke="#ffffff" stroke-opacity=".06" stroke-width=".6"/><path d="${LAND}" fill="#2B3A78" stroke="#3C4C92" stroke-width=".5"/></svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
}
