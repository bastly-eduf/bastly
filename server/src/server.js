import app from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';

async function startServer() {
  try {
    await connectDatabase();

    const server = app.listen(env.port, () => {
      console.log(`Bastly API running on port ${env.port}`);
    });

    const shutdown = (signal) => {
      console.log(`${signal} received. Closing server...`);

      server.close(() => {
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start Bastly API:', error);
    process.exit(1);
  }
}

startServer();
