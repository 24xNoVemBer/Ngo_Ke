import { existsSync } from 'node:fs';
import { readConfig } from './config.mjs';
import { openDatabase, assertMigrated } from './database.mjs';
import { createApp } from './app.mjs';

let db;
try {
  const config = readConfig();
  if (!existsSync(config.dbPath)) throw new Error('Database does not exist; run npm run setup first');
  db = openDatabase(config.dbPath);
  assertMigrated(db);
  const server = createApp({ db, serveSimulatedData: config.serveSimulatedData });
  server.on('error', (error) => {
    console.error('Backend could not listen: ' + (error.code ?? 'SERVER_ERROR'));
    db.close();
    process.exitCode = 1;
  });
  server.listen(config.port, config.host, () => {
    console.log('Ngõ Kể API listening on ' + config.host + ':' + config.port);
  });
  let stopping = false;
  function stop() {
    if (stopping) return;
    stopping = true;
    server.close(() => db.close());
    server.closeIdleConnections();
  }
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
} catch (error) {
  db?.close();
  console.error('Backend could not start: ' + error.message);
  process.exitCode = 1;
}
