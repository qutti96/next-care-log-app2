//デバッグAPI作成
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = createServerSupabase()

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    return NextResponse.json({
      session: session ? {
        user: { id: session.user.id, email: session.user.email },
        expires_at: session.expires_at,
      } : null,
      user: user ? { id: user.id, email: user.email } : null,
      errors: {
        session: sessionError?.message,
        user: userError?.message,
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ 
      session: null,
      user: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
}
