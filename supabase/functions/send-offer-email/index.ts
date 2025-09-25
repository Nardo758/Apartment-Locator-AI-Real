import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OfferEmailRequest {
  userEmail: string;
  moveInDate: string;
  leaseTerm: number;
  monthlyBudget: number;
  notes?: string;
  propertyId: string;
  propertyDetails?: any;
  aiSuggestions?: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const offerData: OfferEmailRequest = await req.json();
    console.log("Received offer data:", offerData);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Save offer to database
    const { data: savedOffer, error: dbError } = await supabase
      .from('rental_offers')
      .insert({
        user_email: offerData.userEmail,
        property_id: offerData.propertyId,
        move_in_date: offerData.moveInDate,
        lease_term: offerData.leaseTerm,
        monthly_budget: offerData.monthlyBudget,
        notes: offerData.notes,
        ai_suggestions: offerData.aiSuggestions,
        property_details: offerData.propertyDetails
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error(`Failed to save offer: ${dbError.message}`);
    }

    console.log("Offer saved to database:", savedOffer);

    // Format AI suggestions for email
    const formatAISuggestions = (suggestions: any) => {
      if (!suggestions) return '';
      
      return `
        <h3>AI Market Analysis & Recommendations</h3>
        
        <h4>Recommended Offer Strategy:</h4>
        <ul>
          <li><strong>Suggested Rent:</strong> ${suggestions.recommendedOffer?.suggestedRent || 'N/A'}</li>
          <li><strong>Strategy:</strong> ${suggestions.recommendedOffer?.strategy || 'N/A'}</li>
          <li><strong>Reasoning:</strong> ${suggestions.recommendedOffer?.reasoning || 'N/A'}</li>
        </ul>

        <h4>Market Analysis:</h4>
        <ul>
          <li><strong>Market Position:</strong> ${suggestions.marketAnalysis?.marketPosition || 'N/A'}</li>
          <li><strong>Demand Level:</strong> ${suggestions.marketAnalysis?.demandLevel || 'N/A'}</li>
          <li><strong>Competitive Analysis:</strong> ${suggestions.marketAnalysis?.competitiveAnalysis || 'N/A'}</li>
        </ul>

        <h4>Potential Concessions:</h4>
        ${suggestions.potentialConcessions?.map((concession: any) => 
          `<li><strong>${concession.type}:</strong> ${concession.description} (${concession.likelihood} likelihood)</li>`
        ).join('') || '<li>No concessions suggested</li>'}

        <h4>Timing Recommendations:</h4>
        <p><strong>Best Time to Apply:</strong> ${suggestions.timingRecommendations?.bestTimeToApply || 'N/A'}</p>
        <p><strong>Reasoning:</strong> ${suggestions.timingRecommendations?.reasoning || 'N/A'}</p>
      `;
    };

    // Send email to leasing office (using a demo email for now)
    const emailResponse = await resend.emails.send({
      from: "Rental Offers <onboarding@resend.dev>",
      to: ["leasing-office@example.com"], // Replace with actual leasing office email
      cc: [offerData.userEmail], // Send copy to the user
      subject: `New Rental Application - Property ${offerData.propertyId}`,
      html: `
        <h2>New Rental Application Received</h2>
        
        <h3>Applicant Information:</h3>
        <ul>
          <li><strong>Email:</strong> ${offerData.userEmail}</li>
          <li><strong>Desired Move-in Date:</strong> ${offerData.moveInDate}</li>
          <li><strong>Lease Term:</strong> ${offerData.leaseTerm} months</li>
          <li><strong>Monthly Budget:</strong> $${offerData.monthlyBudget}</li>
          <li><strong>Property ID:</strong> ${offerData.propertyId}</li>
        </ul>

        ${offerData.notes ? `
        <h3>Additional Notes:</h3>
        <p>${offerData.notes}</p>
        ` : ''}

        ${formatAISuggestions(offerData.aiSuggestions)}

        <hr>
        <p><small>This offer was generated using AI market analysis to provide optimal rental terms and timing recommendations.</small></p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      offerId: savedOffer.id,
      emailId: emailResponse.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-offer-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);