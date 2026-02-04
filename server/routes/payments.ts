import type { Express, Request, Response } from "express";
import Stripe from "stripe";
import { db } from "../db";
import { purchases, subscriptions, invoices, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import express from "express";

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-12-18" })
  : null;

// Stripe Price IDs - These should be set in environment variables for production
const PRICE_IDS = {
  // Renter one-time payment
  renter_unlock: process.env.STRIPE_PRICE_RENTER_UNLOCK || 'price_renter_unlock',
  
  // Landlord plans
  landlord_starter_monthly: process.env.STRIPE_PRICE_LANDLORD_STARTER_MONTHLY || 'price_landlord_starter_monthly',
  landlord_starter_annual: process.env.STRIPE_PRICE_LANDLORD_STARTER_ANNUAL || 'price_landlord_starter_annual',
  landlord_pro_monthly: process.env.STRIPE_PRICE_LANDLORD_PRO_MONTHLY || 'price_landlord_pro_monthly',
  landlord_pro_annual: process.env.STRIPE_PRICE_LANDLORD_PRO_ANNUAL || 'price_landlord_pro_annual',
  landlord_enterprise_monthly: process.env.STRIPE_PRICE_LANDLORD_ENTERPRISE_MONTHLY || 'price_landlord_enterprise_monthly',
  landlord_enterprise_annual: process.env.STRIPE_PRICE_LANDLORD_ENTERPRISE_ANNUAL || 'price_landlord_enterprise_annual',
  
  // Agent plans
  agent_basic_monthly: process.env.STRIPE_PRICE_AGENT_BASIC_MONTHLY || 'price_agent_basic_monthly',
  agent_basic_annual: process.env.STRIPE_PRICE_AGENT_BASIC_ANNUAL || 'price_agent_basic_annual',
  agent_team_monthly: process.env.STRIPE_PRICE_AGENT_TEAM_MONTHLY || 'price_agent_team_monthly',
  agent_team_annual: process.env.STRIPE_PRICE_AGENT_TEAM_ANNUAL || 'price_agent_team_annual',
  agent_brokerage_monthly: process.env.STRIPE_PRICE_AGENT_BROKERAGE_MONTHLY || 'price_agent_brokerage_monthly',
  agent_brokerage_annual: process.env.STRIPE_PRICE_AGENT_BROKERAGE_ANNUAL || 'price_agent_brokerage_annual',
};

export function registerPaymentRoutes(app: Express): void {
  
  // ============================================
  // RENTER: One-Time Payment ($49)
  // ============================================
  
  app.post("/api/payments/create-renter-checkout", async (req: Request, res: Response) => {
    try {
      if (!stripe) {
        return res.status(503).json({ 
          error: "Stripe not configured. Add STRIPE_SECRET_KEY to environment variables." 
        });
      }

      const { email, name, userId } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Create or get customer
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

      // Create checkout session for one-time payment
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Apartment Locator AI - Full Access',
              description: 'One-time payment for full platform access'
            },
            unit_amount: 4900, // $49.00
          },
          quantity: 1,
        }],
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/pricing?canceled=true`,
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
      console.error("Create renter checkout error:", error);
      res.status(500).json({ 
        error: "Failed to create checkout session",
        details: error.message 
      });
    }
  });

  // ============================================
  // LANDLORD & AGENT: Subscription Checkout
  // ============================================
  
  app.post("/api/payments/create-subscription-checkout", async (req: Request, res: Response) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: "Stripe not configured" });
      }

      const { email, name, userId, planType, interval } = req.body;
      // planType: landlord_starter, landlord_pro, landlord_enterprise, agent_basic, agent_team, agent_brokerage
      // interval: monthly, annual

      if (!email || !planType || !interval) {
        return res.status(400).json({ error: "Email, planType, and interval are required" });
      }

      // Get price ID based on plan and interval
      const priceKey = `${planType}_${interval === 'annual' ? 'annual' : 'monthly'}`;
      const priceId = PRICE_IDS[priceKey as keyof typeof PRICE_IDS];

      if (!priceId) {
        return res.status(400).json({ error: `Invalid plan type: ${planType}` });
      }

      // Create or get customer
      let customer;
      const existingCustomers = await stripe.customers.list({ email, limit: 1 });
      
      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        const userType = planType.startsWith('landlord') ? 'landlord' : 'agent';
        customer = await stripe.customers.create({
          email,
          name,
          metadata: { userId: userId || '', userType, planType }
        });
      }

      // Create checkout session for subscription
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/pricing?canceled=true`,
        subscription_data: {
          trial_period_days: planType.startsWith('landlord') ? 14 : 7, // 14 days for landlords, 7 for agents
          metadata: {
            userId: userId || '',
            planType,
            userType: planType.startsWith('landlord') ? 'landlord' : 'agent'
          }
        },
        metadata: {
          userId: userId || '',
          email,
          planType,
          userType: planType.startsWith('landlord') ? 'landlord' : 'agent'
        }
      });

      res.json({
        sessionId: session.id,
        url: session.url,
        customerId: customer.id
      });
    } catch (error: any) {
      console.error("Create subscription checkout error:", error);
      res.status(500).json({ 
        error: "Failed to create subscription checkout",
        details: error.message 
      });
    }
  });

  // ============================================
  // Cancel Subscription
  // ============================================
  
  app.post("/api/payments/cancel-subscription", async (req: Request, res: Response) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: "Stripe not configured" });
      }

      const { subscriptionId, cancelImmediately } = req.body;

      if (!subscriptionId) {
        return res.status(400).json({ error: "Subscription ID is required" });
      }

      // Cancel subscription
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: !cancelImmediately
      });

      if (cancelImmediately) {
        await stripe.subscriptions.cancel(subscriptionId);
      }

      // Update database
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
      console.error("Cancel subscription error:", error);
      res.status(500).json({ 
        error: "Failed to cancel subscription",
        details: error.message 
      });
    }
  });

  // ============================================
  // Get User Subscription Status
  // ============================================
  
  app.get("/api/payments/subscription-status/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      // Get active subscription
      const userSubscriptions = await db.select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId));

      const activeSubscription = userSubscriptions.find(s => 
        s.status === 'active' || s.status === 'trialing'
      );

      // Get recent invoices
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
      console.error("Get subscription status error:", error);
      res.status(500).json({ 
        error: "Failed to get subscription status",
        details: error.message 
      });
    }
  });

  // ============================================
  // Get Payment Status (for renters)
  // ============================================
  
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
      console.error("Check payment status error:", error);
      res.status(500).json({ 
        error: "Failed to check payment status",
        details: error.message 
      });
    }
  });

  // ============================================
  // WEBHOOK ENDPOINT
  // ============================================
  
  app.post(
    "/api/webhooks/stripe",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      try {
        if (!stripe) {
          return res.status(503).send("Stripe not configured");
        }

        const sig = req.headers["stripe-signature"];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!sig || !webhookSecret) {
          return res.status(400).send("Missing signature or webhook secret");
        }

        let event: Stripe.Event;

        try {
          event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } catch (err: any) {
          console.error("Webhook signature verification failed:", err.message);
          return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        console.log(`[Stripe Webhook] Received event: ${event.type}`);

        // Handle the event
        switch (event.type) {
          // ============================================
          // One-time payment success
          // ============================================
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            
            if (session.mode === 'payment') {
              // Renter one-time payment
              const { userId, email, userType } = session.metadata || {};
              
              // Create purchase record
              await db.insert(purchases).values({
                userId: userId || null,
                guestEmail: email || session.customer_email || '',
                amount: session.amount_total || 4900,
                currency: session.currency || 'usd',
                stripePaymentIntentId: session.payment_intent as string,
                stripeCustomerId: session.customer as string,
                status: 'completed',
                productType: 'one_time_unlock',
                unlockedAt: new Date()
              });

              // Update user if exists
              if (userId) {
                await db.update(users)
                  .set({ 
                    subscriptionTier: 'renter_paid',
                    subscriptionStatus: 'active',
                    stripeCustomerId: session.customer as string,
                    updatedAt: new Date()
                  })
                  .where(eq(users.id, userId));
              }

              console.log(`[Webhook] One-time payment completed for ${email}`);
            } else if (session.mode === 'subscription') {
              // Subscription created - will be handled by subscription events
              console.log(`[Webhook] Subscription checkout completed: ${session.subscription}`);
            }
            break;
          }

          // ============================================
          // Subscription created
          // ============================================
          case "customer.subscription.created": {
            const subscription = event.data.object as Stripe.Subscription;
            const { userId, planType, userType } = subscription.metadata || {};

            if (!userId) {
              console.error('[Webhook] No userId in subscription metadata');
              break;
            }

            // Create subscription record
            await db.insert(subscriptions).values({
              userId,
              stripeSubscriptionId: subscription.id,
              stripeCustomerId: subscription.customer as string,
              stripePriceId: subscription.items.data[0].price.id,
              stripeProductId: subscription.items.data[0].price.product as string,
              status: subscription.status,
              planType: planType || 'unknown',
              userType: userType || 'unknown',
              amount: subscription.items.data[0].price.unit_amount || 0,
              currency: subscription.currency || 'usd',
              interval: subscription.items.data[0].price.recurring?.interval || 'month',
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
              trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
              trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
              metadata: subscription.metadata
            });

            // Update user
            await db.update(users)
              .set({ 
                subscriptionTier: planType || 'unknown',
                subscriptionStatus: subscription.status,
                stripeCustomerId: subscription.customer as string,
                updatedAt: new Date()
              })
              .where(eq(users.id, userId));

            console.log(`[Webhook] Subscription created for user ${userId}: ${planType}`);
            break;
          }

          // ============================================
          // Subscription updated
          // ============================================
          case "customer.subscription.updated": {
            const subscription = event.data.object as Stripe.Subscription;

            await db.update(subscriptions)
              .set({
                status: subscription.status,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
                updatedAt: new Date()
              })
              .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

            // Update user status
            const sub = await db.select()
              .from(subscriptions)
              .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
              .limit(1);

            if (sub[0]) {
              await db.update(users)
                .set({ 
                  subscriptionStatus: subscription.status,
                  updatedAt: new Date()
                })
                .where(eq(users.id, sub[0].userId));
            }

            console.log(`[Webhook] Subscription updated: ${subscription.id} - status: ${subscription.status}`);
            break;
          }

          // ============================================
          // Subscription deleted/canceled
          // ============================================
          case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription;

            await db.update(subscriptions)
              .set({
                status: 'canceled',
                canceledAt: new Date(),
                updatedAt: new Date()
              })
              .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

            // Update user status
            const sub = await db.select()
              .from(subscriptions)
              .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
              .limit(1);

            if (sub[0]) {
              await db.update(users)
                .set({ 
                  subscriptionStatus: 'canceled',
                  updatedAt: new Date()
                })
                .where(eq(users.id, sub[0].userId));
            }

            console.log(`[Webhook] Subscription deleted: ${subscription.id}`);
            break;
          }

          // ============================================
          // Payment failed
          // ============================================
          case "invoice.payment_failed": {
            const invoice = event.data.object as Stripe.Invoice;
            
            if (invoice.subscription) {
              await db.update(subscriptions)
                .set({
                  status: 'past_due',
                  updatedAt: new Date()
                })
                .where(eq(subscriptions.stripeSubscriptionId, invoice.subscription as string));

              // Update user
              const sub = await db.select()
                .from(subscriptions)
                .where(eq(subscriptions.stripeSubscriptionId, invoice.subscription as string))
                .limit(1);

              if (sub[0]) {
                await db.update(users)
                  .set({ 
                    subscriptionStatus: 'past_due',
                    updatedAt: new Date()
                  })
                  .where(eq(users.id, sub[0].userId));
              }
            }

            console.log(`[Webhook] Payment failed for invoice: ${invoice.id}`);
            break;
          }

          // ============================================
          // Invoice paid
          // ============================================
          case "invoice.paid": {
            const invoice = event.data.object as Stripe.Invoice;
            
            // Create invoice record
            const sub = invoice.subscription ? await db.select()
              .from(subscriptions)
              .where(eq(subscriptions.stripeSubscriptionId, invoice.subscription as string))
              .limit(1) : [];

            if (sub[0]) {
              await db.insert(invoices).values({
                userId: sub[0].userId,
                subscriptionId: sub[0].id,
                stripeInvoiceId: invoice.id,
                stripeCustomerId: invoice.customer as string,
                amount: invoice.amount_due,
                amountPaid: invoice.amount_paid,
                currency: invoice.currency,
                status: invoice.status || 'paid',
                invoiceNumber: invoice.number || undefined,
                hostedInvoiceUrl: invoice.hosted_invoice_url || undefined,
                invoicePdf: invoice.invoice_pdf || undefined,
                periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
                periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
                paidAt: new Date()
              });
            }

            console.log(`[Webhook] Invoice paid: ${invoice.id}`);
            break;
          }

          default:
            console.log(`[Webhook] Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
      } catch (error: any) {
        console.error("[Webhook] Error processing webhook:", error);
        res.status(500).json({ 
          error: "Webhook processing failed",
          details: error.message 
        });
      }
    }
  );
}
