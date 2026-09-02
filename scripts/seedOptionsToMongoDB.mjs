import { MongoClient } from 'mongodb';
import { works } from '../src/data/works.js';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://nftikizri_db_user:lwh4EfCAQPZt6yb0@cluserforecast1.cu1lrjk.mongodb.net/?appName=CluserForecast1";
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "PortoZeze";

function normalizeOptionValue(str) {
  if (typeof str !== 'string') return '';
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

async function seedOptions() {
  console.log(`Connecting to MongoDB (${MONGODB_DB_NAME})...`);
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB_NAME);
  const optionsCol = db.collection('cms_options');
  const worksCol = db.collection('works');

  // Ensure unique index
  await optionsCol.createIndex({ type: 1, normalizedValue: 1 }, { unique: true });

  // 1. Initial Default Options Sets
  const defaultCategories = [
    'Kampus',
    'Magang',
    'SMK',
    'Polimedia TV'
  ];

  const defaultInstitutions = [
    'Politeknik Negeri Media Kreatif',
    'RRI Jakarta',
    'RRI Pro 2 FM Jakarta',
    'SMK Negeri 48 Jakarta',
    'Polimedia TV',
    'Kompas TV',
    'TVRI',
    'Kumon'
  ];

  const defaultPlatforms = [
    'YouTube',
    'Instagram',
    'TikTok',
    'Televisi',
    'RRI Digital',
    'Google Drive',
    'Website',
    'Spotify'
  ];

  // Extract dynamically from static works & MongoDB works
  const dbWorks = await worksCol.find({}).toArray();
  const allWorks = [...works, ...dbWorks];

  allWorks.forEach((w) => {
    if (w.category) defaultCategories.push(w.category);
    if (w.organization) defaultInstitutions.push(w.organization);
    if (w.platform) defaultPlatforms.push(w.platform);
  });

  const now = new Date().toISOString();
  let seededCount = 0;

  // Function to insert unique items
  async function upsertList(type, list) {
    for (const val of list) {
      if (!val || typeof val !== 'string' || !val.trim()) continue;
      const trimmedValue = val.trim();
      const normalizedValue = normalizeOptionValue(trimmedValue);

      await optionsCol.updateOne(
        { type, normalizedValue },
        {
          $setOnInsert: {
            type,
            value: trimmedValue,
            normalizedValue,
            createdAt: now,
          },
          $set: { updatedAt: now }
        },
        { upsert: true }
      );
      seededCount++;
    }
  }

  await upsertList('production_category', defaultCategories);
  await upsertList('institution', defaultInstitutions);
  await upsertList('distribution_platform', defaultPlatforms);

  const totalOptions = await optionsCol.countDocuments();
  console.log(`✅ Options seeding completed. Total unique options in cms_options: ${totalOptions}`);

  await client.close();
}

seedOptions().catch((err) => {
  console.error('❌ Error seeding options:', err);
  process.exit(1);
});
