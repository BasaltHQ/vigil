import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';

const getStripe = () => new Stripe(process.env.STRIPE_API_KEY as string, {
  apiVersion: '2023-10-16' as any,
});

const getWebhookSecret = () => process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, getWebhookSecret());
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const priceId = session.metadata?.priceId;

        if (userId && session.subscription) {
          let newTier = 'starter';
          if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL) newTier = 'pro';
          if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_FIRM || priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_FIRM_ANNUAL) newTier = 'firm';
          if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_ANNUAL) newTier = 'enterprise';

          await (prisma as any).profile.update({
            where: { id: userId },
            data: {
              stripeSubscriptionId: session.subscription as string,
              stripePriceId: priceId,
              tier: newTier,
            },
          });
        }
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0].price.id;
        const status = subscription.status;

        const profile = await (prisma as any).profile.findFirst({
          where: { stripeCustomerId: customerId }
        });

        if (profile) {
          let newTier = 'starter';
          if (status === 'active' || status === 'trialing') {
            if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL) newTier = 'pro';
            if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_FIRM || priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_FIRM_ANNUAL) newTier = 'firm';
            if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_ANNUAL) newTier = 'enterprise';
          }

          await (prisma as any).profile.update({
            where: { id: profile.id },
            data: {
              stripeSubscriptionId: subscription.id,
              stripePriceId: priceId,
              tier: newTier,
            },
          });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const profile = await (prisma as any).profile.findFirst({
          where: { stripeCustomerId: customerId }
        });

        if (profile) {
          await (prisma as any).profile.update({
            where: { id: profile.id },
            data: {
              stripeSubscriptionId: null,
              stripePriceId: null,
              tier: 'starter',
            },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[STRIPE WEBHOOK ERROR]', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
