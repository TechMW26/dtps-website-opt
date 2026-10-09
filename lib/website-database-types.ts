// Application persistence contract. Deliberately independent of Firebase SDK.
export interface WebsiteDocumentData { [field: string]: any; }
export interface WebsiteWriteResult { writeTime: { toDate(): Date; toMillis(): number }; }
export interface WebsiteDocumentSnapshot {
  readonly id: string;
  readonly exists: boolean;
  readonly ref: WebsiteDocumentReference;
  data(): WebsiteDocumentData | undefined;
  get(field: string): any;
}
export interface WebsiteQueryDocumentSnapshot extends WebsiteDocumentSnapshot {
  data(): WebsiteDocumentData;
}
export interface WebsiteQuerySnapshot {
  readonly docs: WebsiteQueryDocumentSnapshot[];
  readonly size: number;
  readonly empty: boolean;
  forEach(callback: (document: WebsiteQueryDocumentSnapshot) => void): void;
}
export interface WebsiteQuery {
  readonly path: string;
  where(field: string, operator: string, value: any): WebsiteQuery;
  orderBy(field: string, direction?: 'asc' | 'desc'): WebsiteQuery;
  limit(count: number): WebsiteQuery;
  select(...fields: string[]): WebsiteQuery;
  startAfter(document: WebsiteDocumentSnapshot): WebsiteQuery;
  get(): Promise<WebsiteQuerySnapshot>;
  count(): { get(): Promise<{ data(): { count: number } }> };
}
export interface WebsiteCollection extends WebsiteQuery {
  doc(id?: string): WebsiteDocumentReference;
  add(data: WebsiteDocumentData): Promise<WebsiteDocumentReference>;
}
export interface WebsiteDocumentReference {
  readonly id: string;
  readonly path: string;
  readonly parent: WebsiteCollection;
  collection(path: string): WebsiteCollection;
  get(): Promise<WebsiteDocumentSnapshot>;
  create(data: WebsiteDocumentData): Promise<WebsiteWriteResult>;
  set(data: WebsiteDocumentData, options?: { merge?: boolean }): Promise<WebsiteWriteResult>;
  update(data: WebsiteDocumentData): Promise<WebsiteWriteResult>;
  delete(): Promise<WebsiteWriteResult>;
}
export interface WebsiteTransaction {
  get(reference: WebsiteDocumentReference): Promise<WebsiteDocumentSnapshot>;
  get(query: WebsiteQuery): Promise<WebsiteQuerySnapshot>;
  create(reference: WebsiteDocumentReference, data: WebsiteDocumentData): WebsiteTransaction;
  set(reference: WebsiteDocumentReference, data: WebsiteDocumentData, options?: { merge?: boolean }): WebsiteTransaction;
  update(reference: WebsiteDocumentReference, data: WebsiteDocumentData): WebsiteTransaction;
  delete(reference: WebsiteDocumentReference): WebsiteTransaction;
}
export interface WebsiteDatabase {
  collection(path: string): WebsiteCollection;
  doc(path: string): WebsiteDocumentReference;
  getAll(...references: WebsiteDocumentReference[]): Promise<WebsiteDocumentSnapshot[]>;
  runTransaction<T>(callback: (transaction: WebsiteTransaction) => Promise<T>): Promise<T>;
  bulkWriter(): { delete(reference: WebsiteDocumentReference): void; close(): Promise<void> };
}
