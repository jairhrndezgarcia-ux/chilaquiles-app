import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// --- EL TRUCO (EL PARACAÍDAS) ---
// Usamos "||" para que si la variable está vacía, use el texto de relleno.
const url = supabaseUrl || "https://placeholder.supabase.co";
const key = supabaseKey || "placeholder-key";

// --- LA LÍNEA FINAL (IMPORTANTE) ---
// Fíjate que aquí adentro dice 'url' y 'key', NO 'supabaseUrl'
export const supabase = createClient(url, key);