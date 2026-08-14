/** `settings.wide` namespace dictionaries (the WideMode row's copy). */

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'wide.title': '信息流宽度',
  'wide.desc': '对话信息流的排版宽度。',
  'wide.standard': '标准',
  'wide.wide': '宽屏',
} satisfies Record<string, string>

/** The settings.wide namespace key union. */
export type WideKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'wide.title': 'Feed width',
  'wide.desc': 'The conversation feed layout width.',
  'wide.standard': 'Standard',
  'wide.wide': 'Wide',
} satisfies Record<WideKey, string>
