import Link from "next/link";

export default function CheckoutReturnPage() {
  return (
    <main className="page-wrap checkout-page">
      <p className="eyebrow">PAYMENT TEST</p>
      <h1>THANK YOU.</h1>
      <p>This was a Stripe test checkout. No real charge was made and no food will be delivered.</p>
      <p>Payment confirmation is recorded by Stripe, not by this return page.</p>
      <Link className="button primary" href="/menu">BACK TO MENU</Link>
    </main>
  );
}
