import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYMENT] ${step}${detailsStr}`);
};

interface PaymentRequest {
  planType: 'basic' | 'pro' | 'premium';
  email: string;
}

const PLAN_CONFIG = {
  basic: {
    amount: 999, // $9.99 in cents
    name: "ApartmentIQ Basic Plan",
    description: "5 AI analyses • 7-day access"
  },
  pro: {
    amount: 2999, // $29.99 in cents
    name: "ApartmentIQ Pro Plan", 
    description: "Unlimited analyses • 30-day access"
  },
  premium: {
    amount: 9999, // $99.99 in cents
    name: "ApartmentIQ Premium Plan",
    description: "Everything + concierge • 90-day access"
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    // Verify Stripe secret key
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not found");
      throw new Error("Stripe secret key is not configured");
    }
    logStep("Stripe key verified");

    const { planType, email }: PaymentRequest = await req.json();
    logStep("Request parsed", { planType, email });

    if (!planType || !email) {
      throw new Error("Plan type and email are required");
    }

    if (!PLAN_CONFIG[planType]) {
      throw new Error("Invalid plan type");
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });
    logStep("Stripe initialized");

    const plan = PLAN_CONFIG[planType];
    logStep("Plan selected", { planName: plan.name, amount: plan.amount });

    // Check if customer exists
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      logStep("Creating new customer");
    }

    // Create checkout session for one-time payment
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: plan.name,
              description: plan.description
            },
            unit_amount: plan.amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment", // One-time payment
      success_url: `${req.headers.get("origin")}/payment-success?plan=${planType}`,
      cancel_url: `${req.headers.get("origin")}/trial`,
      metadata: {
        plan_type: planType,
        user_email: email
      }
    });

    logStep("Payment session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-payment", { message: errorMessage, stack: error instanceof Error ? error.stack : undefined });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});