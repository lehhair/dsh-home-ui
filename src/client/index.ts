/**
 * Browser half of the dsh-home-ui plugin: mounts the DOM-side controller
 * (the [data-dsh-home-ui] scope attribute) and injects the global stylesheet
 * (home-ui.css) with this bundle as a <style data-plugin> tag. The stock GUI
 * stays byte-identical without the plugin row.
 *
 * Visual refinements, all via the plugin-owned sheet keyed under the scope:
 *   1. Sidebar palette unified with the conversation feed (same bg-base).
 *   2. Feed header aligned with the sidebar controls (same 6px top start).
 *   3. Header hairline replaced by a soft gradient fade band.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { HomeUiController } from './controller.ts'
// Plugin-owned global stylesheet (injected as a <style data-plugin> tag).
import './home-ui.css'

/** Install the home-ui surfaces: the DOM controller (one effect). */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => {
    const controller = new HomeUiController()
    controller.mount()
    return () => { controller.dispose() }
  }, 'dsh-home-ui: DOM controller')
}