import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const createClient = () => {
  // Return a client that will work during SSR/build time
  // The actual values will be available at runtime in the browser
  if (!supabaseUrl || !supabaseAnonKey) {
    // During static build, return a placeholder that will be replaced at runtime
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder-key'
    )
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
