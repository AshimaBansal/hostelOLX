import app from './app.js';
import env from './config/env.js';

const server = app.listen(env.port, () => {
  console.log(`HostelOLX API running on http://localhost:${env.port} (${env.nodeEnv})`);
});

// Close the server cleanly on Ctrl+C / when the host stops the app
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
