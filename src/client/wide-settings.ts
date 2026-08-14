/** Wide-mode preference contract shared by the settings row and the DOM flip. */

/** Modes accepted at the settings boundary. */
export const WIDE_MODES = ['standard', 'wide'] as const

/** Settings namespace owned by the home-ui plugin. */
export const WIDE_SETTINGS_NAMESPACE = 'dsh-home-ui'

/** Field carrying the selected feed width mode. */
export const WIDE_MODE_FIELD = 'widthMode'

/** localStorage key persisting the selected feed width mode. */
export const WIDE_MODE_STORAGE_KEY = 'dsh-home-ui.widthMode'

/** Feed width mode persisted by the WideMode row. */
export type WideMode = typeof WIDE_MODES[number]

/** Default mode when no override exists. */
export const DEFAULT_MODE: WideMode = 'standard'

/** Durable wide-mode section shape (the browser persists it locally). */
export interface WideSettings {
  /** Selected feed width mode. */
  widthMode: WideMode
}

/**
 * Narrow one stored value to a persistable mode.
 * @param value - value read from storage or crossing a boundary.
 * @returns whether the value is a built-in mode.
 */
export function isWideMode(value: unknown): value is WideMode {
  return WIDE_MODES.some(mode => mode === value)
}

/**
 * Read the persisted mode from localStorage (missing, malformed, or
 * unavailable storage falls back to the default).
 * @returns the persisted mode or the default.
 */
export function loadWideMode(): WideMode {
  try {
    const raw = localStorage.getItem(WIDE_MODE_STORAGE_KEY)
    if (raw !== null && isWideMode(raw)) return raw
  } catch {
    // Storage unavailable (private mode, quota) — fall through to default.
  }
  return DEFAULT_MODE
}

/**
 * Persist a mode to localStorage; storage failures only disable persistence.
 * @param mode - the mode to store.
 */
export function saveWideMode(mode: WideMode): void {
  try {
    localStorage.setItem(WIDE_MODE_STORAGE_KEY, mode)
  } catch {
    // Storage unavailable — the mode still applies for this session.
  }
}
