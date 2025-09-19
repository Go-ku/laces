import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Tenant from "@/lib/models/Tenant";
import PropertyForm from "./PropertyForm";
import { createProperty } from "@/app/(actions)/properties";

export default async function NewPropertyPage() {
  await connectDB();

  const tenantsRaw = await Tenant.find({}, "_id name").lean();
  const landlordsRaw = await User.find({ role: "landlord" }, "_id name").lean();

  const tenants = tenantsRaw.map((t) => ({
    id: t._id.toString(),
    name: t.name,
  }));

  const landlords = landlordsRaw.map((l) => ({
    id: l._id.toString(),
    name: l.name,
  }));

  const options = {
    tenants,
    landlords,
    towns: ["Lusaka", "Ndola", "Kitwe", "Solwezi", "Kalumbila", "Chingola"],
  };

  const PropertyForm = (await import("./PropertyForm")).default;

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full">
        <PropertyForm action={createProperty} options={options} />
      </div>
    </div>
  );
}
