import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// --- EL TRUCO ANTICAÍDAS ---
// Si la variable no existe (durante el build), usamos una cadena vacía o placeholder
// para que createClient no explote y deje terminar la construcción.
const url = supabaseUrl || "https://placeholder.supabase.co";
const key = supabaseKey || "placeholder-key";

export const supabase = createClient(url, key);