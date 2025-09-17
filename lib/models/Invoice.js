import { tenantCreateSchema } from "@/app/(actions)/zod/tenant";
import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema({
  amount: Number,
  lease: { type: mongoose.Schema.Types.ObjectId, ref: "Lease" },
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
  property: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
  dueDate: Date,
  status: String,
});

export default mongoose.models.Invoice ||
  mongoose.model("Invoice", InvoiceSchema);
