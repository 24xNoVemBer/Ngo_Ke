import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { backup } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { readConfig } from './config.mjs';
import { openDatabase, migrate, importDataset, hasContent } from './database.mjs';
import { parseDataset } from '../../mobile/src/data/sourceState.ts';

let db;
try {
  const [command, ...args] = process.argv.slice(2);
  if (!['setup', 'migrate', 'seed', 'import'].includes(command)) {
    throw new Error('Usage: setup | migrate | seed | import <dataset.json> [--replace] [--reviewed]');
  }
  if (command !== 'import' && args.length !== 0) throw new Error('This command accepts no arguments');
  if (command === 'import') {
    const flags = args.slice(1);
    if (!args[0] || args[0].startsWith('--') ||
        flags.some((flag) => !['--replace', '--reviewed'].includes(flag)) ||
        new Set(flags).size !== flags.length) {
      throw new Error('Usage: import <dataset.json> [--replace] [--reviewed]');
    }
  }
  const config = readConfig();
  if (['seed', 'import'].includes(command) && !existsSync(config.dbPath)) {
    throw new Error('Database does not exist; run npm run setup first');
  }
  db = openDatabase(config.dbPath);
  if (command === 'setup' || command === 'migrate') {
    migrate(db);
    console.log('Migration complete');
  }
  if (command !== 'migrate') {
    const input = command === 'import' ? resolve(args[0]) : new URL('../../data/demo.json', import.meta.url);
    const value = JSON.parse(readFileSync(input, 'utf8'));
    if (!parseDataset(value, { mode: 'live' })) throw new Error('Invalid dataset: schema, evidence or references');
    const flags = new Set(args.slice(1));
    if (command === 'import' && value.kind === 'reviewed' && !flags.has('--reviewed')) {
      throw new Error('Reviewed data requires the --reviewed acknowledgement');
    }
    if (command === 'import' && value.kind !== 'reviewed' && flags.has('--reviewed')) {
      throw new Error('--reviewed is only valid for a reviewed dataset');
    }
    const replace = command === 'import' && flags.has('--replace');
    if (command === 'import' && hasContent(db) && !replace) {
      throw new Error('Database already has content; use --replace to back up before replacing');
    }
    if (replace && hasContent(db)) {
      const backupPath = config.dbPath + '.backup-' + Date.now() + '-' + randomUUID();
      await backup(db, backupPath);
      console.log('Backup created');
    }
    const changed = importDataset(db, value, { replace });
    console.log(changed ? 'Dataset imported: ' + value.kind : 'Dataset already exists; left unchanged');
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  db?.close();
}
