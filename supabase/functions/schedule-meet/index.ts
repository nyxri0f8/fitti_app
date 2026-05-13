// Follow this setup guide to integrate Google APIs:
// https://supabase.com/docs/guides/functions/examples/google-api-integration

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// You would need to add googleapis to import map or use esm.sh
// import { google } from "https://esm.sh/googleapis@118.0.0";

const ALLOWED_ORIGINS = [
  'http://localhost:5173', 
  'http://localhost:3000', 
  'https://fitti.org.in',
  'https://application-fitti.vercel.app'
];

serve(async (req) => {
  const origin = req.headers.get('origin');
  const isVercel = origin?.endsWith('.vercel.app');
  const isLocal = origin?.includes('localhost');
  const isProduction = origin === 'https://fitti.org.in';
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': (isVercel || isLocal || isProduction) ? origin : 'https://fitti.org.in',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Get the current user
    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (userError || !user) throw new Error('Unauthorized')

    // 2. Parse request
    const { guestId } = await req.json()
    if (!guestId) throw new Error('Guest ID is required')

    // 3. Fetch ALL Google OAuth tokens from identities table (in auth schema)
    let token = null;
    try {
      const { data: identities, error: identityError } = await supabaseClient
        .schema('auth')
        .from('identities')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', 'google')
      
      if (identityError) throw new Error(`Database Error: ${identityError.message}`);
      
      if (identities && identities.length > 0) {
        for (const identity of identities) {
          const data = identity.identity_data || {};
          // Try to find the token in any known field
          token = data.provider_token || data.access_token || data.token || identity.provider_token;
          if (token) break;
        }
      }
    } catch (e) {
      throw new Error(`Identity Lookup Failed: ${e.message}`);
    }
    
    if (!token) {
      throw new Error('REAL TOKEN MISSING: Please click "Connect Google Account" and check the "Calendar" checkbox.');
    }
    
    // Create Calendar Event with Google Meet link
    const event = {
      summary: 'Fitti Coaching Session',
      description: 'Scheduled via Fitti App.',
      start: {
        dateTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      },
      end: {
        dateTime: new Date(Date.now() + 35 * 60 * 1000).toISOString(),
      },
      conferenceData: {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      }
    };

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Google API Error:', data);
      throw new Error(`Google API Error: ${data.error?.message || 'Unknown error'}`);
    }

    const meetLink = data.hangoutLink;

    if (!meetLink) {
      throw new Error('Failed to generate Meet link from Google Calendar API');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Google Meet scheduled successfully',
        meetLink: meetLink
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
