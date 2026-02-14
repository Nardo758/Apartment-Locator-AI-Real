import type { Express, Request, Response } from "express";
import { db } from "../db";
import { purchases, subscriptions, invoices, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { getUncachableStripeClient } from "../stripeClient";
import { sql } from "drizzle-orm";
import { getFrontendUrl } from "../lib/frontend-url";

const PLAN_AMOUNTS: Record<string, number> = {
  per_property: 199,
  basic: 999,
  pro: 2999,
  premium: 9999,
};

const PLAN_LABELS: Record<string, string> = {
  per_property: 'Single Property Unlock',
  basic: 'Basic — 7 days',
  pro: 'Pro — 30 days',
  premium: 'Premium — 90 days',
};

export function registerPaymentRoutes(app: Express): void {

  app.post("/api/payments/create-intent", async (req: Request, res: Response) => {
    try {
      const stripe = await getUncachableStripeClient();

      const { planId, guestEmail, guestName, propertyId } = req.body;

      const amount = PLAN_AMOUNTS[planId] || PLAN_AMOUNTS.pro;
      const description = PLAN_LABELS[planId] || 'ApartmentIQ - Full Access';

      const intentParams: any = {
        amount,
        currency: 'usd',
        description,
        metadata: {
          planId: planId || 'pro',
          ...(propertyId ? { propertyId } : {}),
          ...(guestEmail ? { guestEmail } : {}),
        },
      };

      if (guestEmail) {
        const existingCustomers = await stripe.customers.list({ email: guestEmail, limit: 1 });
        let customer;
        if (existingCustomers.data.length > 0) {
          customer = existingCustomers.data[0];
        } else {
          customer = await stripe.customers.create({
            email: guestEmail,
            name: guestName || undefined,
          });
        }
        intentParams.customer = customer.id;
      }

      const paymentIntent = await stripe.paymentIntents.create(intentParams);

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Create intent error:", error.message);
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });

  app.post("/api/payments/verify", async (req: Request, res: Response) => {
    try {
      const stripe = await getUncachableStripeClient();

      const { paymentIntentId } = req.body;

      if (!paymentIntentId) {
        return res.status(400).json({ error: "paymentIntentId is required" });
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ error: "Payment has not succeeded", status: paymentIntent.status });
      }

      const planId = paymentIntent.metadata?.planId;
      const propertyId = paymentIntent.metadata?.propertyId;
      const guestEmail = paymentIntent.metadata?.guestEmail;

      if (guestEmail) {
        const [existingUser] = await db.select().from(users).where(eq(users.email, guestEmail.toLowerCase()));

        if (existingUser) {
          if (planId === 'per_property' && propertyId) {
            console.log(`Property ${propertyId} unlocked for user ${existingUser.id}`);
          } else {
            const daysMap: Record<string, number> = { basic: 7, pro: 30, premium: 90 };
            const days = daysMap[planId || ''] || 30;
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + days);

            await db.update(users).set({
              accessExpiresAt: expiresAt,
              accessPlanType: planId || 'pro',
              propertyAnalysesUsed: 0,
              propertyAnalysesLimit: planId === 'basic' ? 5 : null,
              subscriptionTier: planId || 'pro',
              subscriptionStatus: 'active',
            }).where(eq(users.id, existingUser.id));
          }
        }
      }

      res.json({
        success: true,
        planId,
        propertyId: propertyId || null,
      });
    } catch (error: any) {
      console.error("Verify payment error:", error.message);
      res.status(500).json({ error: "Failed to verify payment" });
    }
  });

  app.post("/api/payments/create-renter-checkout", async (req: Request, res: Response) => {
    try {
      const stripe = await getUncachableStripeClient();

      const { email, name, userId } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      let customer;
      const existingCustomers = await stripe.customers.list({ email, limit: 1 });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        customer = await stripe.customers.create({
          email,
          name,
          metadata: { userId: userId || '', userType: 'renter' }
        });
      }

      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'ApartmentIQ - Full Access',
              description: 'One-time payment for full platform access'
            },
            unit_amount: 4900,
          },
          quantity: 1,
        }],
        success_url: `${getFrontendUrl()}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${getFrontendUrl()}/pricing?canceled=true`,
        metadata: {
          userId: userId || '',
          email,
          userType: 'renter',
          productType: 'one_time_unlock'
        }
      });

      res.json({
        sessionId: session.id,
        url: session.url,
        customerId: customer.id
      });
    } catch (error: any) {
      console.error("Create renter checkout error:", error.message);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  app.post("/api/payments/create-subscription-checkout", async (req: Request, res: Response) => {
    try {
      const stripe = await getUncachableStripeClient();

      const { email, name, userId, priceId } = req.body;

      if (!email || !priceId) {
        return res.status(400).json({ error: "Email and priceId are required" });
      }

      let customer;
      const existingCustomers = await stripe.customers.list({ email, limit: 1 });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        customer = await stripe.customers.create({
          email,
          name,
          metadata: { userId: userId || '' }
        });
      }

      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${getFrontendUrl()}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${getFrontendUrl()}/pricing?canceled=true`,
        metadata: {
          userId: userId || '',
          email,
        }
      });

      res.json({
        sessionId: session.id,
        url: session.url,
        customerId: customer.id
      });
    } catch (error: any) {
      console.error("Create subscription checkout error:", error.message);
      res.status(500).json({ error: "Failed to create subscription checkout" });
    }
  });

  app.post("/api/payments/cancel-subscription", async (req: Request, res: Response) => {
    try {
      const stripe = await getUncachableStripeClient();

      const { subscriptionId, cancelImmediately } = req.body;

      if (!subscriptionId) {
        return res.status(400).json({ error: "Subscription ID is required" });
      }

      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: !cancelImmediately
      });

      if (cancelImmediately) {
        await stripe.subscriptions.cancel(subscriptionId);
      }

      await db.update(subscriptions)
        .set({
          cancelAtPeriodEnd: !cancelImmediately,
          canceledAt: cancelImmediately ? new Date() : null,
          updatedAt: new Date()
        })
        .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));

      res.json({
        success: true,
        subscription,
        message: cancelImmediately ? 'Subscription canceled immediately' : 'Subscription will cancel at period end'
      });
    } catch (error: any) {
      console.error("Cancel subscription error:", error.message);
      res.status(500).json({ error: "Failed to cancel subscription" });
    }
  });

  app.get("/api/payments/subscription-status/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      const userSubscriptions = await db.select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId));

      const activeSubscription = userSubscriptions.find(s =>
        s.status === 'active' || s.status === 'trialing'
      );

      const userInvoices = await db.select()
        .from(invoices)
        .where(eq(invoices.userId, userId))
        .limit(10);

      res.json({
        hasActiveSubscription: !!activeSubscription,
        subscription: activeSubscription || null,
        invoices: userInvoices
      });
    } catch (error: any) {
      console.error("Get subscription status error:", error.message);
      res.status(500).json({ error: "Failed to get subscription status" });
    }
  });

  app.get("/api/payments/status", async (req: Request, res: Response) => {
    try {
      const { email, userId } = req.query;

      if (!email && !userId) {
        return res.status(400).json({ error: "Email or userId is required" });
      }

      let userPurchases;
      if (userId) {
        userPurchases = await db.select()
          .from(purchases)
          .where(eq(purchases.userId, userId as string));
      } else {
        userPurchases = await db.select()
          .from(purchases)
          .where(eq(purchases.guestEmail, email as string));
      }

      const hasUnlocked = userPurchases.some(p => p.status === "completed");
      const latestPurchase = userPurchases
        .filter(p => p.status === "completed")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      res.json({
        hasUnlocked,
        purchase: latestPurchase || null,
        totalPurchases: userPurchases.length,
      });
    } catch (error: any) {
      console.error("Check payment status error:", error.message);
      res.status(500).json({ error: "Failed to check payment status" });
    }
  });

  app.get("/api/stripe/publishable-key", async (_req: Request, res: Response) => {
    try {
      const { getStripePublishableKey } = await import('../stripeClient');
      const key = await getStripePublishableKey();
      res.json({ publishableKey: key });
    } catch (error: any) {
      console.error("Get publishable key error:", error.message);
      res.status(500).json({ error: "Stripe not configured" });
    }
  });
}
