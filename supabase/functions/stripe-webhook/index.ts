import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature!,
        Deno.env.get("STRIPE_WEBHOOK_SECRET")!
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    console.log("Received webhook event:", event.type, "ID:", event.id);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Processing completed checkout session:", session.id);
        
        const { 
          plan_type, 
          user_email, 
          user_name, 
          user_id, 
          access_token,
          plan_end 
        } = session.metadata || {};

        if (!user_email || !plan_type) {
          console.error("Missing required metadata in session:", session.id);
          break;
        }

        // Update subscriber status to active
        const { error: updateError } = await supabase
          .from("subscribers")
          .update({
            status: "active",
            stripe_customer_id: session.customer as string,
            plan_start: new Date().toISOString()
          })
          .eq("stripe_session_id", session.id);

        if (updateError) {
          console.error("Error updating subscriber:", updateError);
        } else {
          console.log("Successfully activated subscription for:", user_email);
        }

        // Create access token record
        if (access_token && plan_end) {
          const { error: tokenError } = await supabase
            .from("access_tokens")
            .insert({
              token: access_token,
              email: user_email,
              plan_type: plan_type,
              expires_at: plan_end
            });

          if (tokenError) {
            console.error("Error creating access token:", tokenError);
          }
        }

        // Send confirmation email
        const planDetails = {
          basic: { name: "Basic", duration: "7 days", features: "5 AI analyses, basic market insights, email templates" },
          pro: { name: "Pro", duration: "30 days", features: "Unlimited AI analyses, advanced market intelligence, email automation" },
          premium: { name: "Premium", duration: "90 days", features: "Everything in Pro + personal AI concierge, custom reports, phone support" }
        };

        const plan = planDetails[plan_type as keyof typeof planDetails];
        
        if (plan) {
          const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #333; text-align: center;">Welcome to Apartment Locator AI!</h1>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="color: #333; margin-top: 0;">Your ${plan.name} Plan is Active 🎉</h2>
                <p><strong>Plan Duration:</strong> ${plan.duration}</p>
                <p><strong>Features:</strong> ${plan.features}</p>
                ${access_token ? `<p><strong>Access Token:</strong> ${access_token}</p>` : ''}
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.app') || 'https://apartmentlocatorai.com'}/dashboard" 
                   style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Start Finding Apartments
                </a>
              </div>

              <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                <h3 style="color: #333;">Getting Started:</h3>
                <ol style="color: #666;">
                  <li>Visit your dashboard to start searching for apartments</li>
                  <li>Use our AI-powered analysis tools to evaluate properties</li>
                  <li>Get personalized negotiation strategies</li>
                  <li>Access landlord contact information</li>
                </ol>
              </div>

              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
                <p>Need help? Contact us at support@apartmentlocatorai.com</p>
                <p>Apartment Locator AI - Your AI-powered apartment hunting assistant</p>
              </div>
            </div>
          `;

          try {
            await resend.emails.send({
              from: "Apartment Locator AI <noreply@apartmentlocatorai.com>",
              to: [user_email],
              subject: `Welcome to Apartment Locator AI ${plan.name} Plan!`,
              html: emailContent
            });
            console.log("Confirmation email sent to:", user_email);
          } catch (emailError) {
            console.error("Error sending confirmation email:", emailError);
          }
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment succeeded:", paymentIntent.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment failed:", paymentIntent.id);
        
        // Update any related orders or subscribers to failed status
        const { error } = await supabase
          .from("subscribers")
          .update({ status: "pending" })
          .eq("stripe_session_id", paymentIntent.metadata?.session_id);
          
        if (error) {
          console.error("Error updating failed payment:", error);
        }
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});