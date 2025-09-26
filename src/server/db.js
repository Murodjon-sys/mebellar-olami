// src/db.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let cached = { connected: false, connecting: null };

export async function connectMongo() {
  if (cached.connected) return mongoose.connection;
  if (cached.connecting) return cached.connecting;

  // Prefer explicit env, but in non-production fall back to local MongoDB
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || (process.env.NODE_ENV !== 'production' ? 'mongodb://127.0.0.1:27017' : undefined);
  if (!uri) {
    console.error("❌ MongoDB URI missing. Set MONGO_URI (or MONGODB_URI) in .env");
    process.exit(1);
  }

  const dbName = process.env.MONGODB_DB || "Mebel-sayti";

  mongoose.connection.on('connected', () => {
    cached.connected = true;
    console.log(`[OK] MongoDB connected → db: ${mongoose.connection.name}`);
  });
  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
  });
  mongoose.connection.on('disconnected', () => {
    cached.connected = false;
    console.warn('⚠️  MongoDB disconnected');
  });

  try {
    cached.connecting = mongoose.connect(uri, { dbName });
    await cached.connecting;
    return mongoose.connection;
  } catch (err) {
    console.error('❌ Failed to connect MongoDB:', err);
    process.exit(1);
  }
}

export function isMongoConnected() {
  return cached.connected === true;
}
