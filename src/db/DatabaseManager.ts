// src/db/DatabaseManager.ts

class DatabaseManager {
  dbName = 'EGuidanceDB';
  version = 1;
  db: IDBDatabase | null = null;

  async init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('records')) {
          const recordStore = db.createObjectStore('records', { keyPath: 'id', autoIncrement: true });
          recordStore.createIndex('type', 'type', { unique: false });
          recordStore.createIndex('violationType', 'violationType', { unique: false });
          recordStore.createIndex('dateTime', 'dateTime', { unique: false });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  async addRecord(record: any): Promise<IDBRequest> {
    const transaction = this.db!.transaction(['records'], 'readwrite');
    const store = transaction.objectStore('records');
    return store.add({
      ...record,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString()
    });
  }

  async updateRecord(id: number, record: any): Promise<IDBRequest> {
    const transaction = this.db!.transaction(['records'], 'readwrite');
    const store = transaction.objectStore('records');
    const existing: any = await new Promise((resolve, reject) => {
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if (!existing) throw new Error('Record not found');
    return store.put({
      ...existing,
      ...record,
      modifiedAt: new Date().toISOString()
    });
  }

  async getAllRecords(): Promise<any[]> {
    const transaction = this.db!.transaction(['records'], 'readonly');
    const store = transaction.objectStore('records');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getSetting(key: string): Promise<any> {
    const transaction = this.db!.transaction(['settings'], 'readonly');
    const store = transaction.objectStore('settings');
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  }

  async setSetting(key: string, value: any): Promise<IDBRequest> {
    const transaction = this.db!.transaction(['settings'], 'readwrite');
    const store = transaction.objectStore('settings');
    return store.put({ key, value });
  }

  async deleteRecord(recordId: number): Promise<void> {
    const transaction = this.db!.transaction(['records'], 'readwrite');
    const store = transaction.objectStore('records');
    return new Promise((resolve, reject) => {
      const request = store.delete(recordId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteAllRecords(): Promise<void> {
    const transaction = this.db!.transaction(['records'], 'readwrite');
    const store = transaction.objectStore('records');
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const db = new DatabaseManager();