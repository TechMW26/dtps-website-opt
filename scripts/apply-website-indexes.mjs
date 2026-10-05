import { readFile } from 'node:fs/promises';
import firestore from '@google-cloud/firestore';
const { v1 } = firestore;
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.FIRESTORE_NATIVE_PROJECT_ID;
const databaseId = process.env.FIREBASE_DATABASE_ID || process.env.FIRESTORE_NATIVE_DATABASE_ID;
if (!projectId || !databaseId) throw new Error('Explicit Firebase project and database required');
const client = new v1.FirestoreAdminClient({ projectId, credentials: {
  client_email: process.env.FIREBASE_CLIENT_EMAIL || process.env.FIRESTORE_NATIVE_CLIENT_EMAIL,
  private_key: (process.env.FIREBASE_PRIVATE_KEY || process.env.FIRESTORE_NATIVE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
}});
const { indexes } = JSON.parse(await readFile('website-firestore.indexes.json', 'utf8'));
for (const { collectionGroup, queryScope, fields } of indexes) {
  try {
    const [operation] = await client.createIndex({ parent: `projects/${projectId}/databases/${databaseId}/collectionGroups/${collectionGroup}`, index: { queryScope, fields } });
    console.log(JSON.stringify({ collectionGroup, fields: fields.map(x => x.fieldPath), operation: operation.name }));
  } catch (error) { if (error.code !== 6) throw error; console.log(`Index already exists: ${collectionGroup}/${fields.map(x => x.fieldPath).join(',')}`); }
}
await client.close();
