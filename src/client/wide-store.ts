/**
 * WideMode row slot store: a mirror of the wide-mode service state. The
 * plugin's apply-world change listener is the only writer; the row component
 * reads via props.useStore.
 */
import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-runtime/client'
import type { WideMode } from './wide-settings.ts'

/** Store state mirrored from the wide-mode service. */
export interface WideModeRowState {
  /** Persisted mode (selection state reads this, never a resolved value). */
  mode: WideMode
  /** Service revision; -1 until first sync so revision 0 lands as a change. */
  revision: number
}

/** Declared action shape giving the exported factory a stable return type. */
type WideModeRowActions = {
  sync: (draft: WideModeRowState, mode: WideMode, revision: number) => void
}

/**
 * Declares the WideMode row state and write surface.
 * @returns the store handle.
 */
export function createWideModeRowStore(): EngineStoreHandle<WideModeRowState, WideModeRowActions> {
  return defineStore({
    init: (): WideModeRowState => ({ mode: 'standard', revision: -1 }),
    actions: {
      sync: (d, mode: WideMode, revision: number) => {
        if (revision <= d.revision) return
        d.mode = mode
        d.revision = revision
      },
    },
  })
}
