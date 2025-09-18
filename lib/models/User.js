import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String, required: true },
    // 👉 store a hashed password (bcrypt), never plain text

    phone: { type: String, trim: true }, // optional, for WhatsApp/SMS

    role: {
      type: String,
      enum: ["admin", "landlord", "tenant"],
      default: "tenant",
    },

    // Link landlord users to their properties
    properties: [{ type: mongoose.Schema.Types.ObjectId, ref: "Property" }],

    // Link tenant users to their leases
    leases: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lease" }],

    isActive: { type: Boolean, default: true },

    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

// Prevent model overwrite in dev/hot-reload
export default mongoose.models.User || mongoose.model("User", UserSchema);
