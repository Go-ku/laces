import { z } from "zod";

export const leaseCreateSchema = z.object({
  propertyId: z.string().min(1, "Select property"),
  tenantId: z.string().min(1, "Select tenant"),

  rentAmount: z
    .string()
    .min(1, "Enter rent")
    .transform((s) => Number(s.replace(/[^\d.]/g, "")))
    .refine((n) => n > 0, "Rent must be > 0"),

  rentStatus: z
    .enum(["current", "partial", "overdue", "in_arrears", "paid_ahead"])
    .optional(),
  dueDay: z.coerce.number().int().min(1).max(31),
  monthsOwing: z.coerce.number().int().min(0).default(0),

  securityHeld: z.coerce.boolean().optional(),
  securityAmount: z
    .string()
    .optional()
    .transform((s) => (s ? Number(s.replace(/[^\d.]/g, "")) : 0)),

  startDate: z
    .string()
    .min(1, "Start date is required")
    .transform((s) => new Date(s)),

  totalAmountOwing: z
    .string()
    .optional()
    .transform((s) => (s ? Number(s.replace(/[^\d.]/g, "")) : 0)),
});
