import 'dotenv/config';
import { db } from './server/src/database/db.ts';
db.exec(`DELETE FROM contents; DELETE FROM topics; DELETE FROM memory_records; DELETE FROM memory_events;`);
console.log('cleared', db.get<any>('SELECT COUNT(*) as c FROM contents'));
process.exit(0);
