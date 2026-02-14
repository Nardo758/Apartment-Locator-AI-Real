import type { Express, Request, Response } from "express";
import { db } from "../db";
import { leaseVerifications, purchases } from "@shared/schema";
import { eq } from "drizzle-orm";
import { getUncachableStripeClient } from "../stripeClient";
import { getFrontendUrl } from "../lib/frontend-url";

function parseRent(value: unknown): number | null {
  const parsed = parseInt(String(value), 10);
  if (isNaN(parsed) || parsed < 1 || parsed > 100000) {
    return null;
  }
  return parsed;
}

export function registerLeaseVerificationRoutes(app: Express): void {
  app.post("/api/lease-verification/submit", async (req: Request, res: Response) => {
    try {
      const {
        purchaseId,
        propertyName,
        finalRent,
        leaseSignedDate,
        moveInDate,
        leaseFileUrl,
        guestEmail
      } = req.body;

      if (!purchaseId || !finalRent || !leaseFileUrl) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const parsedRent = parseRent(finalRent);
      if (parsedRent === null) {
        return res.status(400).json({ error: "Invalid rent amount. Must be between 1 and 100,000" });
      }

      const [verification] = await db.insert(leaseVerifications).values({
        purchaseId,
        propertyName,
        finalRent: parsedRent,
        leaseSignedDate: new Date(leaseSignedDate),
        moveInDate: new Date(moveInDate),
        leaseFileUrl,
        guestEmail,
        status: "pending",
        submittedAt: new Date(),
      }).returning();

      res.json({
        success: true,
        verificationId: verification.id,
        message: "Lease submitted for verification"
      });
    } catch (error: any) {
      console.error("Submit lease error:", error);
      res.status(500).json({ error: "Failed to submit lease" });
    }
  });

  app.post("/api/lease-verification/verify/:verificationId", async (req: Request, res: Response) => {
    try {
      const { verificationId } = req.params;
      const { originalAskingRent, predictedRent } = req.body;

      const parsedOriginal = parseRent(originalAskingRent);
      const parsedPredicted = parseRent(predictedRent);
      if (parsedOriginal === null || parsedPredicted === null) {
        return res.status(400).json({ error: "Invalid rent amounts. Must be between 1 and 100,000" });
      }

      const [verification] = await db.select()
        .from(leaseVerifications)
        .where(eq(leaseVerifications.id, verificationId));

      if (!verification) {
        return res.status(404).json({ error: "Verification not found" });
      }

      const actualRent = verification.finalRent;
      const monthlySavings = parsedOriginal - actualRent;
      const annualSavings = monthlySavings * 12;

      let refundAmount = 0;
      let refundPercentage = 0;
      let tier = "none";

      if (monthlySavings >= 100) {
        refundAmount = 25;
        refundPercentage = 50;
        tier = "gold";
      } else if (monthlySavings >= 50) {
        refundAmount = 15;
        refundPercentage = 30;
        tier = "silver";
      } else if (monthlySavings >= 1) {
        refundAmount = 10;
        refundPercentage = 20;
        tier = "bronze";
      } else if (actualRent === parsedPredicted) {
        refundAmount = 5;
        refundPercentage = 10;
        tier = "accuracy_bonus";
      }

      await db.update(leaseVerifications)
        .set({
          status: "verified",
          verifiedAt: new Date(),
          actualSavings: monthlySavings,
          refundAmount,
          refundTier: tier,
          originalAskingRent: parsedOriginal,
          predictedRent: parsedPredicted,
        })
        .where(eq(leaseVerifications.id, verificationId));

      res.json({
        success: true,
        verification: {
          ...verification,
          actualSavings: monthlySavings,
          annualSavings,
          refundAmount,
          refundPercentage,
          tier
        }
      });
    } catch (error: any) {
      console.error("Verify lease error:", error);
      res.status(500).json({ error: "Failed to verify lease" });
    }
  });

  app.post("/api/lease-verification/refund/:verificationId", async (req: Request, res: Response) => {
    try {
      const { verificationId } = req.params;

      const [verification] = await db.select()
        .from(leaseVerifications)
        .where(eq(leaseVerifications.id, verificationId));

      if (!verification) {
        return res.status(404).json({ error: "Verification not found" });
      }

      if (verification.status !== "verified") {
        return res.status(400).json({ error: "Lease not yet verified" });
      }

      if (!verification.refundAmount || verification.refundAmount <= 0) {
        return res.status(400).json({ error: "No refund eligible for this verification" });
      }

      const [purchase] = await db.select()
        .from(purchases)
        .where(eq(purchases.id, verification.purchaseId));

      if (!purchase || !purchase.stripePaymentIntentId) {
        return res.status(400).json({ error: "Original payment not found for refund" });
      }

      const stripe = await getUncachableStripeClient();
      const paymentIntentId: string = String(purchase.stripePaymentIntentId);
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId as string,
        amount: verification.refundAmount * 100,
        reason: "requested_by_customer",
        metadata: {
          verification_id: verificationId,
          savings_verified: String(verification.actualSavings ?? 0),
        }
      });

      await db.update(leaseVerifications)
        .set({
          status: "refunded",
          refundedAt: new Date(),
        })
        .where(eq(leaseVerifications.id, verificationId));

      res.json({
        success: true,
        message: `Refund of $${verification.refundAmount} processed successfully`,
        refundAmount: verification.refundAmount,
        stripeRefundId: refund.id,
      });
    } catch (error: any) {
      console.error("Process refund error:", error);
      res.status(500).json({ error: "Failed to process refund" });
    }
  });

  app.get("/api/lease-verification/status/:purchaseId", async (req: Request, res: Response) => {
    try {
      const { purchaseId } = req.params;

      const [verification] = await db.select()
        .from(leaseVerifications)
        .where(eq(leaseVerifications.purchaseId, purchaseId));

      if (!verification) {
        return res.json({
          hasVerification: false,
          message: "No lease verification submitted yet"
        });
      }

      res.json({
        hasVerification: true,
        verification
      });
    } catch (error: any) {
      console.error("Get verification status error:", error);
      res.status(500).json({ error: "Failed to get verification status" });
    }
  });

  app.get("/api/lease-verification/demand-forecast", async (req: Request, res: Response) => {
    try {
      const forecasts = await db.select()
        .from(leaseVerifications)
        .orderBy(leaseVerifications.moveInDate);

      const demandByMonth: Record<string, number> = {};
      
      forecasts.forEach((verification) => {
        if (verification.moveInDate) {
          const month = verification.moveInDate.toISOString().slice(0, 7);
          demandByMonth[month] = (demandByMonth[month] || 0) + 1;
        }
      });

      res.json({
        totalVerifications: forecasts.length,
        demandByMonth,
        upcomingMoveIns: forecasts.filter(v => 
          v.moveInDate && new Date(v.moveInDate) > new Date()
        ).length
      });
    } catch (error: any) {
      console.error("Get demand forecast error:", error);
      res.status(500).json({ error: "Failed to get demand forecast" });
    }
  });
}
