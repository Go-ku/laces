import mongoose from "mongoose";

// Keep connection in a global variable so it persists between hot reloads
let isConnected = false;

/**
 * Connect to MongoDB using Mongoose
 */
export async function connectDB() {
  if (isConnected) {
    // Already connected
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("⚠️ Please set MONGODB_URI in your environment variables");
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB || undefined, // optional: choose db
      bufferCommands: false,
    });

    isConnected = conn.connections[0].readyState === 1;

    if (isConnected) {
      console.log("✅ MongoDB connected");
    } else {
      console.warn("⚠️ MongoDB connection not ready");
    }
  } catch (err) {
    console.error("❌ MongoDB connection error", err);
    throw err;
  }
}
