"use client";

import { useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

/* -------- server-returned error readers -------- */
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

/* -------- client Zod schema (simple, mirrors server) -------- */
const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  nrc: z.string().optional(),
  permanentAddress: z.string().optional(),
  contactNumber: z.string().optional(),
  nokName: z.string().optional(),
  nokPhone: z.string().optional(),
  nokRelationship: z.string().optional(),
  employer: z.string().optional(),
});

export default function TenantForm({ action, initialData, mode = "create" }) {
  const formRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      nrc: "",
      permanentAddress: "",
      contactNumber: "",
      nokName: "",
      nokPhone: "",
      nokRelationship: "",
      employer: "",
    },
  });

  const { pending } = useFormStatus();

  const onValid = () => formRef.current?.requestSubmit();

  return (
    <form ref={formRef} action={action} className="max-w-xl space-y-5">
      <div className="grid gap-1">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} name="name" />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
        <ServerFieldError name="name" />
      </div>

      <div className="grid gap-1">
        <Label htmlFor="nrc">NRC</Label>
        <Input id="nrc" {...register("nrc")} name="nrc" />
      </div>

      <div className="grid gap-1">
        <Label htmlFor="permanentAddress">Permanent address</Label>
        <Input
          id="permanentAddress"
          {...register("permanentAddress")}
          name="permanentAddress"
        />
      </div>

      <div className="grid gap-1">
        <Label htmlFor="contactNumber">Contact number</Label>
        <Input
          id="contactNumber"
          {...register("contactNumber")}
          name="contactNumber"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="grid gap-1">
          <Label htmlFor="nokName">Next of kin - Name</Label>
          <Input id="nokName" {...register("nokName")} name="nokName" />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="nokPhone">Next of kin - Phone</Label>
          <Input id="nokPhone" {...register("nokPhone")} name="nokPhone" />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="nokRelationship">Relationship</Label>
          <Input
            id="nokRelationship"
            {...register("nokRelationship")}
            name="nokRelationship"
          />
        </div>
      </div>

      <div className="grid gap-1">
        <Label htmlFor="employer">Employer</Label>
        <Input id="employer" {...register("employer")} name="employer" />
      </div>

      <ServerFormError />

      <Button
        type="button"
        onClick={handleSubmit(onValid)}
        disabled={pending || isSubmitting}
      >
        {pending || isSubmitting
          ? mode === "edit"
            ? "Updating…"
            : "Saving…"
          : mode === "edit"
          ? "Update Tenant"
          : "Create Tenant"}
      </Button>
    </form>
  );
}
