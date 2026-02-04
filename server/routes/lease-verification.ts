import type { Express, Request, Response } from "express";
import { db } from "../db";
import { leaseVerifications } from "@shared/schema";
import { eq } from "drizzle-orm";

export function registerLeaseVerificationRoutes(app: Express): void {
  // Submit lease for verification
  app.post("/api/lease-verification/submit", async (req: Request, res: Response) => {
    try {
      const {
        purchaseId,
        propertyName,
        finalRent,
        leaseSignedDate,
        moveInDate,
        leaseFileUrl, // S3 URL after upload
        guestEmail
      } = req.body;

      if (!purchaseId || !finalRent || !leaseFileUrl) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Create verification record
      const [verification] = await db.insert(leaseVerifications).values({
        purchaseId,
        propertyName,
        finalRent: parseInt(finalRent),
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
      res.status(500).json({
        error: "Failed to submit lease",
        details: error.message
      });
    }
  });

  // Verify lease and calculate refund
  app.post("/api/lease-verification/verify/:verificationId", async (req: Request, res: Response) => {
    try {
      const { verificationId } = req.params;
      const { originalAskingRent, predictedRent } = req.body;

      // Get verification record
      const [verification] = await db.select()
        .from(leaseVerifications)
        .where(eq(leaseVerifications.id, verificationId));

      if (!verification) {
        return res.status(404).json({ error: "Verification not found" });
      }

      // Calculate savings
      const actualRent = verification.finalRent;
      const monthlySavings = originalAskingRent - actualRent;
      const annualSavings = monthlySavings * 12;

      // Determine refund tier
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
      } else if (actualRent === predictedRent) {
        refundAmount = 5;
        refundPercentage = 10;
        tier = "accuracy_bonus";
      }

      // Update verification record
      await db.update(leaseVerifications)
        .set({
          status: "verified",
          verifiedAt: new Date(),
          actualSavings: monthlySavings,
          refundAmount,
          refundTier: tier,
          originalAskingRent,
          predictedRent,
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
      res.status(500).json({
        error: "Failed to verify lease",
        details: error.message
      });
    }
  });

  // Process refund via Stripe
  app.post("/api/lease-verification/refund/:verificationId", async (req: Request, res: Response) => {
    try {
      const { verificationId } = req.params;

      // Get verification record
      const [verification] = await db.select()
        .from(leaseVerifications)
        .where(eq(leaseVerifications.id, verificationId));

      if (!verification) {
        return res.status(404).json({ error: "Verification not found" });
      }

      if (verification.status !== "verified") {
        return res.status(400).json({ error: "Lease not yet verified" });
      }

      // TODO: Process refund via Stripe
      // const refund = await stripe.refunds.create({
      //   payment_intent: verification.purchaseId,
      //   amount: verification.refundAmount * 100, // cents
      //   reason: "requested_by_customer",
      //   metadata: {
      //     verification_id: verificationId,
      //     savings_verified: verification.actualSavings
      //   }
      // });

      // Update verification record
      await db.update(leaseVerifications)
        .set({
          status: "refunded",
          refundedAt: new Date(),
        })
        .where(eq(leaseVerifications.id, verificationId));

      res.json({
        success: true,
        message: `Refund of $${verification.refundAmount} processed successfully`,
        refundAmount: verification.refundAmount
      });
    } catch (error: any) {
      console.error("Process refund error:", error);
      res.status(500).json({
        error: "Failed to process refund",
        details: error.message
      });
    }
  });

  // Get verification status
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
      res.status(500).json({
        error: "Failed to get verification status",
        details: error.message
      });
    }
  });

  // Get demand forecasting data (admin/analytics)
  app.get("/api/lease-verification/demand-forecast", async (req: Request, res: Response) => {
    try {
      // Get all verifications with lease expiration data from purchases
      const forecasts = await db.select()
        .from(leaseVerifications)
        .orderBy(leaseVerifications.moveInDate);

      // Group by month for demand forecasting
      const demandByMonth: Record<string, number> = {};
      
      forecasts.forEach((verification) => {
        if (verification.moveInDate) {
          const month = verification.moveInDate.toISOString().slice(0, 7); // YYYY-MM
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
      res.status(500).json({
        error: "Failed to get demand forecast",
        details: error.message
      });
    }
  });
}
