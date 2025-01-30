import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase URL and anon key
const supabaseUrl = 'https://pgxgchqognscoildtdqo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBneGdjaHFvZ25zY29pbGR0ZHFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyNDA5MjMsImV4cCI6MjA1MzgxNjkyM30.zLSzIwKrbrt_zBTI8j02zWo18-dTYZyFzvZpfTU80jY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
