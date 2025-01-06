import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-solid'],
  manifest: {
    host_permissions: ['https://vrchat.com/*'],
    permissions: ['cookies', 'storage'],
  }
});
