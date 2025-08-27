import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    // Initialize services
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("Missing Stripe signature");
    }

    // Verify webhook signature (you'll need to add STRIPE_WEBHOOK_SECRET)
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""
      );
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err.message });
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    logStep("Event received", { type: event.type, id: event.id });

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Processing checkout.session.completed", { sessionId: session.id });

        // Create order record
        const { error: insertError } = await supabase
          .from("orders")
          .upsert({
            stripe_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent as string,
            user_email: session.metadata?.user_email || session.customer_email,
            plan_type: session.metadata?.plan_type || "unknown",
            amount: session.amount_total || 0,
            currency: session.currency || "usd",
            status: "completed",
          });

        if (insertError) {
          logStep("Error creating order", { error: insertError });
        } else {
          logStep("Order created successfully");
        }

        // Send confirmation email
        if (session.customer_email) {
          try {
            await resend.emails.send({
              from: "ApartmentIQ <support@apartmentiq.com>",
              to: [session.customer_email],
              subject: "Payment Confirmed - Welcome to ApartmentIQ!",
              html: `
                <h1>Payment Successful! 🎉</h1>
                <p>Thank you for your purchase! Your ${session.metadata?.plan_type || "premium"} plan is now active.</p>
                <p><strong>Plan:</strong> ${session.metadata?.plan_type || "Premium"}</p>
                <p><strong>Amount:</strong> $${((session.amount_total || 0) / 100).toFixed(2)}</p>
                <p><a href="${Deno.env.get("SITE_URL") || "https://apartmentiq.com"}/dashboard">Start analyzing apartments →</a></p>
                <p>Questions? Reply to this email or contact support.</p>
              `,
            });
            logStep("Confirmation email sent");
          } catch (emailError) {
            logStep("Error sending email", { error: emailError });
          }
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logStep("Processing payment_intent.succeeded", { paymentIntentId: paymentIntent.id });

        // Update order status
        const { error: updateError } = await supabase
          .from("orders")
          .update({ status: "paid" })
          .eq("stripe_payment_intent_id", paymentIntent.id);

        if (updateError) {
          logStep("Error updating order", { error: updateError });
        } else {
          logStep("Order status updated to paid");
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logStep("Processing payment_intent.payment_failed", { paymentIntentId: paymentIntent.id });

        // Update order status
        const { error: updateError } = await supabase
          .from("orders")
          .update({ status: "failed" })
          .eq("stripe_payment_intent_id", paymentIntent.id);

        if (updateError) {
          logStep("Error updating order", { error: updateError });
        } else {
          logStep("Order status updated to failed");
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});