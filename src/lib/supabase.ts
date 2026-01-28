import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export const createClient = (supabaseUrl: string, supabaseKey: string) => {
    // Gracefully handle missing or invalid URL/Key during build
    if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
        const mockResponse = () => Promise.resolve({ data: null, error: null })
        const mockChain = () => ({
            select: mockChain,
            order: mockChain,
            eq: mockChain,
            single: mockResponse,
            insert: mockResponse,
            update: mockChain,
            delete: mockChain,
            then: (fn: any) => fn({ data: null, error: null })
        })

        return {
            from: mockChain,
            auth: {
                getUser: () => Promise.resolve({ data: { user: null }, error: null }),
                signInWithPassword: () => Promise.resolve({ data: { user: null }, error: null }),
                signOut: () => Promise.resolve({ error: null }),
            }
        } as any
    }
    return createSupabaseClient(supabaseUrl, supabaseKey)
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
