import EmbeddedPostgresPkg from 'embedded-postgres';
import net from 'net';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const EmbeddedPostgres = EmbeddedPostgresPkg.default || EmbeddedPostgresPkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.EMBEDDED_DB_PORT || '5432', 10);
const DATA_DIR = path.resolve(__dirname, '../../data/postgres');

function isPortOpen(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1500);

    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.on('error', () => {
      resolve(false);
    });

    socket.connect(port, host);
  });
}

export async function ensureDatabaseRunning() {
  const isOpen = await isPortOpen(PORT);
  if (isOpen) {
    console.log(`[DB] Existing PostgreSQL detected and running on port ${PORT}.`);
    return null;
  }

  console.log(`[DB] Initializing PostgreSQL cluster on port ${PORT}...`);
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const pg = new EmbeddedPostgres({
    databaseDir: DATA_DIR,
    user: 'postgres',
    password: 'password',
    port: PORT,
    persistent: true,
  });

  try {
    await pg.initialise();
  } catch (err) {
    // If cluster already initialized, proceed to start
  }

  await pg.start();
  console.log(`[DB] PostgreSQL 18 server successfully running on 127.0.0.1:${PORT}`);

  try {
    await pg.createDatabase('gcircle');
    console.log(`[DB] Database 'gcircle' created.`);
  } catch (err) {
    // Already exists
  }

  return pg;
}

// If executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  ensureDatabaseRunning()
    .then((pg) => {
      console.log(`[DB] Database ready. Press Ctrl+C to terminate.`);
      process.on('SIGINT', async () => {
        if (pg) {
          console.log(`[DB] Shutting down embedded PostgreSQL...`);
          await pg.stop();
        }
        process.exit(0);
      });
    })
    .catch((err) => {
      console.error('[DB] Failed to start PostgreSQL:', err);
      process.exit(1);
    });
}
