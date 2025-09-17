import { connectDB } from "@/lib/db";
import Invoice from "@/lib/models/Invoice";
import { serializeDoc } from "@/lib/utils/serialize";
import PaymentForm from "./PaymentForm";
export default async function PaymentPage() {
  await connectDB();
  const invoice = await Invoice.findOne().lean();
  const inv = {
    ...invoice,
    _id: invoice._id.toString(),
    lease: invoice.lease?.toString?.(),
    tenant: invoice.tenant?.toString?.(),
    property: invoice.property?.toString?.(),
    dueDate: invoice.dueDate?.toISOString?.(),
    issuedAt: invoice.issuedAt?.toISOString?.(),
    createdAt: invoice.createdAt?.toISOString?.(),
    updatedAt: invoice.updatedAt?.toISOString?.(),
  };
  console.log(inv);

  return (
    <>
      <PaymentForm inv={inv} />
    </>
  );
}
