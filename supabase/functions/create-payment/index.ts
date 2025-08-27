import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[${timestamp}] [CREATE-PAYMENT] ${step}${detailsStr}`);
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
  // Updated: 2025-08-27 - Secret key configured
  logStep("=== FUNCTION STARTED ===");
  logStep("Request method", { method: req.method });
  logStep("Request headers", { 
    origin: req.headers.get("origin"),
    contentType: req.headers.get("content-type"),
    authorization: req.headers.get("authorization") ? "Present" : "Missing"
  });

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    logStep("Handling CORS preflight");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Step 1: Check environment variables
    logStep("Checking environment variables");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    logStep("Environment check", {
      stripeKeyPresent: !!stripeKey,
      stripeKeyPrefix: stripeKey ? stripeKey.substring(0, 7) + "..." : "missing",
      supabaseUrlPresent: !!supabaseUrl,
      supabaseServiceKeyPresent: !!supabaseServiceKey
    });

    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not found");
      throw new Error("Stripe secret key is not configured");
    }

    if (!stripeKey.startsWith('sk_')) {
      logStep("ERROR: Invalid Stripe key format", { prefix: stripeKey.substring(0, 7) });
      throw new Error("Invalid Stripe secret key format");
    }

    // Step 2: Parse request body
    logStep("Parsing request body");
    let requestBody;
    try {
      const bodyText = await req.text();
      logStep("Raw request body", { body: bodyText });
      requestBody = JSON.parse(bodyText);
    } catch (parseError) {
      logStep("ERROR: Failed to parse request body", { error: parseError.message });
      throw new Error("Invalid JSON in request body");
    }

    const { planType, email }: PaymentRequest = requestBody;
    logStep("Request parsed", { planType, email });

    if (!planType || !email) {
      logStep("ERROR: Missing required fields", { planType: !!planType, email: !!email });
      throw new Error("Plan type and email are required");
    }

    if (!PLAN_CONFIG[planType]) {
      logStep("ERROR: Invalid plan type", { planType, availablePlans: Object.keys(PLAN_CONFIG) });
      throw new Error("Invalid plan type");
    }

    // Step 3: Initialize Supabase
    logStep("Initializing Supabase client");
    const supabaseService = createClient(
      supabaseUrl ?? "",
      supabaseServiceKey ?? "",
      { auth: { persistSession: false } }
    );

    // Step 4: Check user authentication
    let userId = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      logStep("Checking user authentication");
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data: userData, error: authError } = await supabaseService.auth.getUser(token);
        if (authError) {
          logStep("Auth error", { error: authError.message });
        } else if (userData.user) {
          userId = userData.user.id;
          logStep("User authenticated", { userId });
        } else {
          logStep("No user found in token");
        }
      } catch (authException) {
        logStep("Auth exception", { error: authException.message });
      }
    } else {
      logStep("No authorization header - proceeding as guest");
    }

    // Step 5: Initialize Stripe
    logStep("Initializing Stripe client");
    let stripe;
    try {
      stripe = new Stripe(stripeKey, {
        apiVersion: "2023-10-16",
      });
      logStep("Stripe client initialized successfully");
    } catch (stripeInitError) {
      logStep("ERROR: Failed to initialize Stripe", { error: stripeInitError.message });
      throw new Error(`Failed to initialize Stripe: ${stripeInitError.message}`);
    }

    const plan = PLAN_CONFIG[planType];
    logStep("Plan selected", { planName: plan.name, amount: plan.amount });

    // Step 6: Check for existing customer
    logStep("Checking for existing Stripe customer");
    let customers;
    try {
      customers = await stripe.customers.list({ email, limit: 1 });
      logStep("Customer lookup completed", { 
        customersFound: customers.data.length,
        firstCustomerId: customers.data[0]?.id 
      });
    } catch (customerError) {
      logStep("ERROR: Failed to check customers", { error: customerError.message });
      throw new Error(`Failed to check customer: ${customerError.message}`);
    }

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      logStep("No existing customer found - will create during checkout");
    }

    // Step 7: Create checkout session
    logStep("Creating Stripe checkout session");
    let session;
    try {
      const origin = req.headers.get("origin") || "http://localhost:3000";
      logStep("Using origin for URLs", { origin });

      session = await stripe.checkout.sessions.create({
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
        mode: "payment",
        success_url: `${origin}/payment-success?plan=${planType}`,
        cancel_url: `${origin}/trial`,
        metadata: {
          plan_type: planType,
          user_email: email,
          user_id: userId || ''
        }
      });

      logStep("Checkout session created successfully", { 
        sessionId: session.id, 
        url: session.url ? "Present" : "Missing" 
      });
    } catch (sessionError) {
      logStep("ERROR: Failed to create checkout session", { 
        error: sessionError.message,
        type: sessionError.constructor.name 
      });
      throw new Error(`Failed to create checkout session: ${sessionError.message}`);
    }

    // Step 8: Create order record
    logStep("Creating order record in database");
    try {
      const orderData = {
        user_id: userId,
        user_email: email,
        stripe_session_id: session.id,
        plan_type: planType,
        amount: plan.amount,
        currency: 'usd',
        status: 'pending'
      };

      logStep("Order data prepared", { orderData });

      const { data: order, error: orderError } = await supabaseService
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        logStep("WARNING: Failed to create order record", { error: orderError.message });
      } else {
        logStep("Order record created successfully", { orderId: order.id });
      }
    } catch (dbError) {
      logStep("WARNING: Database error", { error: dbError.message });
    }

    // Step 9: Return success response
    logStep("Returning success response", { sessionUrl: session.url });
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logStep("=== FATAL ERROR ===", { 
      message: errorMessage, 
      stack: errorStack,
      type: error.constructor?.name 
    });

    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: "Check function logs for detailed debugging information"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});