import type { AssessmentRecord, AssessmentType } from "../types/assessment";

const DB_NAME = "ASTRA_MOTION_DB";
const STORE_NAME = "assessments";
const DB_VERSION = 1;

type Db = IDBDatabase | null;

let dbInstance: Db = null;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("type", "type", { unique: false });
        store.createIndex("date", "date", { unique: false });
      }
    };
  });
}

export class AssessmentRepository {
  async save(record: AssessmentRecord): Promise<void> {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getAll(): Promise<AssessmentRecord[]> {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const records = request.result as AssessmentRecord[];
        records.sort((a, b) => b.date - a.date);
        resolve(records);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getById(id: string): Promise<AssessmentRecord | null> {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve((request.result as AssessmentRecord) || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getByType(type: AssessmentType): Promise<AssessmentRecord[]> {
    const all = await this.getAll();
    return all.filter((r) => r.type === type);
  }

  async delete(id: string): Promise<void> {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(): Promise<void> {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const assessmentRepository = new AssessmentRepository();
