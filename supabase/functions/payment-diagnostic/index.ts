import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== DIAGNOSTIC START ===");
    
    // Check all environment variables
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    console.log("Environment check:", {
      stripeKeyExists: !!stripeKey,
      stripeKeyLength: stripeKey?.length || 0,
      stripeKeyPrefix: stripeKey?.substring(0, 10) || "missing",
      supabaseUrlExists: !!supabaseUrl,
      supabaseServiceKeyExists: !!supabaseServiceKey
    });

    const diagnostics = {
      environment: {
        stripeSecretKey: {
          exists: !!stripeKey,
          length: stripeKey?.length || 0,
          prefix: stripeKey?.substring(0, 10) || "missing",
          isValidFormat: stripeKey?.startsWith('sk_') || false
        },
        supabaseUrl: {
          exists: !!supabaseUrl,
          value: supabaseUrl || "missing"
        },
        supabaseServiceKey: {
          exists: !!supabaseServiceKey,
          length: supabaseServiceKey?.length || 0
        }
      },
      status: "diagnostic_complete"
    };

    console.log("Diagnostic complete:", diagnostics);

    return new Response(JSON.stringify(diagnostics), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Diagnostic error:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      status: "diagnostic_failed"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});