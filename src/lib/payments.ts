// Violet payments — DEMO checkout by default, Stripe integration point.
//
// PLACEHOLDER, stated honestly: until STRIPE_SECRET_KEY is set, checkout does
// NOT charge any card. It records the order as payment:"demo" so the full
// purchase flow (buy -> library -> read/listen/watch) can be tested end to
// end. Set the Stripe keys to switch to real payments.
export async function checkout({ amountCents, description, email }: { amountCents: number; description: string; email?: string }) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      status: 'demo' as const,
      payment: 'demo',
      note: 'DEMO checkout — no card was charged. Set STRIPE_SECRET_KEY for real payments.',
      amount_cents: amountCents,
      description,
      email: email || '',
    };
  }
  // --- REAL STRIPE PATH (requires STRIPE_SECRET_KEY) ---
  // TODO: replace this stub with a Stripe PaymentIntent (npm i stripe):
  //   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  //   const intent = await stripe.paymentIntents.create({
  //     amount: amountCents, currency: 'usd', description, receipt_email: email,
  //   });
  throw new Error('stripe_not_wired: STRIPE_SECRET_KEY is set but the Stripe call is not implemented yet — see src/lib/payments.ts');
}

export function priceLabel(cents: number): string {
  return cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}`;
}
