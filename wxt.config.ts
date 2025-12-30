import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Color Picker - 拾色器',
    description: '强大的网页拾色工具，支持多种颜色格式、历史记录和收藏功能',
    permissions: ['storage', 'activeTab', 'clipboardWrite'],
    commands: {
      'start-picker': {
        suggested_key: {
          default: 'Ctrl+Shift+C',
          mac: 'Command+Shift+C',
        },
        description: '启动拾色器',
      },
    },
  },
});
