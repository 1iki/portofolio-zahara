import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';

// Load environment variables from .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { works } from '../src/data/works.js';
import { documentations } from '../src/data/documentation.js';
import { scripts } from '../src/data/scripts.js';
import { experience } from '../src/data/experience.js';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'PortoZeze';

if (!MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI environment variable is missing.');
  process.exit(1);
}

async function runMigration() {
  console.log('🚀 Starting Data Migration to MongoDB PortoZeze...');
  console.log(`📡 Connecting to MongoDB URI: ${MONGODB_URI.substring(0, 30)}...`);

  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB successfully.');
    const db = client.db(MONGODB_DB_NAME);

    // 1. Works Migration
    const worksCol = db.collection('works');
    await worksCol.createIndex({ id: 1 }, { unique: true });
    let worksMigrated = 0;
    for (const item of works) {
      await worksCol.updateOne({ id: item.id }, { $set: item }, { upsert: true });
      worksMigrated++;
    }
    const worksDbCount = await worksCol.countDocuments();
    console.log(`📦 Works: Source Count = ${works.length} | MongoDB Count = ${worksDbCount} | Status: ${works.length === worksDbCount ? 'MATCH ✅' : 'MISMATCH ⚠️'}`);

    // 2. Documentation Migration
    const docsCol = db.collection('documentation');
    await docsCol.createIndex({ id: 1 }, { unique: true });
    let docsMigrated = 0;
    for (const item of documentations) {
      await docsCol.updateOne({ id: item.id }, { $set: item }, { upsert: true });
      docsMigrated++;
    }
    const docsDbCount = await docsCol.countDocuments();
    console.log(`📸 Documentation: Source Count = ${documentations.length} | MongoDB Count = ${docsDbCount} | Status: ${documentations.length === docsDbCount ? 'MATCH ✅' : 'MISMATCH ⚠️'}`);

    // 3. Scripts Migration
    const scriptsCol = db.collection('scripts');
    await scriptsCol.createIndex({ id: 1 }, { unique: true });
    let scriptsMigrated = 0;
    for (const item of scripts) {
      await scriptsCol.updateOne({ id: item.id }, { $set: item }, { upsert: true });
      scriptsMigrated++;
    }
    const scriptsDbCount = await scriptsCol.countDocuments();
    console.log(`📜 Scripts: Source Count = ${scripts.length} | MongoDB Count = ${scriptsDbCount} | Status: ${scripts.length === scriptsDbCount ? 'MATCH ✅' : 'MISMATCH ⚠️'}`);

    // 4. Experience Migration
    const expCol = db.collection('experience');
    await expCol.createIndex({ id: 1 }, { unique: true });
    let expMigrated = 0;
    for (const item of experience) {
      await expCol.updateOne({ id: item.id }, { $set: item }, { upsert: true });
      expMigrated++;
    }
    const expDbCount = await expCol.countDocuments();
    console.log(`💼 Experience: Source Count = ${experience.length} | MongoDB Count = ${expDbCount} | Status: ${experience.length === expDbCount ? 'MATCH ✅' : 'MISMATCH ⚠️'}`);

    console.log('\n✨ MIGRATION COMPLETE! All static datasets successfully seeded into MongoDB PortoZeze.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await client.close();
  }
}

runMigration();
