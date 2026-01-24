
 //API Server with Redis-based Rate Limiting
 //Run this to start the API server separately from the CLI
 

import 'dotenv/config';
import { app, setupRateLimiting } from './api/server';

const PORT = process.env.API_PORT || 3000;

async function startServer() {
  try {
    // Initialize Redis and rate limiting
    await setupRateLimiting();

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 API Server running on http://localhost:${PORT}`);
      console.log(`📊 Rate limiting enabled via Redis`);
    });
  } catch (error) {
    console.error('Failed to start API server:', error);
    process.exit(1);
  }
}

startServer();
