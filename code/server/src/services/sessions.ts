import { Request, Response, NextFunction } from 'express';
import { Session } from 'express-session';
import { Low } from 'lowdb';
import { DatabaseSchema } from './db';
import { PoseUnauthorizedError } from './errors';

/**
 * As a learner, you don't need to worry about this file.
 * It includes basic setup code for session management,
 * including the driver to store sessions in a lowdb database.
 */

export interface SessionRecord {
  id: string;
  session: Session;
  expires: number;
}

export interface SessionRequest extends Request {
  session: Session & {
    user?: { id: string };
  };
  userId?: string;
}

export const SessionsService = {
  isAuthenticated,
  create,
  clear,
  getUserId,
};

export default SessionsService;

export function isAuthenticated(
  req: SessionRequest,
  res: Response,
  next: NextFunction
) {
  const userId = SessionsService.getUserId(req);
  if (!userId) res.status(402).json({ error: { message: 'User not found' } });
  else next();
}

export function create(req: SessionRequest, res: Response, next: NextFunction) {
  if (req.session.user) {
    return next();
  }

  const userId: string = req.userId as string;

  req.session.user = { id: userId };

  req.session.save((err) => {
    if (err) {
      console.error('❌ Session save error:', err);
      return next(err);
    }
    console.log('✅ New session saved:', req.session);
    next();
  });
}

export function clear(req: Request, res: Response) {
  if (!req.session) {
    console.log('⚠️ No session found to destroy.');
    return res.status(400).json({ error: 'No active session' });
  }

  req.session.destroy((err) => {
    if (err) {
      console.error('❌ Error destroying session:', err);
      return res.status(500).json({ error: 'Failed to clear session' });
    }

    console.log('✅ Session destroyed successfully');
    res.clearCookie('connect.sid');
    return res.json(null);
  });
}

export function getUserId(req: SessionRequest) {
  if (!req.session.user || !req.session.user.id) {
    throw new PoseUnauthorizedError('User not found in session');
  }
  return req.session.user.id;
}

interface SessionStoreOptions {
  ttl?: number;
  disablePurge?: boolean;
}

export function LowdbSessionStore(session: typeof import('express-session')) {
  const Store = session.Store;

  class SessionStore extends Store {
    private db: SessionsStoreImpl;

    constructor(db: Low<DatabaseSchema>, options: SessionStoreOptions = {}) {
      super({});

      if (!Array.isArray(db.data.sessions)) {
        throw new Error('The value of the first argument must be an array.');
      }
      this.db = new SessionsStoreImpl(db, options.ttl);

      if (!options.disablePurge) {
        setInterval(() => {
          this.db.purge();
        }, 60000);
      }
    }

    all(callback: (err: Error | null, sessions?: Session[]) => void): void {
      callback(null, this.db.all());
    }

    clear(callback: (err?: Error | null) => void): void {
      this.db.clear();
      this.db.write();
      callback(null);
    }

    destroy(sid: string, callback: (err?: Error | null) => void): void {
      this.db.destroy(sid);
      this.db.write();
      callback(null);
    }

    get(
      sid: string,
      callback: (err: Error | null, session?: Session | null) => void
    ): void {
      callback(null, this.db.get(sid) || null);
    }

    length(callback: (err: Error | null, length?: number) => void): void {
      callback(null, this.db.length());
    }

    set(
      sid: string,
      sessionData: Session,
      callback: (err?: Error | null) => void
    ): void {
      this.db.set(sid, sessionData);
      this.db.write();
      callback(null);
    }

    touch(
      sid: string,
      sessionData: Session,
      callback: (err?: Error | null) => void
    ): void {
      this.set(sid, sessionData, callback);
    }
  }

  return SessionStore;
}

class SessionsStoreImpl {
  private db: Low<DatabaseSchema>;
  private ttl: number;

  constructor(db: Low<DatabaseSchema>, ttl?: number) {
    this.db = db;
    this.ttl = ttl || 86400;
  }

  get(sid: string): Session | null {
    const obj = this.db.data.sessions.find(
      (obj: SessionRecord) => obj.id === sid
    );
    return obj ? obj.session : null;
  }

  all(): Session[] {
    return this.db.data.sessions.map((obj: SessionRecord) => obj.session);
  }

  length(): number {
    return this.db.data.sessions.length;
  }

  set(sid: string, sessionData: Session): void {
    const expires = Date.now() + this.ttl * 1000;

    const objIndex = this.db.data.sessions.findIndex(
      (obj: SessionRecord) => obj.id === sid
    );
    if (objIndex !== -1) {
      this.db.data.sessions[objIndex].session = sessionData;
      this.db.data.sessions[objIndex].expires = expires;
    } else {
      this.db.data.sessions.push({ id: sid, session: sessionData, expires });
    }
  }

  destroy(sid: string): void {
    this.db.data.sessions = this.db.data.sessions.filter(
      (obj: SessionRecord) => obj.id !== sid
    );
  }

  clear(): void {
    this.db.data.sessions = [];
  }

  purge(): void {
    const now = Date.now();

    this.db.data.sessions = this.db.data.sessions.filter(
      (obj: SessionRecord) => now < obj.expires
    );
  }

  write(): void {
    this.db.write();
  }
}
