import { getSupabaseBrowserClient } from './supabase'

export type ActivityEventInput = {
  entity: string
  action: string
  label?: string
  description?: string
  metadata?: Record<string, unknown>
}

export async function recordActivityEvent(input: ActivityEventInput) {
  const supabase = getSupabaseBrowserClient()
  if (!supabase) return false

  const { error } = await supabase.rpc('record_activity_event', {
    p_entity: input.entity,
    p_action: input.action,
    p_label: input.label ?? null,
    p_description: input.description ?? null,
    p_metadata: input.metadata ?? {},
  })

  if (error) {
    console.error('recordActivityEvent failed', error)
    return false
  }

  return true
}
