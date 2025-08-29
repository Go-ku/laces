import mongoose from "mongoose";

const LeaseSchema = new mongoose.Schema(
  {
    // Relations
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    // From your list (normalized to lease context)
    // Property rented    -> property ref above
    // Rent               -> rentAmount
    rentAmount: { type: Number, required: true }, // ZMW per period
    // Rent status        -> rentStatus
    rentStatus: {
      type: String,
      enum: ["current", "partial", "overdue", "in_arrears", "paid_ahead"],
      default: "current",
      index: true,
    },
    // Rent due by (interpret as day-of-month to support monthly billing)
    dueDay: { type: Number, min: 1, max: 31, required: true }, // e.g., 5 means due every month on the 5th
    // Months owing
    monthsOwing: { type: Number, default: 0, min: 0 },

    // Security                -> whether a deposit is held + amount
    securityHeld: { type: Boolean, default: false },
    securityAmount: { type: Number, default: 0 }, // "Security amount"

    // Date tenancy commenced  -> startDate
    startDate: { type: Date, required: true },

    // Total amount owing (can be derived; stored for fast dashboards)
    totalAmountOwing: { type: Number, default: 0 },

    // Nice-to-haves for ops
    currency: { type: String, default: "ZMW" },
    paymentFrequency: { type: String, enum: ["monthly"], default: "monthly" },
    status: {
      type: String,
      enum: ["active", "terminated", "pending", "expired"],
      default: "active",
      index: true,
    },

    // Audit/automation helpers
    lastInvoicedAt: { type: Date },
    nextDueDate: { type: Date },
    terminatedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

// Helpful indexes
LeaseSchema.index({ tenant: 1, property: 1, status: 1 });
LeaseSchema.index({ nextDueDate: 1 });

export default mongoose.models.Lease || mongoose.model("Lease", LeaseSchema);
