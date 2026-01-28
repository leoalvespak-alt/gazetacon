import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Await params correctly in Next.js 15/16
  const { slug } = await params
  const supabase = await createClient()

  // Buscar link
  const { data: link, error } = await supabase
    .from('affiliate_links')
    .select('destination_url, active')
    .eq('slug', slug)
    .single()

  if (error || !link || !link.active) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Incrementar clicks de forma assíncrona (fire and forget)
  // Nota: Em serverless isso pode não garantir execução, mas para MVP ok.
  // Idealmente usar RPC ou Queue.
  const { error: rpcError } = await supabase.rpc('increment_affiliate_click', { link_slug: slug })
  
  if (rpcError) {
      console.error("Erro ao incrementar click:", rpcError)
      // Tentar update manual se RPC falhar (fallback)
      await supabase.from('affiliate_links')
        .update({ clicks: link.clicks ? link.clicks + 1 : 1 }) // This won't work perfectly due to concurrency but OK for MVP
        .eq('slug', slug)
  }

  // Redirecionar
  return NextResponse.redirect(new URL(link.destination_url, request.url))
}
