// supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project values
const supabaseUrl = 'https://yczmtotaoorchssnitft.supabase.co'  // e.g., 'https://your-project.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inljem10b3Rhb29yY2hzc25pdGZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MTM0NDQsImV4cCI6MjA2NDM4OTQ0NH0.ja0reHLscl7OLPbfvuVdL0gdmCD0_eITm4V79PjC3Xc'  // Your project's anon/public key

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Optional: Configure additional options
export const supabaseOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
}