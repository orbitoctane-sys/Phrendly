const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "phrendly.db");
let db = null;

async function connectDB() {
    if (db) {
        return db;
    }

    db = await new Promise((resolve, reject) => {
        const connection = new sqlite3.Database(dbPath, (error) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(connection);
        });
    });

    console.log("✅ SQLite database connected.");
    return db;
}

async function getDb() {
    if (!db) {
        await connectDB();
    }

    return db;
}

module.exports = connectDB;
module.exports.connectDB = connectDB;
module.exports.getDb = getDb;