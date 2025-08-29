"use server";

import { revalidatePath, redirect } from "next/navigation";
import { z } from "zod";
// import { connectDB } from "@/lib/db";
import Property from "@/lib/models/Property";

// helpers
const toNum = (s) => {
  const n = Number((s || "").toString().replace(/[^\d.]/g, ""));
  return isNaN(n) ? 0 : n;
};
const toYear = (s) => {
  const y = Number(String(s || "").slice(0, 4));
  return isNaN(y) ? undefined : y;
};

const propertySchema = z
  .object({
    name: z.string().min(2, "Property name is required"),
    standNumber: z.string().optional(),
    address: z.string().optional(),
    town: z.string().optional(),

    purchasePrice: z.string().optional(), // masked currency in client
    yearPurchased: z.string().optional(), // "2020", "2023"

    rentPerMonth: z.string().optional(), // masked currency

    status: z.enum(["vacant", "occupied", "under_maintenance", "inactive"], {
      required_error: "Select status",
    }),
    ratesStatus: z.enum(["paid", "due", "overdue", "exempt"], {
      required_error: "Select rates status",
    }),

    tenant: z.string().optional(), // ObjectId string or ""

    sqm: z.string().optional(), // numeric string
    dateLastOccupied: z.string().optional(), // yyyy-mm-dd

    landlord: z.string().optional(), // ObjectId string or ""

    hasTitleDeed: z.enum(["true", "false"]).optional(), // toggle
    titleDeedRef: z.string().optional(),

    bedrooms: z.string().optional(), // numeric
    propertyType: z.enum(
      ["house", "apartment", "commercial", "plot", "other"],
      { required_error: "Choose a property type" }
    ),
  })
  .superRefine((val, ctx) => {
    // If title deed is true, ref is recommended
    if (val.hasTitleDeed === "true" && !val.titleDeedRef) {
      ctx.addIssue({
        path: ["titleDeedRef"],
        code: z.ZodIssueCode.custom,
        message: "Provide Title Deed reference",
      });
    }
  });

export async function createProperty(formData) {
  const raw = Object.fromEntries(formData.entries()); // grab everything

  const parsed = propertySchema.safeParse(raw);
  if (!parsed.success) {
    const errors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (!errors[key]) errors[key] = issue.message;
    }
    return { ok: false, errors };
  }

  try {
    // await connectDB();

    await Property.create({
      name: parsed.data.name.trim(),
      standNumber: parsed.data.standNumber || undefined,
      address: parsed.data.address || undefined,
      town: parsed.data.town || undefined,

      purchasePrice: toNum(parsed.data.purchasePrice || "0"),
      yearPurchased: toYear(parsed.data.yearPurchased || ""),

      rentPerMonth: toNum(parsed.data.rentPerMonth || "0"),

      status: parsed.data.status,
      ratesStatus: parsed.data.ratesStatus,

      tenant: parsed.data.tenant || undefined,

      sqm: parsed.data.sqm ? Number(parsed.data.sqm) : undefined,
      dateLastOccupied: parsed.data.dateLastOccupied
        ? new Date(parsed.data.dateLastOccupied)
        : undefined,

      landlord: parsed.data.landlord || undefined,

      hasTitleDeed: parsed.data.hasTitleDeed === "true",
      titleDeedRef: parsed.data.titleDeedRef || undefined,

      bedrooms: parsed.data.bedrooms ? Number(parsed.data.bedrooms) : undefined,
      propertyType: parsed.data.propertyType,
    });
  } catch (e) {
    console.error(e);
    return {
      ok: false,
      errors: { _form: "Failed to save property. Please try again." },
    };
  }

  revalidatePath("/properties");
  redirect("/properties?created=1");
}
