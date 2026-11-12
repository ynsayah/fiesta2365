// Adresse de l'API PHP (forum, contact), hébergée sur o2switch.
// - o2switch (site complet) : '/api' (même domaine).
// - Vercel (site statique) : 'https://api.fiesta365.org' (sous-domaine o2switch), ou la valeur de PUBLIC_API_BASE.
// PUBLIC_API_BASE a toujours priorité (variable d'environnement au moment du build).
const fromEnv = import.meta.env.PUBLIC_API_BASE;
const onVercel = typeof process !== 'undefined' && !!process.env.VERCEL;
export const API_BASE = String(fromEnv || (onVercel ? 'https://api.fiesta365.org' : '/api')).replace(/\/+$/, '');
// Le formulaire est actif si l'API est sur le même domaine fiesta365.org, ou si son adresse est absolue (cas Vercel).
export const API_LIVE_HOSTS = 'fiesta365\\.org$|\\.vercel\\.app$|localhost|127\\.0\\.0\\.1';
