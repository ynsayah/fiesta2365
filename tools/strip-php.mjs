// Build Vercel : retire ce qui ne sert qu'à o2switch (API PHP, .htaccess Apache).
// Sur Vercel, le forum et le contact appellent l'API PHP d'o2switch (https://api.fiesta365.org, voir src/lib/api.js).
import { rmSync, existsSync } from 'node:fs';
for (const p of ['dist/api', 'dist/.htaccess']) if (existsSync(p)) { rmSync(p, { recursive: true, force: true }); console.log(`retiré : ${p}`); }
