export default function PaymentForm({ inv }) {
  return (
    <>
      <h1>{inv.lease}</h1>
      <p>Paid by `${inv.tenant}`</p>
    </>
  );
}
