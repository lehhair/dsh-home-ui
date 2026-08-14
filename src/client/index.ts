/**
 * Browser half of the dsh-home-ui plugin: mounts the DOM-side controller
 * (the [data-dsh-home-ui] scope attribute), injects the global stylesheet
 * (home-ui.css) with this bundle as a <style data-plugin> tag, and registers
 * the WideMode preference row (settings.general.item) whose persisted mode
 * drives the [data-dsh-wide] feed-width attribute on <html>. The stock GUI
 * stays byte-identical without the plugin row.
 *
 * Visual refinements, all via the plugin-owned sheet keyed under the scope:
 *   1. Sidebar palette unified with the conversation feed (same bg-base).
 *   2. Feed header aligned with the sidebar controls (same title line).
 *   3. Header hairline replaced by a soft gradient fade band.
 *   4. Wide mode: the feed column widens beyond the stock 748px when the
 *      persisted mode is 'wide'.
 */
import type { BoundActions } from '@deepseek-ai/dsh-client-ui-slots'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls the 'settings.general.item' SlotMap declaration (the
// key's owner) into this program so the registration below typechecks.
// Imported via the workspace SRC contract (not the built lib): the lib's
// client index only re-exports types, so its `declare module SlotMap`
// side effect would not reach this compilation.
import type {} from '../../../dsh2026/deepseek-harness/packages/client/ui-settings/src/client/contract/slots.ts'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { HomeUiController } from './controller.ts'
import { WideModeRow, type WideModeRowInjected } from './WideModeRow.tsx'
import { createWideModeRowStore } from './wide-store.ts'
import { en, zh, type WideKey } from './locales.ts'
import {
  loadWideMode, saveWideMode, type WideMode,
} from './wide-settings.ts'
// Plugin-owned global stylesheet (injected as a <style data-plugin> tag).
import './home-ui.css'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** WideMode row copy. */
    'settings.wide': WideKey
  }
}

/** Namespace owning this feature's settings-row copy. */
const NS = 'settings.wide'

/** Required services (cordis fiber inject): slots/locale for the row. */
export const inject = ['slots', 'locale']

/** The <html> attribute that flips the feed into wide mode. */
export const WIDE_ATTR = 'data-dsh-wide'

/** Feed-width CSS variable value in wide mode (px; the stock default is 748). */
export const WIDE_FEED_WIDTH_PX = 1080

/** Apply the persisted mode to the DOM (the [data-dsh-wide] attribute only). */
function applyMode(mode: WideMode): void {
  if (mode === 'wide') document.documentElement.setAttribute(WIDE_ATTR, '')
  else document.documentElement.removeAttribute(WIDE_ATTR)
}

/**
 * Client plugin body: apply the persisted wide mode, provide the row, and
 * register the WideMode preference row into the General section.
 * @param ctx - client cordis context.
 */
export function apply(ctx: ClientContext): void {
  // The [data-dsh-home-ui] scope (visual refinements) mounts with the plugin.
  ctx.effect(() => {
    const controller = new HomeUiController()
    controller.mount()
    return () => { controller.dispose() }
  }, 'dsh-home-ui: DOM controller')

  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-home-ui: wide-mode row dictionaries')

  // Wide-mode preference: persist locally (this plugin has no Host settings
  // namespace), mirror it into the row store, and reflect it onto <html> as
  // [data-dsh-wide]. Selection updates the store OPTIMISTICALLY — the click
  // flips the button state immediately instead of waiting on a settings
  // round-trip that a pure-client plugin cannot rely on.
  const store = createWideModeRowStore()
  let bound: BoundActions<typeof store> | undefined
  let revision = 0
  const publish = (mode: WideMode): void => {
    applyMode(mode)
    bound?.sync(mode, revision)
    revision += 1
  }
  // Apply the persisted mode at apply time — the feed must be wide on first
  // load, not only after the settings row mounts.
  publish(loadWideMode())
  const injected = (actions: BoundActions<typeof store>): WideModeRowInjected => {
    bound = actions
    // Re-seed the row from the persisted mode before first render.
    publish(loadWideMode())
    return {
      setMode: (mode) => {
        publish(mode)
        saveWideMode(mode)
      },
    }
  }
  ctx.slots.inject('settings.general.item', () => ctx.slots.register({
    name: 'settings.general.item',
    id: 'feed-width',
    order: 30,
    store,
    locale: NS,
    inject: injected,
  }, WideModeRow))
}
