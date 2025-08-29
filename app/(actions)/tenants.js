"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import Tenant from "@/lib/models/Tenant";
import { tenantCreateSchema } from "./zod/tenant";

export async function createTenant(formData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = tenantCreateSchema.safeParse(raw);
  if (!parsed.success) {
    const errors = {};
    for (const i of parsed.error.issues) errors[i.path[0]] = i.message;
    return { ok: false, errors };
  }

  await connectDB();
  await Tenant.create({
    name: parsed.data.name.trim(),
    nrc: parsed.data.nrc || undefined,
    permanentAddress: parsed.data.permanentAddress || undefined,
    contactNumber: parsed.data.contactNumber || undefined,
    nextOfKin: {
      name: parsed.data.nokName || undefined,
      phone: parsed.data.nokPhone || undefined,
      relationship: parsed.data.nokRelationship || undefined,
    },
    employer: parsed.data.employer || undefined,
  });

  revalidatePath("/tenants");
  redirect("/tenants?created=1");
}

export async function updateTenant(id, formData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = tenantCreateSchema.safeParse(raw);
  if (!parsed.success) {
    const errors = {};
    for (const i of parsed.error.issues) errors[i.path[0]] = i.message;
    return { ok: false, errors };
  }

  await connectDB();

  await Tenant.findByIdAndUpdate(
    id,
    {
      name: parsed.data.name.trim(),
      nrc: parsed.data.nrc || undefined,
      permanentAddress: parsed.data.permanentAddress || undefined,
      contactNumber: parsed.data.contactNumber || undefined,
      nextOfKin: {
        name: parsed.data.nokName || undefined,
        phone: parsed.data.nokPhone || undefined,
        relationship: parsed.data.nokRelationship || undefined,
      },
      employer: parsed.data.employer || undefined,
    },
    { new: true }
  );

  revalidatePath("/tenants");
  redirect(`/tenants?updated=1`);
}
