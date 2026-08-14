/**
 * DOM-side home-ui controller: the non-React half of the plugin. It owns
 * exactly one thing — the `[data-dsh-home-ui]` scope attribute on <html>
 * that every rule in home-ui.css is keyed under. mount() sets it, dispose()
 * removes it, so uninstalling the plugin leaves the stock GUI byte-identical
 * (the injected <style data-plugin> tag stays inert once the scope is gone).
 */

/** The <html> attribute that scopes the plugin''s global stylesheet. */
export const SCOPE_ATTR = 'data-dsh-home-ui'

/** Test-facing surface of the controller. */
export interface HomeUiControllerHandle {
  /** Install the scope attribute; idempotent. */
  mount(): void
  /** Remove the scope attribute; idempotent. */
  dispose(): void
}

/** The DOM-side controller (see module doc). */
export class HomeUiController implements HomeUiControllerHandle {
  #html: HTMLElement | null = null
  #mounted = false
  #disposed = false

  /** Install the scope attribute. Safe to call once; a second call is a no-op. */
  mount(): void {
    if (this.#mounted) return
    this.#mounted = true
    const html = document.documentElement
    this.#html = html
    html.setAttribute(SCOPE_ATTR, '')
  }

  /** Remove the scope attribute. Safe to call twice. */
  dispose(): void {
    if (!this.#mounted || this.#disposed) return
    this.#disposed = true
    this.#mounted = false
    this.#html?.removeAttribute(SCOPE_ATTR)
    this.#html = null
  }
}