import { createClient } from '@supabase/supabase-js';

// 1. Leemos las variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 2. Debugging (Esto aparecerá en los logs de Vercel si falla)
if (!supabaseUrl) {
  console.error("🚨 ERROR CRÍTICO: No encuentro la URL de Supabase.");
  console.error("Valor leído:", supabaseUrl);
}

if (!supabaseKey) {
  console.error("🚨 ERROR CRÍTICO: No encuentro la KEY de Supabase.");
}

// 3. Creamos el cliente (con una validación extra para que no explote el build)
// Si no hay URL, usamos una string vacía para que el build termine (aunque la app no funcione, podremos ver el log)
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co", 
  supabaseKey || "placeholder-key"
);