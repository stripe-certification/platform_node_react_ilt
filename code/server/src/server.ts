// Environment variables
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
import express, { json } from 'express';
import session from 'express-session';
import 'express-async-errors'; //apply async error patch, so we can use throw in async functions instead of next()
import { resolve } from 'path';
import { existsSync } from 'fs';
import cors from 'cors';

import {
  accountsRouter,
  accountSessionsRouter,
  studiosRouter,
  usersRouter,
  webhookRouter,
  workshopsRouter,
  instructorsRouter,
} from './routes/index.js';
import { dbService } from './services/db.js';
import { PoseError, errorHandler } from './services/errors.js';

async function startServer() {
  try {
    await dbService.init();

    const app = express();

    const store = dbService.getSessionStore(session);

    const sessionSecret = process.env.SESSION_SECRET;
    if (!sessionSecret) throw new PoseError('SESSION_SECRET not set');

    app.use(
      cors({
        origin: `http://localhost:${process.env.CLIENT_PORT}`,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
      })
    );

    app.use(
      session({
        store: store,
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: {
          maxAge: 86400000,
          httpOnly: true,
          secure: false,
        },
      })
    );

    if (!process.env.STATIC_DIR) throw new PoseError('STATIC_DIR not set');
    app.use(express.static(process.env.STATIC_DIR));

    app.use(webhookRouter);
    app.use(json());

    app.use(accountSessionsRouter);
    app.use(accountsRouter);
    app.use(studiosRouter);
    app.use(instructorsRouter);
    app.use(workshopsRouter);
    app.use(usersRouter);
    app.get('/', (_, res) => {
      try {
        const path = resolve(`${process.env.STATIC_DIR}/index.html`);
        if (!existsSync(path)) throw new PoseError(`index.html not found`);
        res.sendFile(path);
      } catch (error: any) {
        console.log(`Error loading static files: ${error.name}`);
        const path = resolve('./public/static-file-error.html');
        res.sendFile(path);
      }
    });
    app.use(errorHandler);
    app.listen(4242, 'localhost', () => {
      console.log('Server is listening on port 4242...');
    });
  } catch (error) {
    console.error('Error during initialization: ', error);
    process.exit(1);
  }
}

startServer();
