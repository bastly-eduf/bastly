import mongoose from 'mongoose';

import app from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';

async function startServer() {
  try {
    await connectDatabase();

    const server = app.listen(
      env.port,
      '0.0.0.0',
      () => {
        console.log(
          `Bastly API running on port ${env.port}`,
        );
      },
    );

    let shuttingDown = false;

    const shutdown = async (signal) => {
      if (shuttingDown) return;
      shuttingDown = true;

      console.log(
        `${signal} received. Closing Bastly API...`,
      );

      const forceExit = setTimeout(() => {
        console.error(
          'Graceful shutdown timed out. Exiting.',
        );
        process.exit(1);
      }, 25000);

      forceExit.unref();

      server.close(async () => {
        try {
          await mongoose.connection.close(false);
          console.log(
            'HTTP server and MongoDB connection closed.',
          );
          process.exit(0);
        } catch (error) {
          console.error(
            'Shutdown error:',
            error.message,
          );
          process.exit(1);
        }
      });
    };

    process.on(
      'SIGTERM',
      () => shutdown('SIGTERM'),
    );
    process.on(
      'SIGINT',
      () => shutdown('SIGINT'),
    );
  } catch (error) {
    console.error(
      'Failed to start Bastly API:',
      error,
    );
    process.exit(1);
  }
}

startServer();
