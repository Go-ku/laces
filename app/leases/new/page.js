import { createLease } from "@/app/(actions)/leases";
import LeaseForm from "./LeaseForm";
import { connectDB } from "@/lib/db";
import Property from "@/lib/models/Property";
import Tenant from "@/lib/models/Tenant";

export default async function NewLeasePage() {
  await connectDB();
  const [properties, tenants] = await Promise.all([
    Property.find({}, "_id name").lean(),
    Tenant.find({}, "_id name").lean(),
  ]);

  const options = {
    properties: properties.map((p) => ({ id: String(p._id), name: p.name })),
    tenants: tenants.map((t) => ({ id: String(t._id), name: t.name })),
  };

  return <LeaseForm action={createLease} options={options} />;
}
