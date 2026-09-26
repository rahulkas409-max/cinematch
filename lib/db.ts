import "server-only";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

// Zero-config SQLite via Node's built-in driver (Node >= 22.5). The file lives in
// ./.data by default; override with DATABASE_PATH. On Vercel the project directory is
// read-only, so it falls back to /tmp (per-instance and wiped on redeploys).
const dbPath =
  process.env.DATABASE_PATH ||
  (process.env.VERCEL ? "/tmp/cinematch.db" : path.join(process.cwd(), ".data", "cinematch.db"));

declare global {
  var __cinematchDb: DatabaseSync | undefined;
}

function open() {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec(`
    PRAGMA busy_timeout = 5000;
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL,
      premium_until INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      currency TEXT NOT NULL,
      status TEXT NOT NULL,
      payment_id TEXT,
      sandbox INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      paid_at INTEGER
    );
    CREATE TABLE IF NOT EXISTS quiz_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      profile TEXT NOT NULL,
      emoji_score INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS watchlist (
      user_id TEXT NOT NULL,
      movie_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, movie_id)
    );
    CREATE TABLE IF NOT EXISTS mood_usage (
      user_id TEXT NOT NULL,
      day TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, day)
    );
  `);
  return db;
}

// Opened lazily so importing this module (e.g. during `next build`) never touches the file.
const db = {
  prepare: (sql: string) => (globalThis.__cinematchDb ??= open()).prepare(sql),
};

export interface UserRow {
  id: string;
  created_at: number;
  premium_until: number;
}

export interface OrderRow {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: "created" | "paid" | "failed";
  payment_id: string | null;
  sandbox: number;
  created_at: number;
  paid_at: number | null;
}

export const users = {
  get: (id: string) => db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined,
  create: (id: string) =>
    db.prepare("INSERT OR IGNORE INTO users (id, created_at) VALUES (?, ?)").run(id, Date.now()),
  extendPremium: (id: string, hours: number) => {
    const user = users.get(id);
    const base = Math.max(Date.now(), user?.premium_until ?? 0);
    const until = base + hours * 3600_000;
    db.prepare("UPDATE users SET premium_until = ? WHERE id = ?").run(until, id);
    return until;
  },
};

export const orders = {
  get: (id: string) => db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as OrderRow | undefined,
  create: (o: Pick<OrderRow, "id" | "user_id" | "amount" | "currency"> & { sandbox: boolean }) =>
    db
      .prepare(
        "INSERT INTO orders (id, user_id, amount, currency, status, sandbox, created_at) VALUES (?, ?, ?, ?, 'created', ?, ?)",
      )
      .run(o.id, o.user_id, o.amount, o.currency, o.sandbox ? 1 : 0, Date.now()),
  /** Marks paid only if still unpaid; returns true when this call did the transition. */
  markPaid: (id: string, paymentId: string) =>
    db
      .prepare("UPDATE orders SET status = 'paid', payment_id = ?, paid_at = ? WHERE id = ? AND status != 'paid'")
      .run(paymentId, Date.now(), id).changes === 1,
};

export const quizResults = {
  save: (userId: string, profile: unknown, emojiScore: number) =>
    db
      .prepare("INSERT INTO quiz_results (user_id, profile, emoji_score, created_at) VALUES (?, ?, ?, ?)")
      .run(userId, JSON.stringify(profile), emojiScore, Date.now()),
};

export const watchlist = {
  list: (userId: string) =>
    (db.prepare("SELECT movie_id FROM watchlist WHERE user_id = ? ORDER BY created_at DESC").all(userId) as {
      movie_id: string;
    }[]).map((r) => r.movie_id),
  add: (userId: string, movieId: string) =>
    db.prepare("INSERT OR IGNORE INTO watchlist (user_id, movie_id, created_at) VALUES (?, ?, ?)").run(userId, movieId, Date.now()),
  remove: (userId: string, movieId: string) =>
    db.prepare("DELETE FROM watchlist WHERE user_id = ? AND movie_id = ?").run(userId, movieId),
};

const today = () => new Date().toISOString().slice(0, 10);

export const moodUsage = {
  get: (userId: string) =>
    ((db.prepare("SELECT count FROM mood_usage WHERE user_id = ? AND day = ?").get(userId, today()) as
      | { count: number }
      | undefined)?.count ?? 0),
  increment: (userId: string) =>
    db
      .prepare(
        "INSERT INTO mood_usage (user_id, day, count) VALUES (?, ?, 1) ON CONFLICT(user_id, day) DO UPDATE SET count = count + 1",
      )
      .run(userId, today()),
};
