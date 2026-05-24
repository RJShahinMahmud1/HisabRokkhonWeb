import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fphgsdjtnjgtwidahcox.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwaGdzZGp0bmpndHdpZGFoY294Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NjE3NjMsImV4cCI6MjA5NTEzNzc2M30.Hmkn0iG0AjxGoipoKbEJ4uGA2T3oeNRWuRHRWhP_Ba8';

export const supabase = createClient(supabaseUrl, supabaseKey);
