import { createProperty } from "@/app/(actions)/properties";
// import Tenant from "@/lib/models/Tenant";
// import User from "@/lib/models/User";
// import { connectDB } from "@/lib/db";

export default async function NewPropertyPage() {
  // await connectDB();
  // const tenants = await Tenant.find({}, "_id name").lean();
  // const landlords = await User.find({ role: "landlord" }, "_id name").lean();

  // For now, use placeholders:
  const tenants = [{ _id: "66aabbccddeeff0011223344", name: "John Tenant" }];
  const landlords = [
    { _id: "55ddeeff001122334466aabb", name: "Mary Landlord" },
  ];

  const options = {
    tenants,
    landlords,
    towns: ["Lusaka", "Ndola", "Kitwe", "Solwezi", "Kalumbila", "Chingola"],
  };

  const PropertyForm = (await import("./PropertyForm")).default;
  return <PropertyForm action={createProperty} options={options} />;
}
