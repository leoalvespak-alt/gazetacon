'use server'

import { supabase } from '@/lib/supabase'

export async function subscribeToNewsletter(email: string, source: string = 'generic') {
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return { success: false, message: 'Email inválido.' }
  }

  try {
    const { error } = await supabase
      .from('subscribers')
      .insert({ email, source })

    if (error) {
      if (error.code === '23505') { // Unique violation
        return { success: true, message: 'Você já está inscrito!' }
      }
      throw error
    }

    return { success: true, message: 'Inscrição realizada com sucesso!' }
  } catch (err) {
    console.error('Newsletter error:', err)
    return { success: false, message: 'Erro ao se inscrever. Tente novamente.' }
  }
}
