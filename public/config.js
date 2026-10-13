// ============================================================
// Café de la Place — Configuration Supabase
// ============================================================

const SUPABASE_URL      = 'https://cmvohltfenbslczgcrou.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_rkPoxX_kOsYJJcXbpMLCHg_xr88XaYo';

// Export global pour les scripts frontend
if (typeof window !== 'undefined') {
  window.SUPABASE_CONFIG = { url: SUPABASE_URL, key: SUPABASE_ANON_KEY };
}
