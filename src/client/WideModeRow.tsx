/**
 * WideMode preference row registered into the General section item slot:
 * title + two width-mode cubes (Standard / Wide), matching the Appearance
 * row's cube language. Selection follows the persisted mode.
 */
import clsx from 'clsx'
import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type { WideMode } from './wide-settings.ts'
import type { WideKey } from './locales.ts'
import type { createWideModeRowStore } from './wide-store.ts'
import css from './WideModeRow.module.css'

/** Injected business face: the mode write (t rides the standard locale seat). */
export interface WideModeRowInjected {
  /** Switch the feed width mode. */
  setMode: (mode: WideMode) => void
}

/** Full component props: runtime share + store share + locale seat + injected face. */
export type WideModeRowComponentProps =
  PropsRuntime<'settings.general.item'> & PropsStore<ReturnType<typeof createWideModeRowStore>>
  & PropsLocale<'settings.wide'> & WideModeRowInjected

/** Cube order and label keys. */
const CUBES: readonly { id: WideMode; labelKey: WideKey }[] = [
  { id: 'standard', labelKey: 'wide.standard' },
  { id: 'wide', labelKey: 'wide.wide' },
]

/**
 * Render the WideMode row.
 * @param props - composed slot props.
 * @returns the row element tree.
 */
export function WideModeRow({ t, setMode, useStore }: WideModeRowComponentProps) {
  const mode = useStore(s => s.mode)
  return (
    <div className={css.group}>
      <div className={css.rowText}>
        <div className={css.title}>{t('wide.title')}</div>
        <div className={css.desc}>{t('wide.desc')}</div>
      </div>
      <div className={css.cubeRow}>
        {CUBES.map(({ id, labelKey }) => (
          <button
            key={id}
            type="button"
            className={clsx(css.modeCube, mode === id && css.selected)}
            aria-pressed={mode === id}
            onClick={() => { setMode(id) }}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>
    </div>
  )
}
