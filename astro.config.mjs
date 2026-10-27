import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://gorodickaya.ru',
  trailingSlash: 'always',
  output: 'static',
  build: { inlineStylesheets: 'always' },
  devToolbar: { enabled: false },
});
