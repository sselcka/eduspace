import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://rstofsvcpadtduhavgcd.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdG9mc3ZjcGFkdGR1aGF2Z2NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNjAwNDUsImV4cCI6MjA3OTkzNjA0NX0.5l-RnizecKLRVFdYDhh-az52LgVVt_Us8VhM_OQyIB8";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
