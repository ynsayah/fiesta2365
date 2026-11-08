import { FETES } from '../../lib/data.js';
import { posterSVG } from '../../lib/poster.js';
export function getStaticPaths() { return FETES.map((f) => ({ params: { slug: f.slug }, props: { f } })); }
export function GET({ props }) {
  return new Response(posterSVG(props.f.slug, props.f.category, { title: props.f.name.fr }), { headers: { 'Content-Type': 'image/svg+xml' } });
}
