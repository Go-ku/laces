import { createProperty } from "@/app/(actions)/properties";
import Tenant from "@/lib/models/Tenant";
import User from "@/lib/models/User";
import { connectDB } from "@/lib/db";

export default async function NewPropertyPage() {
  await connectDB();
  const tenants = await Tenant.find({}, "_id name").lean();
  const landlords = await User.find({ role: "landlord" }, "_id name").lean();

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
