// supabaseClient.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Replace these with your actual Supabase project values
const supabaseUrl = 'https://xrxhopnghsbqamvfnorl.supabase.co'
const supabaseAnonKey = 'YeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyeGhvcG5naHNicWFtdmZub3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MDE3MjUsImV4cCI6MjA2NDM3NzcyNX0.s1MpdgizjtiIy3sPq3B_ZyE-Mfw-9ZsR0Tl-FaUlm1E'  // Your project's anon/public key

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Optional: Configure additional options
export const supabaseOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
}