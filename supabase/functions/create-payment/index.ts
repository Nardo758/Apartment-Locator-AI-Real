import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
    // Get request body for plan type and optional email
    const body = await req.json().catch(() => ({}));
    const { plan = 'pro', guestEmail } = body;
    
    // Plan pricing configuration
    const planConfig = {
      basic: { amount: 999, name: "ApartmentIQ Basic - 7-Day Access" },
      pro: { amount: 2999, name: "ApartmentIQ Pro - 30-Day Access" }, 
      premium: { amount: 9999, name: "ApartmentIQ Premium - 90-Day Access" }
    };
    
    const selectedPlan = planConfig[plan] || planConfig.pro;

    // Create Supabase client using the anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    let userEmail = guestEmail;

    // Try to get authenticated user if available
    const authHeader = req.headers.get("Authorization");
    if (authHeader && !guestEmail) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      if (data.user?.email) {
        userEmail = data.user.email;
        console.log("Processing payment for authenticated user:", userEmail);
      }
    }

    // Require email for payment processing
    if (!userEmail) {
      throw new Error("Email is required for payment processing");
    }

    console.log("Processing payment for:", userEmail, "Plan:", plan);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if a Stripe customer record exists for this email
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("Found existing customer:", customerId);
    } else {
      console.log("No existing customer found, will create one during checkout");
    }

    // Create a one-time payment session with dynamic pricing
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: selectedPlan.name,
              description: `${plan === 'basic' ? '5 AI analyses, 7-day access' : plan === 'pro' ? 'Unlimited searches, 30-day access' : 'Everything in Pro + concierge, 90-day access'}`
            },
            unit_amount: selectedPlan.amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
      cancel_url: `${req.headers.get("origin")}/`,
    });

    console.log("Created checkout session:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating payment session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});