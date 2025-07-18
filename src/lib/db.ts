import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/architectural-firm";

if (!process.env.MONGODB_URI) {
  console.warn("⚠️  MONGODB_URI not found in environment variables, using localhost fallback");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

// Always ensure the cache exists with fallback
const cache: MongooseCache = (global.mongooseCache ??= {
  conn: null,
  promise: null,
});

export async function connectDB() {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    const options = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
    };

    console.log("🔌 Attempting to connect to MongoDB...");
    console.log("📍 URI:", MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, "//***:***@")); // Hide credentials in logs

    cache.promise = mongoose
      .connect(MONGODB_URI, options)
      .then((mongoose) => {
        console.log("✅ MongoDB connected successfully");
        return mongoose;
      })
      .catch((error) => {
        console.error("❌ MongoDB connection error:", error.message);
        console.error("🔍 Error details:", {
          name: error.name,
          code: error.code,
          hostname: error.hostname,
        });
        throw error;
      });
  }

  try {
    cache.conn = await cache.promise;
    return cache.conn;
  } catch (error) {
    cache.promise = null; // Reset promise on error
    throw error;
  }
}
