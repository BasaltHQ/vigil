import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';
import { thirdwebAuth } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_API_KEY as string, {
  apiVersion: '2023-10-16' as any,
});

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("thirdweb_auth_token")?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const authResult = await thirdwebAuth.verifyJWT({ jwt: token });
    if (!authResult.valid || !authResult.parsedJWT.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResult.parsedJWT.sub;
    const profile = await prisma.profile.findUnique({ where: { id: userId } });
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    let customerId = (profile as any).stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email || undefined,
        metadata: { userId: profile.id },
      });
      customerId = customer.id;
      await (prisma as any).profile.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_TOPUP;
    if (!priceId) {
      return NextResponse.json({ error: 'Topup price not configured' }, { status: 500 });
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/settings?topup=success`,
      cancel_url: `${origin}/settings`,
      metadata: {
        userId: profile.id,
        type: 'token_topup',
        tokensToAdd: '1000000',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('[STRIPE TOPUP ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
