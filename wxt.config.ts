import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-solid', '@wxt-dev/auto-icons'],
  manifest: {
    host_permissions: ['https://vrchat.com/*'],
    permissions: ['cookies', 'storage', 'offscreen'],
  }
});
