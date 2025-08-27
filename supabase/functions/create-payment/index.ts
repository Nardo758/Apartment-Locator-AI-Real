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
    // Get request body for plan type, guest email, and name
    const body = await req.json().catch(() => ({}));
    const { plan = 'pro', guestEmail, guestName } = body;
    
    console.log("Processing payment request:", { plan, guestEmail, guestName });
    
    // Plan pricing configuration with detailed descriptions
    const planConfig = {
      basic: { 
        amount: 999, 
        name: "Basic Plan - 7-Day Access",
        description: "5 AI property analyses, basic market insights, email templates, 7-day access",
        accessDays: 7
      },
      pro: { 
        amount: 2999, 
        name: "Pro Plan - 30-Day Access",
        description: "Unlimited AI analyses, advanced market intelligence, email automation templates, success probability scoring, 30-day access, priority email support",
        accessDays: 30
      }, 
      premium: { 
        amount: 9999, 
        name: "Premium Plan - 90-Day Access",
        description: "Everything in Pro + personal AI concierge, custom market reports, white-glove setup, 90-day access, direct phone support",
        accessDays: 90
      }
    };
    
    const selectedPlan = planConfig[plan] || planConfig.pro;

    // Create Supabase client using the anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    let userEmail = guestEmail;
    let userName = guestName;
    let userId = null;

    // Try to get authenticated user if available
    const authHeader = req.headers.get("Authorization");
    if (authHeader && !guestEmail) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      if (data.user?.email) {
        userEmail = data.user.email;
        userId = data.user.id;
        // Try to get user name from user metadata or profile
        userName = data.user.user_metadata?.name || data.user.user_metadata?.full_name || "";
        console.log("Processing payment for authenticated user:", userEmail);
      }
    }

    // Require email for payment processing
    if (!userEmail) {
      throw new Error("Email is required for payment processing");
    }

    console.log("Processing payment for:", userEmail, "Plan:", plan, "Name:", userName);

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

    // Generate access token for plan access
    const accessToken = crypto.randomUUID();
    const planEndDate = new Date();
    planEndDate.setDate(planEndDate.getDate() + selectedPlan.accessDays);

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
              description: selectedPlan.description
            },
            unit_amount: selectedPlan.amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
      cancel_url: `${req.headers.get("origin")}/`,
      metadata: {
        plan_type: plan,
        user_email: userEmail,
        user_name: userName || "",
        user_id: userId || "",
        access_token: accessToken,
        plan_end: planEndDate.toISOString()
      }
    });

    console.log("Created checkout session:", session.id);

    // Create subscriber record with pending status
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { error: insertError } = await supabaseService.from("subscribers").upsert({
      user_id: userId,
      email: userEmail,
      name: userName,
      stripe_session_id: session.id,
      plan_type: plan,
      amount: selectedPlan.amount,
      status: "pending",
      plan_end: planEndDate.toISOString(),
      access_token: accessToken
    }, { onConflict: 'email,plan_type' });

    if (insertError) {
      console.error("Error creating subscriber record:", insertError);
    } else {
      console.log("Created subscriber record for:", userEmail);
    }

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