const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "database.sqlite"));

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    credits INTEGER DEFAULT 10,
    referred_by INTEGER,
    username TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS transactions (
    payment_id TEXT PRIMARY KEY,
    user_id INTEGER,
    stars INTEGER,
    credits INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const dbOps = {
  getUser: (userId) => {
    return db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  },

  addUser: (userId, username, referredBy = null) => {
    const existing = dbOps.getUser(userId);
    if (!existing) {
      db.prepare("INSERT INTO users (id, username, referred_by) VALUES (?, ?, ?)")
        .run(userId, username, referredBy);
      return true;
    }
    return false;
  },

  addCredits: (userId, amount) => {
    db.prepare("UPDATE users SET credits = credits + ? WHERE id = ?")
      .run(amount, userId);
  },

  deductCredits: (userId, amount) => {
    db.prepare("UPDATE users SET credits = credits - ? WHERE id = ?")
      .run(amount, userId);
  },

  addReferral: (userId, referrerId) => {
    db.prepare("UPDATE users SET referred_by = ? WHERE id = ?")
      .run(referrerId, userId);
  },

  logTransaction: (paymentId, userId, stars, credits) => {
    db.prepare("INSERT INTO transactions (payment_id, user_id, stars, credits) VALUES (?, ?, ?, ?)")
      .run(paymentId, userId, stars, credits);
  },

  isPremium: (userId) => {
    const row = db.prepare("SELECT count(*) as count FROM transactions WHERE user_id = ?").get(userId);
    return row.count > 0;
  }
};

module.exports = dbOps;
