import mongoose from "mongoose";

const PropertySchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Property Name
    standNumber: { type: String }, // Stand No./Plot No.
    address: { type: String }, // Address
    town: { type: String }, // Town

    purchasePrice: { type: Number, default: 0 }, // Purchase price
    yearPurchased: { type: Number }, // Year Purchased (YYYY)

    rentPerMonth: { type: Number, default: 0 }, // Rent per month

    status: {
      // Status
      type: String,
      enum: ["vacant", "occupied", "under_maintenance", "inactive"],
      default: "vacant",
    },

    ratesStatus: {
      // Rates status
      type: String,
      enum: ["paid", "due", "overdue", "exempt"],
      default: "due",
    },

    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" }, // Tenant (optional)

    sqm: { type: Number }, // sqm
    dateLastOccupied: { type: Date }, // Date Last Occupied

    landlord: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Landlord user

    hasTitleDeed: { type: Boolean, default: false }, // Title deed (yes/no)
    titleDeedRef: { type: String }, // optional reference number

    bedrooms: { type: Number }, // Number of Bedrooms
    propertyType: {
      // Property type
      type: String,
      enum: ["house", "apartment", "commercial", "plot", "other"],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Property ||
  mongoose.model("Property", PropertySchema);
