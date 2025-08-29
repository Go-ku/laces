import { connectDB } from "@/lib/db";
import Tenant from "@/lib/models/Tenant";
import TenantForm from "@/app/tenants/new/TenantForm";
import { updateTenant } from "@/app/(actions)/tenants.update";

export default async function EditTenantPage({ params }) {
  await connectDB();
  const t = await Tenant.findById(params.id).lean();
  if (!t) return <div className="p-6">Tenant not found.</div>;

  const initial = {
    name: t.name || "",
    nrc: t.nrc || "",
    permanentAddress: t.permanentAddress || "",
    contactNumber: t.contactNumber || "",
    nokName: t.nextOfKin?.name || "",
    nokPhone: t.nextOfKin?.phone || "",
    nokRelationship: t.nextOfKin?.relationship || "",
    employer: t.employer || "",
  };

  // wrap the server action to bind id; form will call action(formData)
  async function action(formData) {
    "use server";
    return updateTenant(params.id, formData);
  }

  return <TenantForm action={action} initialData={initial} mode="edit" />;
}
