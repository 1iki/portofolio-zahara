import { MongoClient } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'PortoZeze';

if (!MONGODB_URI) {
  console.warn('[MongoDB] WARNING: MONGODB_URI environment variable is missing.');
}

/**
 * Connect to MongoDB database using singleton cached connection pattern.
 * Prevents multiple connection pool creation in serverless environments.
 */
export async function connectToDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is missing.');
  }

  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(process.env.MONGODB_URI, {
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
  });

  await client.connect();
  const db = client.db(MONGODB_DB_NAME);

  cachedClient = client;
  cachedDb = db;

  // Auto-ensure unique indexes on ID fields
  try {
    await ensureIndexes(db);
  } catch (err) {
    console.warn('[MongoDB] Index creation warning:', err.message);
  }

  return { client, db };
}

async function ensureIndexes(db) {
  await db.collection('works').createIndex({ id: 1 }, { unique: true });
  await db.collection('documentation').createIndex({ id: 1 }, { unique: true });
  await db.collection('scripts').createIndex({ id: 1 }, { unique: true });
  await db.collection('experience').createIndex({ id: 1 }, { unique: true });
  await db.collection('education').createIndex({ id: 1 }, { unique: true });
  await db.collection('cms_options').createIndex({ type: 1, normalizedValue: 1 }, { unique: true });
  await db.collection('work_categories').createIndex({ id: 1 }, { unique: true });
  await db.collection('experience_categories').createIndex({ id: 1 }, { unique: true });
  await db.collection('role_filters').createIndex({ id: 1 }, { unique: true });
}

export async function getWorksCollection() {
  const { db } = await connectToDatabase();
  return db.collection('works');
}

export async function getOptionsCollection() {
  const { db } = await connectToDatabase();
  return db.collection('cms_options');
}

export async function getDocumentationCollection() {
  const { db } = await connectToDatabase();
  return db.collection('documentation');
}

export async function getScriptsCollection() {
  const { db } = await connectToDatabase();
  return db.collection('scripts');
}

export async function getExperienceCollection() {
  const { db } = await connectToDatabase();
  return db.collection('experience');
}

export async function getEducationCollection() {
  const { db } = await connectToDatabase();
  return db.collection('education');
}

export async function getContactCollection() {
  const { db } = await connectToDatabase();
  return db.collection('contact');
}

export async function getWorkCategoriesCollection() {
  const { db } = await connectToDatabase();
  return db.collection('work_categories');
}

export async function getExperienceCategoriesCollection() {
  const { db } = await connectToDatabase();
  return db.collection('experience_categories');
}

export async function getRoleFiltersCollection() {
  const { db } = await connectToDatabase();
  return db.collection('role_filters');
}

export async function checkDatabaseHealth() {
  try {
    const { db } = await connectToDatabase();
    await db.command({ ping: 1 });
    return { connected: true, dbName: MONGODB_DB_NAME };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}
