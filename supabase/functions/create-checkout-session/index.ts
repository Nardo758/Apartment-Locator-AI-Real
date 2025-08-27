
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Stripe with secret key
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Parse request body
    const { planType, email } = await req.json();

    if (!planType) {
      throw new Error("planType is required");
    }

    // Map plan types to Stripe Price IDs (you'll need to create these in Stripe Dashboard)
    const planPriceIds = {
      basic: "price_basic_999",     // Replace with actual Price ID from Stripe
      pro: "price_pro_2999",       // Replace with actual Price ID from Stripe  
      premium: "price_premium_9999" // Replace with actual Price ID from Stripe
    };

    const planNames = {
      basic: "Basic Plan",
      pro: "Pro Plan", 
      premium: "Premium Plan",
    };

    const planAccess = {
      basic: "7-day",
      pro: "30-day",
      premium: "90-day",
    };

    const priceId = planPriceIds[planType as keyof typeof planPriceIds];
    const planName = planNames[planType as keyof typeof planNames];
    const accessPeriod = planAccess[planType as keyof typeof planAccess];

    if (!priceId || !planName) {
      throw new Error("Invalid plan type");
    }

    // Get the origin for redirect URLs
    const origin = req.headers.get("origin") || "http://localhost:8080";

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      customer_email: email || undefined,
      metadata: {
        planType,
        planName,
        accessPeriod,
      },
    });

    console.log(`Created checkout session: ${session.id} for plan: ${planType}`);

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to create checkout session" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
