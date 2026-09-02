export type CenterSettings = {
  name: string
  responsibleName: string
  phone: string
  address: string
}

const STORAGE_KEY = 'ard-kanaan:center-settings'

export const DEFAULT_CENTER_SETTINGS: CenterSettings = {
  name: 'أرض كنعان',
  responsibleName: '',
  phone: '',
  address: '',
}

export function getCenterSettings(): CenterSettings {
  if (typeof window === 'undefined') return DEFAULT_CENTER_SETTINGS

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_CENTER_SETTINGS
    const parsed = JSON.parse(raw) as Partial<CenterSettings>
    return {
      name: typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name.trim() : DEFAULT_CENTER_SETTINGS.name,
      responsibleName: typeof parsed.responsibleName === 'string' ? parsed.responsibleName.trim() : '',
      phone: typeof parsed.phone === 'string' ? parsed.phone.trim() : '',
      address: typeof parsed.address === 'string' ? parsed.address.trim() : '',
    }
  } catch {
    return DEFAULT_CENTER_SETTINGS
  }
}

export function saveCenterSettings(settings: CenterSettings) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
    name: settings.name.trim() || DEFAULT_CENTER_SETTINGS.name,
    responsibleName: settings.responsibleName.trim(),
    phone: settings.phone.trim(),
    address: settings.address.trim(),
  }))
}
