// lib/mongoose.ts
import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local');
}

const uri = process.env.MONGODB_URI;
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connect() {
  if (cached.conn) {
    return cached.conn;        // өмнө үүсгэсэн холболт байгаа бол түүнийг буцаана
  }
  if (!cached.promise) {
    const opts = { bufferCommands: false };
    cached.promise = mongoose.connect(uri, opts).then(m => {
      return m;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connect;
