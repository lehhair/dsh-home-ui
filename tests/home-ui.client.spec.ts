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

  it('aligns the feed header top with the sidebar 6px control start', () => {
    expect(css).toContain(`[data-slot='conversation.session.header'] header`)
    expect(css).toContain(`padding-top: 6px`)
  })

  it('raises the sidebar control row to the header title line', () => {
    // The sidebar-EXPANDED, details-collapsed state (home feed default): the
    // shell root loses its 6px top padding and the logo row shrinks 60->52px
    // with its 8px top padding removed, so the controls' center aligns with
    // the header title. The :not([data-sidebar-collapsed]) pin keeps the
    // details-open state at stock geometry.
    expect(css).toContain(`div[data-details-collapsed]:not([data-sidebar-collapsed])`)
    expect(css).toContain(`> :first-child > [data-slot='sidebar'] > :first-child`)
    expect(css).toContain(`padding-top: 0`)
    expect(css).toContain(`height: 52px`)
  })

  it('aligns the collapsed rail toggle with the header title line', () => {
    // The collapsed state carries data-sidebar-collapsed on the frame: the
    // shell root's top padding drops 18px -> 4px so the 36px rail control
    // box centers on the same line as the expanded controls and the title.
    expect(css).toContain(`div[data-sidebar-collapsed]`)
    expect(css).toContain(`> :first-child > [data-slot='sidebar'] > :first-child`)
    expect(css).toContain(`padding-top: 4px`)
  })

  it('keeps the collapse animation mid-state on the title line', () => {
    // The frame flips data-sidebar-collapsed immediately while the wide
    // content fades out (~150ms) before the rail settles; without a
    // mid-state rule the logo row snaps back to stock 60px/8px and the
    // control center jumps 22 -> 34 during the fade. The :has() rules pin
    // the fading logo row (still two buttons: brand + toggle) to the same
    // 52px / 0 geometry and 0 top padding as expanded.
    expect(css).toContain(`:has(> :first-child > :nth-child(2))`)
    expect(css).toContain(`padding-top: 0`)
    expect(css).toContain(`> :first-child > :first-child:has(> :nth-child(2))`)
    expect(css).toContain(`height: 52px`)
  })

  it('replaces the header hairline with a gradient fade band', () => {
    // The ::after band must read the feed background and fade to transparent.
    expect(css).toContain(`header::after`)
    expect(css).toContain(`linear-gradient(180deg, var(--dsw-alias-bg-base), transparent)`)
    expect(css).toContain(`height: 32px`)
    // The band hangs BELOW the header (PiUI's top-full shadow), not inside it.
    expect(css).toContain(`top: 100%`)
  })
})
