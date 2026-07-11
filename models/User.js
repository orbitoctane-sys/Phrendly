const { getDb } = require("../database/database");

let cachedDb = null;

async function getDatabase() {
    if (cachedDb) {
        return cachedDb;
    }

    cachedDb = await getDb();
    return cachedDb;
}

function parseJsonField(value) {
    if (!value) return [];

    try {
        return JSON.parse(value);
    } catch (error) {
        return value;
    }
}

function serializeValue(value) {
    if (value === undefined || value === null) {
        return null;
    }

    return typeof value === "string" ? value : JSON.stringify(value);
}

async function runQuery(sql, params = []) {
    const database = await getDatabase();

    return new Promise((resolve, reject) => {
        database.run(sql, params, function (error) {
            if (error) {
                reject(error);
                return;
            }

            resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

async function getQuery(sql, params = []) {
    const database = await getDatabase();

    return new Promise((resolve, reject) => {
        database.get(sql, params, (error, row) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(row);
        });
    });
}

async function ensureUserTableSchema() {
    const database = await getDatabase();

    await runQuery(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            referralCode TEXT DEFAULT '',
            referredBy TEXT DEFAULT '',
            referrals TEXT DEFAULT '[]',
            totalEarnings REAL DEFAULT 0,
            totalWithdraws REAL DEFAULT 0,
            friends TEXT DEFAULT '[]',
            friendRequests TEXT DEFAULT '[]',
            sentRequests TEXT DEFAULT '[]',
            chats TEXT DEFAULT '{}',
            isAdmin INTEGER DEFAULT 0,
            isActive INTEGER DEFAULT 0,
            paymentStatus TEXT DEFAULT 'pending',
            transactionId TEXT DEFAULT '',
            lastPaymentAmount REAL DEFAULT 0,
            registeredAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    const columns = await new Promise((resolve, reject) => {
        database.all("PRAGMA table_info(users)", (error, rows) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(rows || []);
        });
    });

    const existingColumns = new Set(columns.map((column) => column.name));
    const migrations = [
        ["referredBy", "TEXT DEFAULT ''"],
        ["referrals", "TEXT DEFAULT '[]'"],
        ["totalEarnings", "REAL DEFAULT 0"],
        ["totalWithdraws", "REAL DEFAULT 0"],
        ["friends", "TEXT DEFAULT '[]'"],
        ["friendRequests", "TEXT DEFAULT '[]'"],
        ["sentRequests", "TEXT DEFAULT '[]'"],
        ["chats", "TEXT DEFAULT '{}'"],
        ["isAdmin", "INTEGER DEFAULT 0"],
        ["isActive", "INTEGER DEFAULT 0"],
        ["paymentStatus", "TEXT DEFAULT 'pending'"],
        ["transactionId", "TEXT DEFAULT ''"],
        ["lastPaymentAmount", "REAL DEFAULT 0"],
        ["registeredAt", "TEXT DEFAULT CURRENT_TIMESTAMP"]
    ];

    for (const [columnName, columnDefinition] of migrations) {
        if (!existingColumns.has(columnName)) {
            await runQuery(`ALTER TABLE users ADD COLUMN ${columnName} ${columnDefinition}`);
        }
    }
}

async function initializeDatabase() {
    await ensureUserTableSchema();
}

async function findUserByEmail(email) {
    const row = await getQuery("SELECT * FROM users WHERE email = ?", [email]);

    if (!row) {
        return null;
    }

    return {
        ...row,
        referrals: parseJsonField(row.referrals),
        friends: parseJsonField(row.friends),
        friendRequests: parseJsonField(row.friendRequests),
        sentRequests: parseJsonField(row.sentRequests),
        chats: parseJsonField(row.chats)
    };
}

async function saveUser(userData) {
    const result = await runQuery(
        `INSERT INTO users (
            username,
            email,
            password,
            referralCode,
            referredBy,
            referrals,
            totalEarnings,
            totalWithdraws,
            friends,
            friendRequests,
            sentRequests,
            chats,
            isAdmin,
            isActive,
            paymentStatus,
            transactionId,
            lastPaymentAmount,
            registeredAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            userData.username,
            userData.email,
            userData.password,
            userData.referralCode || "",
            userData.referredBy || "",
            serializeValue(userData.referrals || []),
            userData.totalEarnings || 0,
            userData.totalWithdraws || 0,
            serializeValue(userData.friends || []),
            serializeValue(userData.friendRequests || []),
            serializeValue(userData.sentRequests || []),
            serializeValue(userData.chats || {}),
            userData.isAdmin ? 1 : 0,
            userData.isActive ? 1 : 0,
            userData.paymentStatus || "pending",
            userData.transactionId || "",
            userData.lastPaymentAmount || 0,
            userData.registeredAt || new Date().toISOString()
        ]
    );

    return {
        id: result.lastID,
        ...userData,
        registeredAt: userData.registeredAt || new Date().toISOString()
    };
}

async function updateUserPassword(email, passwordHash) {
    const result = await runQuery(
        "UPDATE users SET password = ? WHERE email = ?",
        [passwordHash, email]
    );

    if (result.changes === 0) {
        return null;
    }

    return { email };
}

async function activateUser(email, transactionId, amount) {
    const result = await runQuery(
        "UPDATE users SET isActive = 1, paymentStatus = ?, transactionId = ?, lastPaymentAmount = ? WHERE email = ?",
        ["paid", transactionId || "", amount || 0, email]
    );

    if (result.changes === 0) {
        return null;
    }

    return { email, transactionId, amount };
}

module.exports = {
    initializeDatabase,
    findUserByEmail,
    saveUser,
    updateUserPassword,
    activateUser
};
