import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { ProxyAgent } from 'proxy-agent';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://178.105.90.5';
  const upstreamProxy =
    env.HTTPS_PROXY ||
    env.HTTP_PROXY ||
    process.env.HTTPS_PROXY ||
    process.env.HTTP_PROXY ||
    process.env.https_proxy ||
    process.env.http_proxy;
  const proxyAgent = upstreamProxy ? new ProxyAgent(upstreamProxy) : undefined;

  return {
    plugins: [react()],
    resolve: {
      alias: {
        i18n: path.resolve(__dirname, 'src/i18n.ts'),
        assets: path.resolve(__dirname, 'src/assets'),
        pages: path.resolve(__dirname, 'src/pages'),
        components: path.resolve(__dirname, 'src/components'),
        utils: path.resolve(__dirname, 'src/utils'),
        services: path.resolve(__dirname, 'src/services'),
        models: path.resolve(__dirname, 'src/models'),
        common: path.resolve(__dirname, 'src/common'),
        store: path.resolve(__dirname, 'src/store'),
        styles: path.resolve(__dirname, 'src/styles'),
        types: path.resolve(__dirname, 'src/types'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          agent: proxyAgent,
        },
      },
    },
    base: '/cost/', // a korábbi CRA homepage megfelelője
  };
});
