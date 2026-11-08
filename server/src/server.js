import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import app from './app.js';
import { ensureDatabaseRunning } from './scripts/start-db.js';

const PORT = parseInt(process.env.PORT || '5002', 10);

async function bootstrap() {
  try {
    // Check & start database if not already running
    await ensureDatabaseRunning();

    app.listen(PORT, '127.0.0.1', () => {
      console.log(`\n======================================================`);
      console.log(`🚀 G-CIRCLE Backend API Server Running`);
      console.log(`🌐 Base URL: http://localhost:${PORT}`);
      console.log(`🩺 Health:   http://localhost:${PORT}/api/health`);
      console.log(`🎓 Domain:   @galgotiasuniversity.ac.in`);
      console.log(`✨ Tagline:  Discover. Collaborate. Build.`);
      console.log(`======================================================\n`);
    });
  } catch (error) {
    console.error('[SERVER BOOTSTRAP ERROR]', error);
    process.exit(1);
  }
}

bootstrap();
