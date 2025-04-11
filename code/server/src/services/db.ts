import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { SessionRecord, LowdbSessionStore } from './sessions';
import { Workshop, User, Studio, Instructor } from '../sharedTypes';

export const DB_FILE_PATH = 'db.json';
export const INIT_DB_VALUE: DatabaseSchema = {
  users: {},
  workshops: {},
  studios: {},
  instructors: {},
  sessions: [],
};

export interface DatabaseSchema {
  users: Record<string, User>;
  workshops: Record<string, Workshop>;
  studios: Record<string, Studio>;
  instructors: Record<string, Instructor>;
  sessions: SessionRecord[];
}

class DatabaseService {
  private db: Low<DatabaseSchema>;

  constructor() {
    const adapter = new JSONFile<DatabaseSchema>(DB_FILE_PATH);
    this.db = new Low(adapter, INIT_DB_VALUE);
  }

  async init(): Promise<void> {
    await this.db.read();

    // ensure db.data is initialized
    if (!this.db.data) {
      console.log('⚠️ db.data was undefined, initializing...');
      this.db.data = INIT_DB_VALUE;
    }

    // ensure sessions array exists
    if (!this.db.data.sessions) {
      console.log('⚠️ sessions array missing, adding...');
      this.db.data.sessions = [];
    }

    await this.db.write();
    console.log('✅ Database Loaded:');
  }

  // generic function to save data
  async saveData<K extends keyof Omit<DatabaseSchema, 'sessions'>>(
    collection: K,
    key: string,
    value: DatabaseSchema[K][string]
  ): Promise<void> {
    this.db.data[collection][key] = { ...value, updatedAt: new Date() };
    await this.db.write();
  }

  // generic function to load data
  loadData<K extends keyof Omit<DatabaseSchema, 'sessions'>>(
    collection: K,
    key: string
  ): DatabaseSchema[K][string] | null {
    const value = this.db.data[collection][key];
    return value as DatabaseSchema[K][string] | null;
  }

  searchData<K extends keyof Omit<DatabaseSchema, 'sessions'>>(
    collection: K,
    predicate: (item: DatabaseSchema[K][string]) => boolean
  ): DatabaseSchema[K][string][] {
    return Object.values(this.db.data[collection] || {}).filter(predicate);
  }

  async deleteData<K extends keyof Omit<DatabaseSchema, 'sessions'>>(
    collection: K,
    key: string
  ): Promise<void> {
    delete this.db.data[collection][key];
    await this.db.write();
  }

  getSessionStore(session: typeof import('express-session')) {
    return new (LowdbSessionStore(session))(this.db as Low<DatabaseSchema>, {
      ttl: 86400,
    });
  }
}

// create a single instance of the database service
export const dbService = new DatabaseService();
