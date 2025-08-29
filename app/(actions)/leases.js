"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import Lease from "@/lib/models/Lease";
import Property from "@/lib/models/Property";
import Tenant from "@/lib/models/Tenant";
import { leaseCreateSchema } from "./zod/lease";

// Compute the next due date from (startDate, dueDay)
function computeNextDueDate(startDate, dueDay) {
  const now = new Date();
  const base = new Date(
    now.getFullYear(),
    now.getMonth(),
    Math.min(dueDay, 28)
  ); // safe day
  if (base < now) {
    base.setMonth(base.getMonth() + 1);
  }
  // If tenancy starts later than computed base, push forward
  if (startDate > base) {
    base.setMonth(startDate.getMonth());
    base.setFullYear(startDate.getFullYear());
    base.setDate(Math.min(dueDay, 28));
    if (base < startDate) base.setMonth(base.getMonth() + 1);
  }
  return base;
}

export async function createLease(formData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = leaseCreateSchema.safeParse(raw);

  if (!parsed.success) {
    const errors = {};
    for (const i of parsed.error.issues) errors[i.path[0]] = i.message;
    return { ok: false, errors };
  }

  await connectDB();

  // Validate refs exist
  const [prop, ten] = await Promise.all([
    Property.findById(parsed.data.propertyId).lean(),
    Tenant.findById(parsed.data.tenantId).lean(),
  ]);
  if (!prop) return { ok: false, errors: { propertyId: "Property not found" } };
  if (!ten) return { ok: false, errors: { tenantId: "Tenant not found" } };

  const nextDueDate = computeNextDueDate(
    parsed.data.startDate,
    parsed.data.dueDay
  );

  await Lease.create({
    property: prop._id,
    tenant: ten._id,

    rentAmount: parsed.data.rentAmount,
    rentStatus: parsed.data.rentStatus || "current",
    dueDay: parsed.data.dueDay,
    monthsOwing: parsed.data.monthsOwing ?? 0,

    securityHeld: Boolean(parsed.data.securityHeld),
    securityAmount: parsed.data.securityAmount ?? 0,

    startDate: parsed.data.startDate,
    totalAmountOwing: parsed.data.totalAmountOwing ?? 0,

    currency: "ZMW",
    paymentFrequency: "monthly",
    status: "active",
    nextDueDate,
  });

  revalidatePath("/leases");
  redirect("/leases?created=1");
}

export async function updateLease(id, formData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = leaseCreateSchema.safeParse(raw);
  if (!parsed.success) {
    const errors = {};
    for (const i of parsed.error.issues) errors[i.path[0]] = i.message;
    return { ok: false, errors };
  }

  await connectDB();
  const [prop, ten] = await Promise.all([
    Property.findById(parsed.data.propertyId).lean(),
    Tenant.findById(parsed.data.tenantId).lean(),
  ]);
  if (!prop) return { ok: false, errors: { propertyId: "Property not found" } };
  if (!ten) return { ok: false, errors: { tenantId: "Tenant not found" } };

  await Lease.findByIdAndUpdate(
    id,
    {
      property: prop._id,
      tenant: ten._id,
      rentAmount: parsed.data.rentAmount,
      rentStatus: parsed.data.rentStatus || "current",
      dueDay: parsed.data.dueDay,
      monthsOwing: parsed.data.monthsOwing ?? 0,
      securityHeld: Boolean(parsed.data.securityHeld),
      securityAmount: parsed.data.securityAmount ?? 0,
      startDate: parsed.data.startDate,
      totalAmountOwing: parsed.data.totalAmountOwing ?? 0,
    },
    { new: true }
  );

  revalidatePath("/leases");
  redirect(`/leases?updated=1`);
}
