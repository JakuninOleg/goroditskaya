import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://goroditskaya.vercel.app',
  trailingSlash: 'always',
  output: 'static',
  devToolbar: { enabled: false },
});
