// Carte du monde vectorielle calculée au build (Natural Earth 1:110m via world-atlas, projection Equal Earth).
// Choix : pas de tuiles distantes → aucune requête vers un tiers (RGPD), fonctionne hors ligne, pèse ~60 Ko.
import { geoEqualEarth, geoPath, geoGraticule10 } from 'd3-geo';
import { feature } from 'topojson-client';
import world from 'world-atlas/land-110m.json' with { type: 'json' };

export const W = 1000, H = 520;
const projection = geoEqualEarth().fitExtent([[8, 8], [W - 8, H - 8]], { type: 'Sphere' });
const path = geoPath(projection).digits(1);
const land = feature(world, world.objects.land);

export const SPHERE = path({ type: 'Sphere' });
export const LAND = path(land);
export const GRATICULE = path(geoGraticule10());
export function project(lat, lng) { const [x, y] = projection([lng, lat]); return { x: +x.toFixed(1), y: +y.toFixed(1) }; }
