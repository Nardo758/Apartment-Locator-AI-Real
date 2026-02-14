import { getUncachableStripeClient } from './stripeClient';

async function seedRenterProducts() {
  const stripe = await getUncachableStripeClient();

  console.log('Checking for existing ApartmentIQ products...');

  const existing = await stripe.products.search({ query: "metadata['app']:'apartmentiq'" });
  if (existing.data.length > 0) {
    console.log(`Found ${existing.data.length} existing products — skipping seed.`);
    for (const p of existing.data) {
      const prices = await stripe.prices.list({ product: p.id, active: true });
      console.log(`  ${p.name} (${p.id})`);
      for (const pr of prices.data) {
        console.log(`    Price: $${(pr.unit_amount || 0) / 100} ${pr.recurring ? `/ ${pr.recurring.interval}` : 'one-time'} (${pr.id})`);
      }
    }
    return;
  }

  console.log('Creating ApartmentIQ renter products...');

  const perPropertyProduct = await stripe.products.create({
    name: 'ApartmentIQ - Single Property Unlock',
    description: 'Unlock savings data for one property: deal score, savings estimate, and negotiation tips',
    metadata: { app: 'apartmentiq', planType: 'per_property', userType: 'renter' },
  });
  const perPropertyPrice = await stripe.prices.create({
    product: perPropertyProduct.id,
    unit_amount: 199,
    currency: 'usd',
    metadata: { planType: 'per_property' },
  });
  console.log(`Created: ${perPropertyProduct.name} — $1.99 one-time (${perPropertyPrice.id})`);

  const basicProduct = await stripe.products.create({
    name: 'ApartmentIQ - Basic Plan',
    description: '5 property analyses over 7 days with deal scores and savings estimates',
    metadata: { app: 'apartmentiq', planType: 'basic', userType: 'renter', durationDays: '7', analysesLimit: '5' },
  });
  const basicPrice = await stripe.prices.create({
    product: basicProduct.id,
    unit_amount: 999,
    currency: 'usd',
    metadata: { planType: 'basic' },
  });
  console.log(`Created: ${basicProduct.name} — $9.99 one-time (${basicPrice.id})`);

  const proProduct = await stripe.products.create({
    name: 'ApartmentIQ - Pro Plan',
    description: 'Unlimited analyses for 30 days with negotiation scripts and market intelligence',
    metadata: { app: 'apartmentiq', planType: 'pro', userType: 'renter', durationDays: '30' },
  });
  const proPrice = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 2999,
    currency: 'usd',
    metadata: { planType: 'pro' },
  });
  console.log(`Created: ${proProduct.name} — $29.99 one-time (${proPrice.id})`);

  const premiumProduct = await stripe.products.create({
    name: 'ApartmentIQ - Premium Plan',
    description: 'Unlimited analyses for 90 days with concierge support and priority access',
    metadata: { app: 'apartmentiq', planType: 'premium', userType: 'renter', durationDays: '90' },
  });
  const premiumPrice = await stripe.prices.create({
    product: premiumProduct.id,
    unit_amount: 9999,
    currency: 'usd',
    metadata: { planType: 'premium' },
  });
  console.log(`Created: ${premiumProduct.name} — $99.99 one-time (${premiumPrice.id})`);

  console.log('\nAll renter products created successfully!');
  console.log('Stripe webhooks will sync them to the database automatically.');
}

seedRenterProducts()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Failed to seed products:', err);
    process.exit(1);
  });
