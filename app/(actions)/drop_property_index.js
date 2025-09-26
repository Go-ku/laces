"use server";

import { connectDB } from "@/lib/db";
import Property from "@/lib/models/Property";

/**
 * Drops the stray propertyRef_1 index from MongoDB.
 * Run this action once (e.g. from a button or route).
 */
export async function dropPropertyRefIndex() {
  await connectDB();

  try {
    const result = await Property.collection.dropIndex("propertyRef_1");
    return { ok: true, message: `Dropped index: ${result}` };
  } catch (err) {
    // Index might not exist, so handle gracefully
    if (err.codeName === "IndexNotFound") {
      return { ok: true, message: "Index not found (already removed)" };
    }
    console.error("❌ Failed to drop index", err);
    return { ok: false, error: err.message };
  }
}
