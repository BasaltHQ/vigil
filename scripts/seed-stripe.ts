import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const stripe = new Stripe(process.env.STRIPE_API_KEY as string, {
  apiVersion: '2023-10-16' as any,
});

async function main() {
  console.log('🌱 Seeding Stripe products and prices for BasaltVigil...');

  const products = [
    {
      name: 'BasaltVigil - Pro',
      description: 'Professional tier with 5M tokens per month.',
      price: 2999, // $29.99
    },
    {
      name: 'BasaltVigil - Firm',
      description: 'Firm tier with multi-agent swarms.',
      price: 14900, // $149.00
    },
    {
      name: 'BasaltVigil - Enterprise',
      description: 'Enterprise tier with custom SLAs and priority processing.',
      price: 29900, // $299.00
    },
  ];

  for (const p of products) {
    console.log(`Creating product: ${p.name}...`);
    const product = await stripe.products.create({
      name: p.name,
      description: p.description,
    });

    console.log(`Creating price for ${p.name}: $${(p.price / 100).toFixed(2)}/month...`);
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: p.price,
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
    });

    console.log(`✅ Created! Price ID: ${price.id}`);
  }

  console.log('🎉 Done. Please save these Price IDs to use them in your application.');
}

main().catch((err) => {
  console.error('Error seeding stripe:', err);
  process.exit(1);
});
