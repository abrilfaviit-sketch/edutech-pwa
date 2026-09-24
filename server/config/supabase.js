const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Faltan variables de entorno para la configuración de Supabase.');
}

// Inicialización usando service_role para el servidor
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = { supabase };