import type { Express, Request, Response } from "express";
import Stripe from "stripe";
import { db } from "../db";
import { purchases } from "@shared/schema";
import { eq } from "drizzle-orm";

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-12-18.acacia" })
  : null;

export function registerPaymentRoutes(app: Express): void {
  // Create payment intent for $49 one-time unlock
  app.post("/api/payments/create-intent", async (req: Request, res: Response) => {
    try {
      if (!stripe) {
        return res.status(503).json({ 
          error: "Stripe not configured. Add STRIPE_SECRET_KEY to environment variables." 
        });
      }

      const { guestEmail, guestName, searchCriteria } = req.body;

      if (!guestEmail) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Create payment intent for $49
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 4900, // $49.00 in cents
        currency: "usd",
        receipt_email: guestEmail,
        metadata: {
          product_type: "one_time_unlock",
          guest_email: guestEmail,
          guest_name: guestName || "",
        },
      });

      // Create purchase record in database
      const [purchase] = await db.insert(purchases).values({
        guestEmail,
        guestName,
        amount: 4900,
        currency: "usd",
        stripePaymentIntentId: paymentIntent.id,
        status: "pending",
        productType: "one_time_unlock",
        searchCriteria: searchCriteria || {},
      }).returning();

      res.json({
        clientSecret: paymentIntent.client_secret,
        purchaseId: purchase.id,
      });
    } catch (error: any) {
      console.error("Create payment intent error:", error);
      res.status(500).json({ 
        error: "Failed to create payment intent",
        details: error.message 
      });
    }
  });

  // Verify payment completed and unlock access
  app.post("/api/payments/verify", async (req: Request, res: Response) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: "Stripe not configured" });
      }

      const { paymentIntentId } = req.body;

      if (!paymentIntentId) {
        return res.status(400).json({ error: "Payment intent ID is required" });
      }

      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({ 
          error: "Payment not completed",
          status: paymentIntent.status 
        });
      }

      // Update purchase record
      const [purchase] = await db.update(purchases)
        .set({ 
          status: "completed",
          unlockedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(purchases.stripePaymentIntentId, paymentIntentId))
        .returning();

      if (!purchase) {
        return res.status(404).json({ error: "Purchase not found" });
      }

      res.json({ 
        success: true,
        purchase,
        unlocked: true,
      });
    } catch (error: any) {
      console.error("Verify payment error:", error);
      res.status(500).json({ 
        error: "Failed to verify payment",
        details: error.message 
      });
    }
  });

  // Check if user/email has unlocked access
  app.get("/api/payments/status", async (req: Request, res: Response) => {
    try {
      const { email } = req.query;

      if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Email is required" });
      }

      // Check for completed purchases
      const userPurchases = await db.select()
        .from(purchases)
        .where(eq(purchases.guestEmail, email));

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

  // Webhook endpoint for Stripe events (for production)
  app.post("/api/payments/webhook", express.raw({ type: "application/json" }), async (req: Request, res: Response) => {
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

      // Handle the event
      switch (event.type) {
        case "payment_intent.succeeded":
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          
          // Update purchase status
          await db.update(purchases)
            .set({ 
              status: "completed",
              unlockedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(purchases.stripePaymentIntentId, paymentIntent.id));
          
          console.log(`Payment succeeded: ${paymentIntent.id}`);
          break;

        case "payment_intent.payment_failed":
          const failedIntent = event.data.object as Stripe.PaymentIntent;
          
          await db.update(purchases)
            .set({ 
              status: "failed",
              updatedAt: new Date(),
            })
            .where(eq(purchases.stripePaymentIntentId, failedIntent.id));
          
          console.log(`Payment failed: ${failedIntent.id}`);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error("Webhook error:", error);
      res.status(500).json({ 
        error: "Webhook processing failed",
        details: error.message 
      });
    }
  });
}

// Need to import express for webhook route
import express from "express";
