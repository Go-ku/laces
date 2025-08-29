import mongoose from "mongoose";

const NextOfKinSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    relationship: String,
  },
  { _id: false }
);

const TenantSchema = new mongoose.Schema(
  {
    // From: Name, NRC, Permanent address, Contact number, Next of kin, Employer
    name: { type: String, required: true, trim: true },
    nrc: { type: String, trim: true, index: true }, // set unique if you want: unique: true
    permanentAddress: { type: String, trim: true },
    contactNumber: { type: String, trim: true },
    nextOfKin: NextOfKinSchema,
    employer: { type: String, trim: true },

    // Optional: lifecycle/status
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.models.Tenant || mongoose.model("Tenant", TenantSchema);
