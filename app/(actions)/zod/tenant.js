import { z } from "zod";

export const tenantCreateSchema = z.object({
  name: z.string().min(2, "Name is required"),
  nrc: z.string().optional(),
  permanentAddress: z.string().optional(),
  contactNumber: z.string().optional(),
  nokName: z.string().optional(),
  nokPhone: z.string().optional(),
  nokRelationship: z.string().optional(),
  employer: z.string().optional(),
});
