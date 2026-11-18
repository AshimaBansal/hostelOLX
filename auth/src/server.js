import app from './app.js';
import env from './env.js';
import authRoutes from './auth.routes.js';
const server = app.listen(env.PORT, () => {
  console.log(`HostelOLX Auth Service running on port ${env.PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
});

function shutdown(signal) {
  console.log(`${signal} received. Closing server...`);

  server.close(() => {
    console.log('Server closed successfully.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
