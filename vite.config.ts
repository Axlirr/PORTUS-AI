import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      {
        name: 'azure-openai-proxy',
        configureServer(server) {
          server.middlewares.use('/api/analyze', async (req, res, next) => {
            if (req.method !== 'POST') return next();
            try {
              let body = '';
              req.on('data', (chunk) => { body += chunk; });
              req.on('end', async () => {
                const parsed = body ? JSON.parse(body) : {};
                const messages = parsed.messages || [];
                const temperature = parsed.temperature ?? 0.1;

                const endpoint = env.AZURE_OPENAI_ENDPOINT;
                const deployment = env.AZURE_OPENAI_DEPLOYMENT;
                const apiVersion = env.AZURE_OPENAI_API_VERSION || '2024-08-01-preview';
                const apiKey = env.AZURE_OPENAI_PRIMARY_KEY || env.AZURE_OPENAI_SECONDARY_KEY;

                if (!endpoint || !deployment || !apiKey) {
                  console.error('[azure-openai-proxy] Missing envs', { endpoint, deployment, hasApiKey: Boolean(apiKey) });
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Azure OpenAI env vars missing (endpoint/deployment/key)' }));
                  return;
                }

                const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
                const forwardBody = {
                  model: deployment,
                  messages,
                  temperature,
                  response_format: { type: 'json_object' }
                };

                console.log('[azure-openai-proxy] POST', url);
                const resp = await fetch(url, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'api-key': apiKey,
                  },
                  body: JSON.stringify(forwardBody)
                });

                const text = await resp.text();
                if (!resp.ok) {
                  console.error('[azure-openai-proxy] Error', resp.status, text);
                } else {
                  console.log('[azure-openai-proxy] OK', resp.status);
                }
                res.statusCode = resp.status;
                res.setHeader('Content-Type', 'application/json');
                res.end(text);
              });
            } catch (err) {
              console.error('[azure-openai-proxy] Exception', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Proxy error', details: String(err) }));
            }
          });
        }
      }
    ],
    define: {
      'process.env.AZURE_OPENAI_ENDPOINT': JSON.stringify(env.AZURE_OPENAI_ENDPOINT),
      'process.env.AZURE_OPENAI_DEPLOYMENT': JSON.stringify(env.AZURE_OPENAI_DEPLOYMENT),
      'process.env.AZURE_OPENAI_API_VERSION': JSON.stringify(env.AZURE_OPENAI_API_VERSION),
      'process.env.AZURE_OPENAI_PRIMARY_KEY': JSON.stringify(env.AZURE_OPENAI_PRIMARY_KEY),
      'process.env.AZURE_OPENAI_SECONDARY_KEY': JSON.stringify(env.AZURE_OPENAI_SECONDARY_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
