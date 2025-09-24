import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExportRequest {
  exportId: string;
}

interface UserData {
  profile: any;
  activity: any[];
  content: any[];
  sessions: any[];
  orders: any[];
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { exportId }: ExportRequest = await req.json();
    
    console.log('Processing export request:', exportId);

    // Get export request details
    const { data: exportRequest, error: exportError } = await supabase
      .from('data_export_requests')
      .select('*')
      .eq('id', exportId)
      .single();

    if (exportError || !exportRequest) {
      throw new Error('Export request not found');
    }

    // Update status to processing
    await supabase
      .from('data_export_requests')
      .update({ 
        status: 'processing', 
        progress_percentage: 10 
      })
      .eq('id', exportId);

    // Collect user data based on categories
    const userData: UserData = {
      profile: null,
      activity: [],
      content: [],
      sessions: [],
      orders: []
    };

    const userId = exportRequest.user_id;
    const categories = exportRequest.data_categories || ['profile', 'activity', 'content', 'sessions'];
    const dateStart = exportRequest.date_range_start;
    const dateEnd = exportRequest.date_range_end;

    // Build date filter
    const dateFilter = dateStart && dateEnd 
      ? { gte: dateStart, lte: dateEnd }
      : {};

    // Collect profile data
    if (categories.includes('profile')) {
      console.log('Collecting profile data...');
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      userData.profile = data;
      
      await supabase
        .from('data_export_requests')
        .update({ progress_percentage: 25 })
        .eq('id', exportId);
    }

    // Collect activity data
    if (categories.includes('activity')) {
      console.log('Collecting activity data...');
      let query = supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (dateStart) {
        query = query.gte('created_at', dateStart);
      }
      if (dateEnd) {
        query = query.lte('created_at', dateEnd);
      }

      const { data } = await query.limit(10000);
      userData.activity = data || [];
      
      await supabase
        .from('data_export_requests')
        .update({ progress_percentage: 50 })
        .eq('id', exportId);
    }

    // Collect content data
    if (categories.includes('content')) {
      console.log('Collecting content data...');
      let query = supabase
        .from('user_content_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (dateStart) {
        query = query.gte('created_at', dateStart);
      }
      if (dateEnd) {
        query = query.lte('created_at', dateEnd);
      }

      const { data } = await query.limit(10000);
      userData.content = data || [];

      // Also include rental offers
      const { data: offers } = await supabase
        .from('rental_offers')
        .select('*')
        .eq('user_email', exportRequest.user_email || '');
      
      userData.content.push(...(offers || []));
      
      await supabase
        .from('data_export_requests')
        .update({ progress_percentage: 75 })
        .eq('id', exportId);
    }

    // Collect session data
    if (categories.includes('sessions')) {
      console.log('Collecting session data...');
      let query = supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (dateStart) {
        query = query.gte('created_at', dateStart);
      }
      if (dateEnd) {
        query = query.lte('created_at', dateEnd);
      }

      const { data } = await query.limit(5000);
      userData.sessions = data || [];
    }

    // Collect transaction data (if requested)
    if (categories.includes('transactions')) {
      console.log('Collecting transaction data...');
      const { data } = await supabase
        .from('orders')
        .select('id, plan_type, amount, currency, status, created_at')
        .eq('user_id', userId);
      userData.orders = data || [];
    }

    // Generate export data
    const exportData = {
      export_info: {
        user_id: userId,
        export_date: new Date().toISOString(),
        export_type: exportRequest.export_type,
        data_range: {
          start: dateStart,
          end: dateEnd
        },
        categories: categories,
        total_records: {
          profile: userData.profile ? 1 : 0,
          activity: userData.activity.length,
          content: userData.content.length,
          sessions: userData.sessions.length,
          transactions: userData.orders.length
        }
      },
      profile_data: userData.profile,
      activity_data: userData.activity,
      content_data: userData.content,
      session_data: userData.sessions,
      transaction_data: userData.orders,
      metadata: {
        generated_at: new Date().toISOString(),
        format: exportRequest.export_format,
        data_sources: [
          'user_profiles',
          'user_activity_logs',
          'user_content_logs',
          'user_sessions',
          'rental_offers',
          'orders'
        ],
        privacy_notice: 'This export contains all personal data associated with your account as of the export date.',
        retention_policy: 'Export files are automatically deleted after 7 days for security purposes.'
      }
    };

    // Format data based on requested format
    let fileContent: string;
    let contentType: string;
    let fileExtension: string;

    switch (exportRequest.export_format) {
      case 'json':
        fileContent = JSON.stringify(exportData, null, 2);
        contentType = 'application/json';
        fileExtension = 'json';
        break;
      
      case 'csv':
        // For CSV, we'll create a simplified flat structure
        fileContent = generateCSV(exportData);
        contentType = 'text/csv';
        fileExtension = 'csv';
        break;
      
      case 'xml':
        fileContent = generateXML(exportData);
        contentType = 'application/xml';
        fileExtension = 'xml';
        break;
      
      default:
        fileContent = JSON.stringify(exportData, null, 2);
        contentType = 'application/json';
        fileExtension = 'json';
    }

    // For demo purposes, we'll just store the data as JSON and provide a mock file URL
    // In production, you would upload to storage and get a real URL
    const fileSize = new Blob([fileContent]).size;
    const mockFileUrl = `https://storage.example.com/exports/${exportId}.${fileExtension}`;

    // Update export request with completion
    await supabase
      .from('data_export_requests')
      .update({
        status: 'completed',
        progress_percentage: 100,
        file_url: mockFileUrl,
        file_size: fileSize
      })
      .eq('id', exportId);

    console.log('Export completed successfully:', exportId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        exportId, 
        fileSize,
        recordCount: exportData.export_info.total_records
      }),
      {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
      }
    );

  } catch (error) {
    console.error('Export processing error:', error);
    
    // Update export request with error
    const { exportId } = await req.json().catch(() => ({ exportId: null }));
    if (exportId) {
      await supabase
        .from('data_export_requests')
        .update({
          status: 'failed',
          error_message: error.message || 'Unknown error occurred'
        })
        .eq('id', exportId);
    }

    return new Response(
      JSON.stringify({ 
        error: error.message || 'Export processing failed' 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
      }
    );
  }
});

function generateCSV(data: any): string {
  const rows: string[] = [];
  
  // Add headers
  rows.push('Category,Type,Data,Timestamp');
  
  // Add profile data
  if (data.profile_data) {
    rows.push(`Profile,Profile Information,"${JSON.stringify(data.profile_data).replace(/"/g, '""')}",${data.export_info.export_date}`);
  }
  
  // Add activity data
  data.activity_data?.forEach((activity: any) => {
    rows.push(`Activity,${activity.activity_type},"${JSON.stringify(activity).replace(/"/g, '""')}",${activity.created_at}`);
  });
  
  // Add content data
  data.content_data?.forEach((content: any) => {
    rows.push(`Content,${content.content_type || 'offer'},"${JSON.stringify(content).replace(/"/g, '""')}",${content.created_at}`);
  });
  
  return rows.join('\n');
}

function generateXML(data: any): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<data_export>
  <export_info>
    <user_id>${data.export_info.user_id}</user_id>
    <export_date>${data.export_info.export_date}</export_date>
    <export_type>${data.export_info.export_type}</export_type>
  </export_info>
  <profile_data>${xmlEscape(JSON.stringify(data.profile_data))}</profile_data>
  <activity_data>${xmlEscape(JSON.stringify(data.activity_data))}</activity_data>
  <content_data>${xmlEscape(JSON.stringify(data.content_data))}</content_data>
  <session_data>${xmlEscape(JSON.stringify(data.session_data))}</session_data>
</data_export>`;
}

function xmlEscape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}