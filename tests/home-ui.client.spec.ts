/**
 * dsh-home-ui: scope-controller behavior and stylesheet contract tests.
 *
 * The controller is a plain DOM attribute owner (mount/dispose), asserted in
 * jsdom. The stylesheet is read from disk and checked for the three
 * stable-hook refinements and their scope discipline — the same static
 * contract the official ui-theme tests apply to design-platform.css.
 *
 * @vitest-environment jsdom
 */

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { HomeUiController, SCOPE_ATTR } from '../src/client/controller.ts'

const css = readFileSync(resolve(process.cwd(), 'src/client/home-ui.css'), 'utf8')

describe('HomeUiController (jsdom)', () => {
  it('mount sets the scope attribute on <html>', () => {
    document.documentElement.removeAttribute(SCOPE_ATTR)
    const controller = new HomeUiController()
    controller.mount()
    expect(document.documentElement.hasAttribute(SCOPE_ATTR)).toBe(true)
    controller.dispose()
  })

  it('mount is idempotent (second call is a no-op)', () => {
    document.documentElement.removeAttribute(SCOPE_ATTR)
    const controller = new HomeUiController()
    controller.mount()
    controller.mount()
    expect(document.documentElement.getAttribute(SCOPE_ATTR)).toBe('')
    controller.dispose()
  })

  it('dispose removes the scope attribute', () => {
    document.documentElement.removeAttribute(SCOPE_ATTR)
    const controller = new HomeUiController()
    controller.mount()
    expect(document.documentElement.hasAttribute(SCOPE_ATTR)).toBe(true)
    controller.dispose()
    expect(document.documentElement.hasAttribute(SCOPE_ATTR)).toBe(false)
  })

  it('dispose is idempotent', () => {
    document.documentElement.removeAttribute(SCOPE_ATTR)
    const controller = new HomeUiController()
    controller.mount()
    controller.dispose()
    controller.dispose()
    expect(document.documentElement.hasAttribute(SCOPE_ATTR)).toBe(false)
  })
})

describe('home-ui.css stylesheet contract', () => {
  it('every rule is scoped under [data-dsh-home-ui]', () => {
    // No rule may apply without the plugin scope attribute: stripping the
    // scope prefix from the sheet must leave no bare global selectors. The
    // sheet is comment + scoped rules only.
    const ruleBodies = css
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split(/\n\s*}/)
      .map(part => part.trim())
      .filter(part => part.length > 0)
    for (const body of ruleBodies) {
      const selector = body.split(/\{/)[0]?.trim() ?? ''
      if (selector === '') continue
      expect(selector, `unscoped selector: ${selector}`).toContain(`[data-dsh-home-ui]`)
    }
  })

  it('rebinds the sidebar fill token to the feed base in both schemes', () => {
    expect(css).toContain(`--dsw-specific-sidebar-fill: var(--dsw-alias-bg-base)`)
    // The token must be rebound on plain body AND on the dark variant.
    const darkRebind = /body\[data-ds-dark-theme\]\s*\{\s*--dsw-specific-sidebar-fill:\s*var\(--dsw-alias-bg-base\)/.test(css)
    expect(darkRebind).toBe(true)
  })

  it('repaints the layout sidebar column off the old tint', () => {
    // The frame union selector + first-child must paint bg-base on the column.
    expect(css).toContain(`div[data-sidebar-collapsed] > :first-child`)
    expect(css).toContain(`div[data-details-collapsed] > :first-child`)
    expect(css).toContain(`background: var(--dsw-alias-bg-base)`)
  })

  it('lowers the header title onto the sidebar control line', () => {
    // The sidebar's top control row centers at 36 in both expanded and
    // collapsed states (STOCK geometry — this plugin never touches the
    // sidebar's own padding/height). The stock header title sits at center
    // 28 (12px top padding); 20px top padding drops it to center 36,
    // aligned with the sidebar controls. The header element is the page's
    // only <header>, wrapped by the conversation.session.header slot seat.
    expect(css).toContain(`[data-slot='conversation.session.header'] header`)
    expect(css).toContain(`padding-top: 20px`)
  })

  it('excludes split panes from the title lowering', () => {
    // The split-panes plugin renders the stock conversation inside a padded
    // frame where the stock 12px already lands the title on the sidebar's
    // line (center ~37); lowering it there would push the pane header off
    // the sidebar. The split container carries a stable data-direction
    // attribute (never a hashed class), so the pane-header rule restores
    // the stock 12px for headers inside it.
    expect(css).toContain(`[data-slot='conversation.panes'] [data-direction]`)
    expect(css).toContain(`[data-slot='conversation.session.header'] header`)
    expect(css).toContain(`padding-top: 12px`)
  })

  it('does not modify the sidebar geometry', () => {
    // The alignment is achieved entirely by lowering the header title; the
    // sidebar shell root and logo row keep their stock padding/height, so
    // no data-sidebar-collapsed / data-details-collapsed geometry rules
    // may exist in the sheet.
    expect(css).not.toContain(`height: 52px`)
    expect(css).not.toContain(`padding-top: 4px`)
    expect(css).not.toContain(`padding-top: 0`)
    expect(css).not.toContain(`:has(`)
  })

  it('replaces the header hairline with a gradient fade band', () => {
    // The ::after band must read the feed background and fade to transparent.
    expect(css).toContain(`header::after`)
    expect(css).toContain(`linear-gradient(180deg, var(--dsw-alias-bg-base), transparent)`)
    expect(css).toContain(`height: 32px`)
    // The band hangs BELOW the header (OpenCodeUI's top-full shadow), not inside it.
    expect(css).toContain(`top: 100%`)
  })

  it('widens the feed in wide mode via the shared width variable', () => {
    // Wide mode rewrites --dsh-chat-content-width on the conversation root
    // ([data-phase]), the one variable every column surface reads. The
    // selector combines the plugin scope and the wide attribute, both on
    // <html>.
    expect(css).toContain(`[data-dsh-home-ui][data-dsh-wide] [data-phase]`)
    expect(css).toContain(`--dsh-chat-content-width: 1080px`)
    // No compact mode: the preference is Standard / Wide only.
    expect(css).not.toContain(`data-dsh-compact`)
    expect(css).not.toContain(`640px`)
  })

  it('persists and loads the wide mode via localStorage', () => {
    // The preference survives reloads through localStorage (this plugin has
    // no Host settings namespace). jsdom provides localStorage.
    const { loadWideMode, saveWideMode, isWideMode, WIDE_MODE_STORAGE_KEY, DEFAULT_MODE } = require('../src/client/wide-settings.ts') as typeof import('../src/client/wide-settings.ts')
    localStorage.removeItem(WIDE_MODE_STORAGE_KEY)
    expect(loadWideMode()).toBe(DEFAULT_MODE)
    saveWideMode('wide')
    expect(loadWideMode()).toBe('wide')
    expect(isWideMode('standard')).toBe(true)
    expect(isWideMode('wide')).toBe(true)
    expect(isWideMode('compact')).toBe(false)
    localStorage.setItem(WIDE_MODE_STORAGE_KEY, 'garbage')
    expect(loadWideMode()).toBe(DEFAULT_MODE)
    localStorage.removeItem(WIDE_MODE_STORAGE_KEY)
  })
})
