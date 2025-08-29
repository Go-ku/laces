"use client";

import { useRef, useMemo } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

/* -------- helpers -------- */
function maskCurrency(value) {
  const cleaned = (value || "").replace(/[^\d.]/g, "");
  const [i, d] = cleaned.split(".");
  const intWithCommas = (i || "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const dec = d != null ? "." + d.slice(0, 2) : "";
  return intWithCommas + dec;
}

/* -------- server-returned errors -------- */
function ServerFieldError({ name }) {
  const { data } = useFormStatus();
  const msg = data?.errors?.[name];
  if (!msg) return null;
  return <p className="text-sm text-red-600">{msg}</p>;
}
function ServerFormError() {
  const { data } = useFormStatus();
  const msg = data?.errors?._form;
  if (!msg) return null;
  return <p className="text-sm text-red-600">{msg}</p>;
}

/* -------- client Zod (matches server's leaseCreateSchema shape) -------- */
const formSchema = z
  .object({
    propertyId: z.string().min(1, "Select property"),
    tenantId: z.string().min(1, "Select tenant"),
    rentAmount: z.string().min(1, "Enter rent"),
    rentStatus: z
      .enum(["current", "partial", "overdue", "in_arrears", "paid_ahead"])
      .optional(),
    dueDay: z.coerce.number().int().min(1, "1–31").max(31, "1–31"),
    monthsOwing: z.coerce.number().int().min(0).default(0),
    securityHeld: z.boolean().optional(),
    securityAmount: z.string().optional(),
    startDate: z.string().min(1, "Start date required"),
    totalAmountOwing: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.securityHeld && !val.securityAmount) {
      ctx.addIssue({
        path: ["securityAmount"],
        code: z.ZodIssueCode.custom,
        message: "Enter deposit amount",
      });
    }
  });

export default function LeaseForm({ action, options }) {
  const formRef = useRef(null);
  const { properties, tenants } = options || { properties: [], tenants: [] };

  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => i + 1), []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyId: "",
      tenantId: "",
      rentAmount: "",
      rentStatus: "current",
      dueDay: 5,
      monthsOwing: 0,
      securityHeld: false,
      securityAmount: "",
      startDate: "",
      totalAmountOwing: "",
    },
  });

  const securityHeld = watch("securityHeld");
  const { pending } = useFormStatus();

  const onValid = () => formRef.current?.requestSubmit();

  return (
    <form ref={formRef} action={action} className="max-w-2xl space-y-5">
      <div className="grid gap-1">
        <Label>Property</Label>
        <Select
          onValueChange={(v) => setValue("propertyId", v)}
          defaultValue=""
        >
          <SelectTrigger>
            <SelectValue placeholder="Select property" />
          </SelectTrigger>
          <SelectContent>
            {properties.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.propertyId && (
          <p className="text-sm text-red-600">{errors.propertyId.message}</p>
        )}
        <ServerFieldError name="propertyId" />
      </div>

      <div className="grid gap-1">
        <Label>Tenant</Label>
        <Select onValueChange={(v) => setValue("tenantId", v)} defaultValue="">
          <SelectTrigger>
            <SelectValue placeholder="Select tenant" />
          </SelectTrigger>
          <SelectContent>
            {tenants.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.tenantId && (
          <p className="text-sm text-red-600">{errors.tenantId.message}</p>
        )}
        <ServerFieldError name="tenantId" />
      </div>

      <div className="grid gap-1">
        <Label htmlFor="rentAmount">Rent (ZMW)</Label>
        <Input
          id="rentAmount"
          {...register("rentAmount")}
          name="rentAmount"
          inputMode="decimal"
          onInput={(e) => setValue("rentAmount", maskCurrency(e.target.value))}
        />
        {errors.rentAmount && (
          <p className="text-sm text-red-600">{errors.rentAmount.message}</p>
        )}
        <ServerFieldError name="rentAmount" />
      </div>

      <div className="grid gap-1">
        <Label>Rent status</Label>
        <Select
          onValueChange={(v) => setValue("rentStatus", v)}
          defaultValue="current"
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Current</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="in_arrears">In arrears</SelectItem>
            <SelectItem value="paid_ahead">Paid ahead</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1">
        <Label>Rent due by (day of month)</Label>
        <Select
          onValueChange={(v) => setValue("dueDay", Number(v))}
          defaultValue="5"
        >
          <SelectTrigger>
            <SelectValue placeholder="Select day" />
          </SelectTrigger>
          <SelectContent>
            {days.map((d) => (
              <SelectItem key={d} value={String(d)}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.dueDay && (
          <p className="text-sm text-red-600">{errors.dueDay.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div className="flex items-center gap-2">
          <Checkbox
            id="securityHeld"
            checked={!!securityHeld}
            onCheckedChange={(v) => setValue("securityHeld", Boolean(v))}
          />
          <Label htmlFor="securityHeld">Security (deposit) held</Label>
        </div>

        <div className="grid gap-1 md:col-span-2">
          <Label htmlFor="securityAmount">Deposit Amount (ZMW)</Label>
          <Input
            id="securityAmount"
            {...register("securityAmount")}
            name="securityAmount"
            inputMode="decimal"
            onInput={(e) =>
              setValue("securityAmount", maskCurrency(e.target.value))
            }
            disabled={!securityHeld}
          />
          {errors.securityAmount && (
            <p className="text-sm text-red-600">
              {errors.securityAmount.message}
            </p>
          )}
          <ServerFieldError name="securityAmount" />
        </div>
      </div>

      <div className="grid gap-1">
        <Label htmlFor="startDate">Date tenancy commenced</Label>
        <Input
          id="startDate"
          type="date"
          {...register("startDate")}
          name="startDate"
        />
        {errors.startDate && (
          <p className="text-sm text-red-600">{errors.startDate.message}</p>
        )}
        <ServerFieldError name="startDate" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="grid gap-1">
          <Label htmlFor="monthsOwing">Months owing</Label>
          <Input
            id="monthsOwing"
            {...register("monthsOwing")}
            name="monthsOwing"
            inputMode="numeric"
          />
          {errors.monthsOwing && (
            <p className="text-sm text-red-600">{errors.monthsOwing.message}</p>
          )}
          <ServerFieldError name="monthsOwing" />
        </div>

        <div className="grid gap-1">
          <Label htmlFor="totalAmountOwing">
            Total amount owing (optional)
          </Label>
          <Input
            id="totalAmountOwing"
            {...register("totalAmountOwing")}
            name="totalAmountOwing"
            inputMode="decimal"
            onInput={(e) =>
              setValue("totalAmountOwing", maskCurrency(e.target.value))
            }
          />
        </div>
      </div>

      <ServerFormError />

      <Button
        type="button"
        onClick={handleSubmit(onValid)}
        disabled={pending || isSubmitting}
      >
        {pending || isSubmitting ? "Creating…" : "Create Lease"}
      </Button>
    </form>
  );
}
