import { createTenant } from "@/app/(actions)/tenants";
import TenantForm from "./TenantForm";

export default function NewTenantPage() {
  return <TenantForm action={createTenant} />;
}
