import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';
import { thirdwebAuth } from '@/lib/auth';

const getStripe = () => new Stripe(process.env.STRIPE_API_KEY as string, {
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
    const body = await req.json();
    const { priceId } = body;

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    const profile = await prisma.profile.findUnique({ where: { id: userId } });
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    let customerId = (profile as any).stripeCustomerId;

    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: profile.email || undefined,
        metadata: {
          userId: profile.id,
        },
      });
      customerId = customer.id;
      await (prisma as any).profile.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/settings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/settings`,
      metadata: {
        userId: profile.id,
        priceId: priceId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('[STRIPE CHECKOUT ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
