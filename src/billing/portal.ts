import Stripe from "stripe";

function getStripeClient(stripeClient?: Stripe): Stripe {
  if (stripeClient) {
    return stripeClient;
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  return new Stripe(secret);
}

export async function createBillingPortalSession(
  stripeCustomerId: string,
  returnUrl: string,
  stripeClient?: Stripe
): Promise<string> {
  if (!stripeCustomerId) {
    throw new Error("Missing stripeCustomerId");
  }

  if (!returnUrl) {
    throw new Error("Missing returnUrl");
  }

  const client = getStripeClient(stripeClient);
  const session = await client.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl
  });

  return session.url;
}