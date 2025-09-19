"use client";

import { useRef } from "react";
import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";
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

/* ----------------- helpers ----------------- */
function maskCurrency(value) {
  const cleaned = (value || "").replace(/[^\d.]/g, "");
  const [i, d] = cleaned.split(".");
  const intWithCommas = (i || "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const dec = d != null ? "." + d.slice(0, 2) : "";
  return intWithCommas + dec;
}

/* Server error readers */
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

/* ----------------- client zod ----------------- */
const clientSchema = z
  .object({
    name: z.string().min(2, "Property name is required"),
    standNumber: z.string().optional(),
    address: z.string().optional(),
    town: z.string().min(1, "Town is required"),
    purchasePrice: z.string().optional(),
    yearPurchased: z.string().optional(),
    rentPerMonth: z.string().optional(),
    status: z.enum(["vacant", "occupied", "under_maintenance", "inactive"], {
      required_error: "Select status",
    }),
    ratesStatus: z.enum(["paid", "due", "overdue", "exempt"], {
      required_error: "Select rates status",
    }),
    tenant: z.string().optional(),
    sqm: z.string().optional(),
    dateLastOccupied: z.string().optional(),
    landlord: z.string().optional(),
    hasTitleDeed: z.boolean().default(false),
    titleDeedRef: z.string().optional(),
    bedrooms: z.string().optional(),
    propertyType: z.enum(
      ["house", "apartment", "commercial", "plot", "other"],
      { required_error: "Choose a property type" }
    ),
  })
  .superRefine((val, ctx) => {
    if (val.hasTitleDeed && !val.titleDeedRef) {
      ctx.addIssue({
        path: ["titleDeedRef"],
        code: z.ZodIssueCode.custom,
        message: "Provide Title Deed reference",
      });
    }
  });

/* ----------------- Main Form ----------------- */
export default function PropertyForm({ action, options }) {
  const formRef = useRef(null);
  const { towns = [], tenants = [] } = options || {};

  const methods = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      standNumber: "",
      address: "",
      town: "",
      purchasePrice: "",
      yearPurchased: "",
      rentPerMonth: "",
      status: "vacant",
      ratesStatus: "due",
      tenant: "",
      sqm: "",
      dateLastOccupied: "",
      landlord: "",
      hasTitleDeed: false,
      titleDeedRef: "",
      bedrooms: "",
      propertyType: "",
    },
    mode: "onSubmit",
  });

  const { register, setValue, watch, formState } = methods;
  const { errors, isSubmitting } = formState;
  const { pending } = useFormStatus();
  const hasDeed = watch("hasTitleDeed");

  return (
    <FormProvider {...methods}>
      <form
        ref={formRef}
        action={action}
        className="max-w-3xl mx-auto space-y-6"
      >
        <div className="grid gap-1">
          <Label htmlFor="name">Property Name</Label>
          <Input id="name" {...register("name")} />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
          <ServerFieldError name="name" />
        </div>

        <div className="grid gap-1">
          <Label htmlFor="standNumber">Stand/Plot No.</Label>
          <Input id="standNumber" {...register("standNumber")} />
        </div>

        <div className="grid gap-1">
          <Label htmlFor="address">Address</Label>
          <Input id="address" {...register("address")} />
        </div>

        <div className="grid gap-1">
          <Label>Town</Label>
          <Select onValueChange={(v) => setValue("town", v)} defaultValue="">
            <SelectTrigger>
              <SelectValue placeholder="Select town" />
            </SelectTrigger>
            <SelectContent>
              {towns.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" {...register("town")} />
          {errors.town && (
            <p className="text-sm text-red-600">{errors.town.message}</p>
          )}
        </div>

        <div className="grid gap-1">
          <Label htmlFor="sqm">sqm</Label>
          <Input id="sqm" {...register("sqm")} inputMode="numeric" />
        </div>

        <div className="grid gap-1">
          <Label htmlFor="bedrooms">Number of Bedrooms</Label>
          <Input id="bedrooms" {...register("bedrooms")} inputMode="numeric" />
        </div>

        <div className="grid gap-1">
          <Label>Property type</Label>
          <Select
            onValueChange={(v) => setValue("propertyType", v)}
            defaultValue=""
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="plot">Plot</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" {...register("propertyType")} />
          <ServerFieldError name="propertyType" />
        </div>

        <div className="grid gap-1">
          <Label htmlFor="yearPurchased">Year Purchased</Label>
          <Input
            id="yearPurchased"
            {...register("yearPurchased")}
            inputMode="numeric"
          />
        </div>

        <div className="grid gap-1">
          <Label htmlFor="purchasePrice">Purchase Price (ZMW)</Label>
          <Input
            id="purchasePrice"
            {...register("purchasePrice")}
            onInput={(e) =>
              setValue("purchasePrice", maskCurrency(e.target.value))
            }
            inputMode="decimal"
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="hasTitleDeed"
            checked={!!hasDeed}
            onCheckedChange={(v) => setValue("hasTitleDeed", Boolean(v))}
          />
          <Label htmlFor="hasTitleDeed">Title deed available</Label>
        </div>

        {hasDeed && (
          <div className="grid gap-1">
            <Label htmlFor="titleDeedRef">Title Deed Ref</Label>
            <Input id="titleDeedRef" {...register("titleDeedRef")} />
            {errors.titleDeedRef && (
              <p className="text-sm text-red-600">
                {errors.titleDeedRef.message}
              </p>
            )}
            <ServerFieldError name="titleDeedRef" />
          </div>
        )}

        <div className="grid gap-1">
          <Label htmlFor="landlord">Landlord</Label>
          <Input
            id="landlord"
            {...register("landlord")}
            placeholder="(ObjectId or leave blank)"
          />
        </div>

        <div className="grid gap-1">
          <Label>Status</Label>
          <Select
            onValueChange={(v) => setValue("status", v)}
            defaultValue="vacant"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vacant">Vacant</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="under_maintenance">
                Under Maintenance
              </SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" {...register("status")} />
          <ServerFieldError name="status" />
        </div>

        <div className="grid gap-1">
          <Label>Rates status</Label>
          <Select
            onValueChange={(v) => setValue("ratesStatus", v)}
            defaultValue="due"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select rates status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="due">Due</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="exempt">Exempt</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" {...register("ratesStatus")} />
          <ServerFieldError name="ratesStatus" />
        </div>

        <div className="grid gap-1">
          <Label htmlFor="tenant">Tenant (optional)</Label>
          <Input
            id="tenant"
            {...register("tenant")}
            placeholder={tenants[0]?.name + " (example id)"}
          />
        </div>

        <div className="grid gap-1">
          <Label htmlFor="rentPerMonth">Rent per month (ZMW)</Label>
          <Input
            id="rentPerMonth"
            {...register("rentPerMonth")}
            onInput={(e) =>
              setValue("rentPerMonth", maskCurrency(e.target.value))
            }
            inputMode="decimal"
          />
        </div>

        <div className="grid gap-1">
          <Label htmlFor="dateLastOccupied">Date Last Occupied</Label>
          <Input
            id="dateLastOccupied"
            {...register("dateLastOccupied")}
            type="date"
          />
        </div>

        <ServerFormError />

        <Button type="submit" disabled={pending || isSubmitting}>
          {pending || isSubmitting ? "Saving…" : "Create Property"}
        </Button>
      </form>
    </FormProvider>
  );
}
