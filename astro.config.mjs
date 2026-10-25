import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://goroditskaya.vercel.app',
  trailingSlash: 'always',
  output: 'static',
  build: { inlineStylesheets: 'always' },
  devToolbar: { enabled: false },
});
