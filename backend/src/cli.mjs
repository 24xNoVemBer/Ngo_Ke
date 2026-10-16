import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { backup } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { readConfig } from './config.mjs';
import {
  openDatabase, migrate, importDataset, hasContent, hasAnyContent, needsMigration,
  prepareLocalizedPair, readLocalizedPair, importLocalizedPair,
} from './database.mjs';
import { MAX_BODY_BYTES, parseDataset } from '../../mobile/src/data/sourceState.ts';

function backupPath(dbPath) {
  const timestamp = new Date().toISOString().replaceAll(':', '').replaceAll('.', '-');
  return dbPath + '.backup-' + timestamp + '-' + randomUUID();
}

function localizedArgs(args) {
  const result = { replace: false };
  for (let i = 0; i < args.length; i++) {
    const flag = args[i];
    if (flag === '--replace' && !result.replace) {
      result.replace = true;
    } else if ((flag === '--vi' || flag === '--en') && !result[flag.slice(2)] && args[i + 1] && !args[i + 1].startsWith('--')) {
      result[flag.slice(2)] = args[++i];
    } else {
      throw new Error('Usage: import-localized --vi <file> --en <file> [--replace]');
    }
  }
  if (!result.vi || !result.en) throw new Error('Usage: import-localized --vi <file> --en <file> [--replace]');
  return result;
}

function readLocalizedInput(path) {
  const bytes = readFileSync(resolve(path));
  if (bytes.byteLength > MAX_BODY_BYTES) throw new Error('Localized dataset exceeds the 512 KiB body limit');
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
}

let db;
try {
  const [command, ...args] = process.argv.slice(2);
  if (!['setup', 'migrate', 'seed', 'import', 'import-localized'].includes(command)) {
    throw new Error('Usage: setup | migrate | seed | import <dataset.json> [--replace] [--reviewed] | import-localized --vi <file> --en <file> [--replace]');
  }
  if (!['import', 'import-localized'].includes(command) && args.length !== 0) throw new Error('This command accepts no arguments');
  if (command === 'import') {
    const flags = args.slice(1);
    if (!args[0] || args[0].startsWith('--') ||
        flags.some((flag) => !['--replace', '--reviewed'].includes(flag)) ||
        new Set(flags).size !== flags.length) {
      throw new Error('Usage: import <dataset.json> [--replace] [--reviewed]');
    }
  }
  const localized = command === 'import-localized' ? localizedArgs(args) : undefined;
  const config = readConfig();
  if (['seed', 'import', 'import-localized'].includes(command) && !existsSync(config.dbPath)) {
    throw new Error('Database does not exist; run npm run setup first');
  }
  db = openDatabase(config.dbPath);
  if (command === 'setup' || command === 'migrate') {
    if (needsMigration(db) && hasAnyContent(db)) {
      const file = backupPath(config.dbPath);
      await backup(db, file);
      console.log('Backup created: ' + file);
    }
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
      await backup(db, backupPath(config.dbPath));
      console.log('Backup created');
    }
    const changed = importDataset(db, value, { replace });
    console.log(changed ? 'Dataset imported: ' + value.kind : 'Dataset already exists; left unchanged');
  }
  if (command === 'import-localized') {
    const pair = prepareLocalizedPair(readLocalizedInput(localized.vi), readLocalizedInput(localized.en));
    const current = readLocalizedPair(db);
    const unchanged = current && current.vi.sha256 === pair.viSha256 && current.en.sha256 === pair.enSha256;
    if (!unchanged && current && !localized.replace) {
      throw new Error('Localized dataset already exists; use --replace to back up before replacing');
    }
    if (!unchanged && hasAnyContent(db)) {
      const file = backupPath(config.dbPath);
      await backup(db, file);
      console.log('Backup created: ' + file);
    }
    const changed = importLocalizedPair(db, pair, { replace: localized.replace });
    console.log(changed ? 'Localized dataset imported: ' + pair.collectionId : 'Localized dataset already exists; left unchanged');
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  db?.close();
}
