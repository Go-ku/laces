"use client";

import { useRef, useState } from "react";
import { z } from "zod";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormStatus } from "react-dom";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
    town: z.string().optional(),

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

/* ----------------- Steps ----------------- */
function StepBasics({ towns }) {
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext();
  return (
    <div className="space-y-4">
      <div className="grid gap-1">
        <Label htmlFor="name">Property Name</Label>
        <Input id="name" {...register("name")} name="name" />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
        <ServerFieldError name="name" />
      </div>

      <div className="grid gap-1">
        <Label htmlFor="standNumber">Stand/Plot No.</Label>
        <Input
          id="standNumber"
          {...register("standNumber")}
          name="standNumber"
        />
      </div>

      <div className="grid gap-1">
        <Label htmlFor="address">Address</Label>
        <Input id="address" {...register("address")} name="address" />
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
      </div>

      <div className="grid gap-1">
        <Label htmlFor="sqm">sqm</Label>
        <Input id="sqm" {...register("sqm")} name="sqm" inputMode="numeric" />
      </div>

      <div className="grid gap-1">
        <Label htmlFor="bedrooms">Number of Bedrooms</Label>
        <Input
          id="bedrooms"
          {...register("bedrooms")}
          name="bedrooms"
          inputMode="numeric"
        />
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
        <ServerFieldError name="propertyType" />
      </div>
    </div>
  );
}

function StepOwnership() {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext();
  const hasDeed = watch("hasTitleDeed");

  return (
    <div className="space-y-4">
      <div className="grid gap-1">
        <Label htmlFor="yearPurchased">Year Purchased</Label>
        <Input
          id="yearPurchased"
          {...register("yearPurchased")}
          name="yearPurchased"
          inputMode="numeric"
          placeholder="e.g. 2020"
        />
      </div>

      <div className="grid gap-1">
        <Label htmlFor="purchasePrice">Purchase Price (ZMW)</Label>
        <Input
          id="purchasePrice"
          {...register("purchasePrice")}
          name="purchasePrice"
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
          <Input
            id="titleDeedRef"
            {...register("titleDeedRef")}
            name="titleDeedRef"
          />
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
          name="landlord"
          placeholder="(ObjectId or leave blank)"
        />
      </div>
    </div>
  );
}

function StepLeasing({ tenants }) {
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext();
  return (
    <div className="space-y-4">
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
            <SelectItem value="under_maintenance">Under Maintenance</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
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
        <ServerFieldError name="ratesStatus" />
      </div>

      <div className="grid gap-1">
        <Label htmlFor="tenant">Tenant (optional)</Label>
        {/* Replace with a Select if you load real tenants */}
        <Input
          id="tenant"
          {...register("tenant")}
          name="tenant"
          placeholder={tenants[0]?.name + " (example id)"}
        />
      </div>

      <div className="grid gap-1">
        <Label htmlFor="rentPerMonth">Rent per month (ZMW)</Label>
        <Input
          id="rentPerMonth"
          {...register("rentPerMonth")}
          name="rentPerMonth"
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
          name="dateLastOccupied"
          type="date"
        />
      </div>
    </div>
  );
}

/* ----------------- Main Form ----------------- */
export default function PropertyForm({ action, options }) {
  const formRef = useRef(null);
  const [tab, setTab] = useState("basics");
  const { towns, tenants } = options || { towns: [], tenants: [] };

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

  const {
    trigger,
    formState: { isSubmitting },
  } = methods;
  const { pending } = useFormStatus();

  async function nextFrom(current) {
    if (current === "basics") {
      const ok = await trigger([
        "name",
        "standNumber",
        "address",
        "town",
        "sqm",
        "bedrooms",
        "propertyType",
      ]);
      if (!ok) return;
      setTab("ownership");
    } else if (current === "ownership") {
      const ok = await trigger([
        "yearPurchased",
        "purchasePrice",
        "hasTitleDeed",
        "titleDeedRef",
        "landlord",
      ]);
      if (!ok) return;
      setTab("leasing");
    }
  }
  function back() {
    setTab((t) => (t === "leasing" ? "ownership" : "basics"));
  }
  function submitToServer() {
    formRef.current?.requestSubmit();
  }

  return (
    <FormProvider {...methods}>
      <form
        ref={formRef}
        action={action}
        className="max-w-3xl mx-auto space-y-6"
      >
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="ownership">Ownership</TabsTrigger>
            <TabsTrigger value="leasing">Leasing</TabsTrigger>
          </TabsList>

          <TabsContent value="basics">
            <StepBasics towns={towns} />
          </TabsContent>
          <TabsContent value="ownership">
            <StepOwnership />
          </TabsContent>
          <TabsContent value="leasing">
            <StepLeasing tenants={tenants} />
          </TabsContent>
        </Tabs>

        <ServerFormError />

        <div className="flex gap-3">
          {tab !== "basics" && (
            <Button type="button" variant="outline" onClick={back}>
              Back
            </Button>
          )}
          {tab !== "leasing" && (
            <Button
              type="button"
              onClick={() => nextFrom(tab)}
              disabled={pending || isSubmitting}
            >
              Next
            </Button>
          )}
          {tab === "leasing" && (
            <Button
              type="button"
              onClick={submitToServer}
              disabled={pending || isSubmitting}
            >
              {pending || isSubmitting ? "Saving…" : "Create Property"}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
