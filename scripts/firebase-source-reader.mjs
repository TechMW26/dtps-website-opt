import { isWebsiteNamespace } from '../lib/mongo-website-codec.mjs';

export async function boundedSourceMap(values, task, concurrency) {
  if (!Number.isSafeInteger(concurrency) || concurrency < 1 || concurrency > 64) throw new Error('Invalid source concurrency');
  const output = new Array(values.length); let next = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, async () => {
    for (;;) { const i = next++; if (i >= values.length) return; output[i] = await task(values[i]); }
  }));
  return output;
}

// Public Firestore v1 GAPIC only. No SDK internals or altered permission scope.
// https://cloud.google.com/firestore/docs/reference/rest/v1/projects.databases.documents/list
export function createSourceEnumerator(source, client, projectId, databaseId) {
  const base = `projects/${projectId}/databases/${databaseId}/documents`;
  function check(path) {
    if (typeof path !== 'string' || !isWebsiteNamespace(path.split('/')[0])) throw new Error('Non-website enumeration rejected');
  }
  async function pages(method, request) {
    const output = []; const tokens = new Set(); let pageToken;
    do {
      const [rows, , response] = await client[method]({ ...request, ...(pageToken ? { pageToken } : {}) }, { autoPaginate: false });
      output.push(...rows);
      pageToken = response?.nextPageToken;
      if (pageToken && tokens.has(pageToken)) throw new Error('Repeated source pagination token');
      if (pageToken) tokens.add(pageToken);
    } while (pageToken);
    return output;
  }
  return {
    async listDocuments(collection) {
      check(collection.path);
      const parts = collection.path.split('/'); const collectionId = parts.pop();
      const parent = parts.length ? `${base}/${parts.join('/')}` : base;
      const rows = await pages('listDocuments', { parent, collectionId, pageSize: 1000, showMissing: true, mask: { fieldPaths: [] } });
      const prefix = `${base}/${collection.path}/`;
      return rows.map(row => {
        if (typeof row.name !== 'string' || !row.name.startsWith(prefix) || row.name.slice(prefix.length).includes('/') || !row.name.slice(prefix.length)) throw new Error('Source document response escaped requested collection');
        return source.doc(row.name.slice(base.length + 1));
      });
    },
    async listCollections(ref) {
      check(ref.path);
      const ids = await pages('listCollectionIds', { parent: `${base}/${ref.path}`, pageSize: 1000 });
      return ids.map(id => {
        if (typeof id !== 'string' || !id || id.includes('/')) throw new Error('Invalid source collection ID');
        return source.collection(`${ref.path}/${id}`);
      });
    },
  };
}
