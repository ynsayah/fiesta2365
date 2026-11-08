import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://fiesta365.org',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
